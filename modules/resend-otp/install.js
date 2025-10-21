import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { fileURLToPath } from "url";
import { ensureDir, renderTemplate } from "../../utils/filePaths.js";
import {
  installDepsWithChoice,
  isValidNodeProject,
  detectPackageManager,
} from "../../utils/packageManager.js";
import { injectEnvVars } from "../../utils/injectEnvVars.js";
import { ensureAppJsHasOtpSetup } from "./utils/ensureAppJsHasOtpSetup.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function installOtp(targetPath) {
  // 1️⃣ Validate Node project
  if (!isValidNodeProject(targetPath)) {
    console.error(
      "❌ Not a valid Node.js project (missing package.json). Aborting."
    );
    return;
  }

  console.log("\x1b[1m\x1b[32mInstalling Resend OTP module...\x1b[0m");

  // 2️⃣ Detect package manager
  const packageManager = detectPackageManager(targetPath);
  if (packageManager) console.log(` ${packageManager} detected`);
  else console.warn(" Could not detect package manager.");

  // 3️⃣ Ask for JavaScript / TypeScript
  const { language } = await inquirer.prompt([
    {
      type: "list",
      name: "language",
      message: "Which version do you want to add?",
      choices: ["JavaScript", "TypeScript"],
      default: "JavaScript",
    },
  ]);

  // 4️⃣ Determine entry file path
  const defaultEntry = language === "TypeScript" ? "src/app.ts" : "app.js";
  let { entryFile } = await inquirer.prompt([
    {
      type: "input",
      name: "entryFile",
      message: "Enter your project entry file (relative to root):",
      default: defaultEntry,
    },
  ]);

  let appPath = path.join(targetPath, entryFile);

  // Auto-detect TS entry file if missing
  if (language === "TypeScript" && !fs.existsSync(appPath)) {
    const srcDir = path.join(targetPath, "src");
    if (fs.existsSync(srcDir)) {
      const tsFiles = fs.readdirSync(srcDir).filter((f) => f.endsWith(".ts"));
      if (tsFiles.length > 0) {
        entryFile = path.join("src", tsFiles[0]);
        appPath = path.join(targetPath, entryFile);
        console.log(`ℹ️ Auto-detected TypeScript entry file: ${entryFile}`);
      }
    }
  }

  if (!fs.existsSync(appPath)) {
    console.error(`❌ Entry file "${entryFile}" not found. Aborting.`);
    return;
  }

  // 5️⃣ Ask for environment variables (Resend credentials)
  const { apiKey, fromEmail } = await inquirer.prompt([
    {
      type: "input",
      name: "apiKey",
      message: "Enter your Resend API Key (leave empty for sample):",
    },
    {
      type: "input",
      name: "fromEmail",
      message: "Enter your FROM email address (leave empty for sample):",
    },
  ]);

  // Default fallback values
  const envVars = {
    RESEND_API_KEY: apiKey || "sample-resend-api-key",
    FROM_EMAIL: fromEmail || "onboarding@resend.dev",
  };

  // Inject .env values
  injectEnvVars(targetPath, envVars);
  console.log("\x1b[32m%s\x1b[0m", " .env updated with Resend credentials");

  // 6️⃣ Install dependencies
  const runtimeDeps = ["resend", "express"];
  const devDeps =
    language === "TypeScript"
      ? ["typescript", "ts-node", "@types/node", "@types/express"]
      : [];

  if (packageManager) {
    await installDepsWithChoice(targetPath, runtimeDeps, packageManager, false);
    if (devDeps.length > 0)
      await installDepsWithChoice(targetPath, devDeps, packageManager, true);
  }

  // 7️⃣ Patch entry file
  try {
    ensureAppJsHasOtpSetup(appPath, language);
  } catch (err) {
    console.error("❌ Failed to inject OTP setup:", err.message);
    return;
  }

  // 8️⃣ Generate controllers, routes, and middleware
  const baseDir =
    language === "TypeScript" ? path.join(targetPath, "src") : targetPath;

  const controllersDir = path.join(baseDir, "controllers");
  const routesDir = path.join(baseDir, "routes");
  const middlewareDir = path.join(baseDir, "middleware");

  ensureDir(controllersDir);
  ensureDir(routesDir);
  ensureDir(middlewareDir);

  const templateDir = path.join(__dirname, "templates", language.toLowerCase());

  // 🧩 Controllers
  renderTemplate(
    path.join(templateDir, "controllers", "otpFunctions.ejs"),
    path.join(
      controllersDir,
      `otpFunctions.${language === "TypeScript" ? "ts" : "js"}`
    ),
    {}
  );

  renderTemplate(
    path.join(templateDir, "controllers", "otp.ejs"),
    path.join(controllersDir, `otp.${language === "TypeScript" ? "ts" : "js"}`),
    {}
  );

  // 🧩 Routes
  renderTemplate(
    path.join(templateDir, "routes", "otpRoutes.ejs"),
    path.join(
      routesDir,
      `otpRoutes.${language === "TypeScript" ? "ts" : "js"}`
    ),
    {}
  );

  // 🧩 Middleware
  renderTemplate(
    path.join(templateDir, "middleware", "ratelimit.ejs"),
    path.join(
      middlewareDir,
      `ratelimit.${language === "TypeScript" ? "ts" : "js"}`
    ),
    {}
  );

  console.log(
    "📂 OTP controllers, routes, and middleware created successfully!"
  );
  console.log("\x1b[1m\x1b[92mResend OTP setup complete!\x1b[0m");
}

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ensureDir, renderTemplate } from "../../utils/filePaths.js";
import {
  installDepsWithChoice,
  detectPackageManager,
} from "../../utils/packageManager.js";
import { injectEnvVars } from "../../utils/injectEnvVars.js";
import { ensureAppJsHasOtpSetup } from "./utils/ensureAppJsHasOtpSetup.js";
import { log } from "../../utils/moduleUtils.js";
import { ensureNodeProject } from "../../utils/validProject.js";

//    Import from Clack
import { select, text, intro, outro, spinner, cancel } from "@clack/prompts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function installOtp(targetPath) {
  log.success(" Resend OTP Module Setup");

  // 1️⃣ Ensure project exists or create one
  const { success, pkgManager } = await ensureNodeProject(targetPath);
  if (!success) {
    outro("Aborted: Not a valid Node.js project.");
    return;
  }

  log.info("Installing Resend OTP to your project...");

  // 2️⃣ Detect or reuse package manager
  const packageManager = pkgManager || detectPackageManager(targetPath);
  if (packageManager) {
    log.detect(` ${packageManager} detected`);
  } else {
    log.detect(" Could not detect package manager.");
  }

  // 3️⃣ Ask for JS / TS
  const language = await select({
    message: "Which version do you want to add for this module?",
    options: [
      { label: "JavaScript", value: "JavaScript" },
      { label: "TypeScript", value: "TypeScript" },
    ],
    initialValue: "JavaScript",
  });
  if (language === cancel) {
    outro("Cancelled by user.");
    return;
  }

  // 4️⃣ Entry file
  const defaultEntry = language === "TypeScript" ? "src/app.ts" : "app.js";
  const entryFile = await text({
    message: "Enter your project entry file (relative to root):",
    placeholder: defaultEntry,
    initialValue: defaultEntry,
  });
  if (entryFile === cancel) {
    outro("Cancelled by user.");
    return;
  }

  let appPath = path.join(targetPath, entryFile);

  // Auto-detect TS entry file if missing
  if (language === "TypeScript" && !fs.existsSync(appPath)) {
    const srcDir = path.join(targetPath, "src");
    if (fs.existsSync(srcDir)) {
      const tsFiles = fs.readdirSync(srcDir).filter((f) => f.endsWith(".ts"));
      if (tsFiles.length > 0) {
        entryFile = path.join("src", tsFiles[0]);
        appPath = path.join(targetPath, entryFile);
        log.detect(`ℹ️ Auto-detected TypeScript entry file: ${entryFile}`);
      }
    }
  }

  if (!fs.existsSync(appPath)) {
    log.error(` Entry file "${entryFile}" not found. Aborting.`);
    outro("Please create the entry file and run again.");
    return;
  }

  // 5️⃣ Ask for credentials
  const apiKey = await text({
    message: "Enter your Resend API Key (leave empty for sample):",
    placeholder: "sample-resend-api-key",
  });
  if (apiKey === cancel) {
    outro("Cancelled by user.");
    return;
  }

  const fromEmail = await text({
    message: "Enter your FROM email address (leave empty for sample):",
    placeholder: "onboarding@resend.dev",
  });
  if (fromEmail === cancel) {
    outro("Cancelled by user.");
    return;
  }

  // 6️⃣ Install dependencies
  const runtimeDeps = ["resend", "express", "express-rate-limit"];
  const devDeps =
    language === "TypeScript"
      ? ["typescript", "ts-node", "@types/node", "@types/express"]
      : [];

  const spin = spinner();
  spin.start("Installing dependencies...");
  try {
    await installDepsWithChoice(targetPath, runtimeDeps, packageManager, false);
    if (devDeps.length > 0)
      await installDepsWithChoice(targetPath, devDeps, packageManager, true);
    spin.stop("Dependencies installed successfully.");
  } catch (err) {
    spin.stop("Failed to install dependencies.");
    log.error(err.message);
    return;
  }

  // 7️⃣ Patch entry file
  try {
    ensureAppJsHasOtpSetup(appPath, language);
  } catch (err) {
    log.error(`Failed to inject OTP setup: ${err.message}`);
    outro("Aborting due to errors.");
    return;
  }

  // 8️⃣ Generate controllers/routes/middleware
  const baseDir =
    language === "TypeScript" ? path.join(targetPath, "src") : targetPath;

  const controllersDir = path.join(baseDir, "controllers");
  const routesDir = path.join(baseDir, "routes");
  const middlewareDir = path.join(baseDir, "middleware");

  ensureDir(controllersDir);
  ensureDir(routesDir);
  ensureDir(middlewareDir);

  const templateDir = path.join(__dirname, "templates", language.toLowerCase());

  renderTemplate(
    path.join(templateDir, "controllers", "otpFunctions.ejs"),
    path.join(
      controllersDir,
      `otpFunctions.${language === "TypeScript" ? "ts" : "js"}`
    )
  );

  renderTemplate(
    path.join(templateDir, "controllers", "otp.ejs"),
    path.join(controllersDir, `otp.${language === "TypeScript" ? "ts" : "js"}`)
  );

  renderTemplate(
    path.join(templateDir, "routes", "otpRoutes.ejs"),
    path.join(routesDir, `otpRoutes.${language === "TypeScript" ? "ts" : "js"}`)
  );

  renderTemplate(
    path.join(templateDir, "middleware", "ratelimit.ejs"),
    path.join(
      middlewareDir,
      `ratelimit.${language === "TypeScript" ? "ts" : "js"}`
    )
  );

  // 9️⃣ Inject env vars
  const envVars = {
    RESEND_API_KEY: apiKey || "sample-resend-api-key",
    FROM_EMAIL: fromEmail || "onboarding@resend.dev",
  };
  injectEnvVars(targetPath, envVars);

  if (apiKey || fromEmail)
    log.detect("env updated with credentials you provided");
  else log.detect(".env created with sample values.");

  outro("Resend OTP setup complete!");
}

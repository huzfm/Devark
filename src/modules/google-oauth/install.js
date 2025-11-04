import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { fileURLToPath } from "url";
import { ensureDir, renderTemplate } from "../../utils/filePaths.js";
import {
  installDepsWithChoice,
  detectPackageManager,
} from "../../utils/packageManager.js";
import { injectEnvVars } from "../../utils/injectEnvVars.js";
import { ensureAppJsHasGoogleOAuthSetup } from "./utils/ensureAppJsHasOAuthSetup.js";
import { log } from "../../utils/moduleUtils.js";
import { ensureNodeProject } from "../../utils/validProject.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function installGoogleOAuth(targetPath) {
  // 1️⃣ Ensure valid Node.js project
  const { success, pkgManager } = await ensureNodeProject(targetPath);
  if (!success) return;

  log.info("Installing Google OAuth module into your project...");

  // 2️⃣ Detect or reuse package manager
  const packageManager = pkgManager || detectPackageManager(targetPath);
  if (packageManager) log.detect(` ${packageManager} detected`);
  else log.detect(" Could not detect package manager.");

  // 3️⃣ Choose language (JS/TS)
  const { language } = await inquirer.prompt([
    {
      type: "list",
      name: "language",
      message: "Which version do you want to add?",
      choices: ["JavaScript", "TypeScript"],
      default: "JavaScript",
    },
  ]);

  // 4️⃣ Determine entry file
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

  // 5️⃣ Auto-detect TS entry file if missing
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
    log.error(`❌ Entry file "${entryFile}" not found. Aborting.`);
    return;
  }

  // 6️⃣ Ask for Google credentials
  const creds = await inquirer.prompt([
    {
      type: "input",
      name: "GOOGLE_CLIENT_ID",
      message: "Enter your Google Client ID (leave empty for sample):",
    },
    {
      type: "input",
      name: "GOOGLE_CLIENT_SECRET",
      message: "Enter your Google Client Secret (leave empty for sample):",
    },
    {
      type: "input",
      name: "GOOGLE_CALLBACK_URL",
      message:
        "Enter your Google Callback URL (default http://localhost:3000/auth/google/callback):",
    },
    {
      type: "input",
      name: "SESSION_SECRET",
      message: "Enter your session secret (leave empty for sample):",
    },
  ]);

  // 7️⃣ Install dependencies
  const runtimeDeps = [
    "express",
    "passport",
    "passport-google-oauth20",
    "express-session",
    "dotenv",
  ];
  const devDeps =
    language === "TypeScript"
      ? [
          "typescript",
          "ts-node",
          "@types/node",
          "@types/express",
          "@types/express-session",
          "@types/passport",
          "@types/passport-google-oauth20",
        ]
      : [];

  if (packageManager) {
    await installDepsWithChoice(targetPath, runtimeDeps, packageManager, false);
    if (devDeps.length > 0)
      await installDepsWithChoice(targetPath, devDeps, packageManager, true);
  }

  // 8️⃣ Patch entry file with Google OAuth setup
  try {
    ensureAppJsHasGoogleOAuthSetup(appPath, language);
  } catch (err) {
    log.error(`❌ Failed to inject Google OAuth setup: ${err.message}`);
    return;
  }

  // 9️⃣ Generate config & routes
  const baseDir =
    language === "TypeScript" ? path.join(targetPath, "src") : targetPath;

  const configDir = path.join(baseDir, "config");
  const routesDir = path.join(baseDir, "routes");
  ensureDir(configDir);
  ensureDir(routesDir);

  const templateDir = path.join(__dirname, "templates", language.toLowerCase());

  renderTemplate(
    path.join(templateDir, "config", "googleStrategy.ejs"),
    path.join(
      configDir,
      `googleStrategy.${language === "TypeScript" ? "ts" : "js"}`
    )
  );

  renderTemplate(
    path.join(templateDir, "routes", "googleAuthRoutes.ejs"),
    path.join(
      routesDir,
      `googleAuthRoutes.${language === "TypeScript" ? "ts" : "js"}`
    )
  );

  // 🔟 Inject .env values
  const envVars = {
    GOOGLE_CLIENT_ID: creds.GOOGLE_CLIENT_ID || "your-client-id",
    GOOGLE_CLIENT_SECRET: creds.GOOGLE_CLIENT_SECRET || "your-client-secret",
    GOOGLE_CALLBACK_URL:
      creds.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback",
    SESSION_SECRET: creds.SESSION_SECRET || "your-session-secret",
  };
  injectEnvVars(targetPath, envVars);

  if (
    creds.GOOGLE_CLIENT_ID ||
    creds.GOOGLE_CLIENT_SECRET ||
    creds.GOOGLE_CALLBACK_URL ||
    creds.SESSION_SECRET
  )
    log.detect("env updated with the credentials you provided");
  else log.success(".env created with sample values.");

  // ✅ Done
  log.bigSuccess("Google OAuth setup complete!");
}

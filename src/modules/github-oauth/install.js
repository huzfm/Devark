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
import { ensureAppJsHasGithubOAuthSetup } from "./utils/ensureAppJsHasGithubOAuthSetup.js";
import { log } from "../../utils/moduleUtils.js";
import { ensureNodeProject } from "../../utils/validProject.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function installGithubOAuth(targetPath) {
  // 1️⃣ Ensure valid Node.js project
  const { success, pkgManager } = await ensureNodeProject(targetPath);
  if (!success) return;

  log.info("Installing GitHub OAuth module into your project...");

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

  // Auto-detect TS entry file
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

  // 5️⃣ Ask for environment variables
  const creds = await inquirer.prompt([
    {
      type: "input",
      name: "GITHUB_CLIENT_ID",
      message: "Enter your GitHub Client ID (leave empty for sample):",
    },
    {
      type: "input",
      name: "GITHUB_CLIENT_SECRET",
      message: "Enter your GitHub Client Secret (leave empty for sample):",
    },
    {
      type: "input",
      name: "GITHUB_CALLBACK_URL",
      message:
        "Enter your GitHub Callback URL (default: http://localhost:3000/auth/github/callback):",
    },
    {
      type: "input",
      name: "SESSION_SECRET",
      message: "Enter your session secret (leave empty for sample):",
    },
  ]);

  // 6️⃣ Install dependencies
  const runtimeDeps = [
    "express",
    "passport",
    "passport-github2",
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
          "@types/passport-github2",
        ]
      : [];

  if (packageManager) {
    await installDepsWithChoice(targetPath, runtimeDeps, packageManager, false);
    if (devDeps.length > 0)
      await installDepsWithChoice(targetPath, devDeps, packageManager, true);
  }

  // 7️⃣ Inject setup into entry file
  try {
    ensureAppJsHasGithubOAuthSetup(appPath, language);
  } catch (err) {
    log.error(`❌ Failed to inject GitHub OAuth setup: ${err.message}`);
    return;
  }

  // 8️⃣ Generate config & routes
  const baseDir =
    language === "TypeScript" ? path.join(targetPath, "src") : targetPath;

  const configDir = path.join(baseDir, "config");
  const routesDir = path.join(baseDir, "routes");
  ensureDir(configDir);
  ensureDir(routesDir);

  const templateDir = path.join(__dirname, "templates", language.toLowerCase());

  renderTemplate(
    path.join(templateDir, "config", "githubStrategy.ejs"),
    path.join(
      configDir,
      `githubStrategy.${language === "TypeScript" ? "ts" : "js"}`
    )
  );

  renderTemplate(
    path.join(templateDir, "routes", "githubAuthRoutes.ejs"),
    path.join(
      routesDir,
      `githubAuthRoutes.${language === "TypeScript" ? "ts" : "js"}`
    )
  );

  // 9️⃣ Inject .env values
  const envVars = {
    GITHUB_CLIENT_ID: creds.GITHUB_CLIENT_ID || "your-client-id",
    GITHUB_CLIENT_SECRET: creds.GITHUB_CLIENT_SECRET || "your-client-secret",
    GITHUB_CALLBACK_URL:
      creds.GITHUB_CALLBACK_URL || "http://localhost:3000/auth/github/callback",
    SESSION_SECRET: creds.SESSION_SECRET || "your-session-secret",
  };
  injectEnvVars(targetPath, envVars);

  if (
    creds.GITHUB_CLIENT_ID ||
    creds.GITHUB_CLIENT_SECRET ||
    creds.GITHUB_CALLBACK_URL ||
    creds.SESSION_SECRET
  )
    log.detect("env updated with the credentials you provided");
  else log.success(".env created with sample values.");

  // ✅ Done
  log.bigSuccess("GitHub OAuth setup complete!");
}

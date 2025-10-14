import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import { injectEnvVars } from "../../utils/injectEnvVars.js";
import { ensureAppJsHasGithubOAuthSetup } from "./utils/ensureAppJsHasGithubOAuthSetup.js";
import { ensureDir, renderTemplate } from "../../utils/filePaths.js";
import {
  detectPackageManager,
  installDepsWithChoice,
  isValidNodeProject,
} from "../../utils/packageManager.js";
import { log } from "../../utils/moduleUtils.js";

// __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function installGithubOAuth(targetPath) {
  if (!isValidNodeProject(targetPath)) {
    console.error(
      "❌ Not a valid Node.js project (missing package.json). Aborting."
    );
    return;
  }

  console.log(
    "\x1b[1m\x1b[32mInstalling GitHub OAuth to your project. Please read the instructions carefully.\x1b[0m"
  );

  // Detect package manager
  const packageManager = detectPackageManager(targetPath);
  if (packageManager) {
    log.detect(`${packageManager} detected`);
  } else {
    log.error("⚠️ Could not detect package manager");
  }

  // Ask for language
  const { language } = await inquirer.prompt([
    {
      type: "list",
      name: "language",
      message: "Which version do you want to add?",
      choices: ["JavaScript", "TypeScript"],
      default: "JavaScript",
    },
  ]);
  const defaultEntry = language === "TypeScript" ? "src/app.ts" : "app.js";

  // Ask for entry file
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
        console.log(`ℹ️ TypeScript entry file auto-detected: ${entryFile}`);
      }
    }
  }

  // Ensure entry file exists
  if (!fs.existsSync(appPath)) {
    console.error(
      `❌ Entry file ${entryFile} not found in ${targetPath}. Aborting installation.`
    );
    return;
  }

  // Install dependencies
  if (packageManager) {
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
    await installDepsWithChoice(targetPath, runtimeDeps, packageManager, false);
    if (devDeps.length > 0)
      await installDepsWithChoice(targetPath, devDeps, packageManager);
  }

  // Prepare controllers & routes
  const baseDir =
    language === "TypeScript" ? path.join(targetPath, "src") : targetPath;
  const controllersDir = path.join(baseDir, "config");
  const routesDir = path.join(baseDir, "routes");
  ensureDir(controllersDir);
  ensureDir(routesDir);

  const templateDir = path.join(__dirname, "templates", language.toLowerCase());
  renderTemplate(
    path.join(templateDir, "config", "githubStrategy.ejs"),
    path.join(
      controllersDir,
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

  // Inject OAuth setup into app entry file
  try {
    ensureAppJsHasGithubOAuthSetup(appPath, language);
  } catch (err) {
    console.error("❌ Failed to inject Github OAuth setup:", err.message);
    return;
  }

  // Prompt for credentials
  const creds = await inquirer.prompt([
    {
      type: "input",
      name: "GITHUB_CLIENT_ID",
      message: "Enter your Github Client ID:",
    },
    {
      type: "input",
      name: "GITHUB_CLIENT_SECRET",
      message: "Enter your Github Client Secret:",
    },
    {
      type: "input",
      name: "GITHUB_CALLBACK_URL",
      message:
        "Enter your Github Callback URL (default http://localhost:3000/auth/github/callback):",
    },
    {
      type: "input",
      name: "SESSION_SECRET",
      message: "Enter a session secret:",
    },
  ]);

  // Determine env values (user input or sample defaults)
  const envVars = {
    GITHUB_CLIENT_ID: creds.GITHUB_CLIENT_ID || "your-client-id",
    GITHUB_CLIENT_SECRET: creds.GITHUB_CLIENT_SECRET || "your-client-secret",
    GITHUB_CALLBACK_URL:
      creds.GITHUB_CALLBACK_URL || "http://localhost:3000/auth/github/callback",
    SESSION_SECRET: creds.SESSION_SECRET || "your-session-secret",
  };

  // Inject env vars
  injectEnvVars(targetPath, envVars);

  // Notify user about .env
  if (
    creds.GITHUB_CLIENT_ID ||
    creds.GITHUB_CLIENT_SECRET ||
    creds.GITHUB_CALLBACK_URL ||
    creds.SESSION_SECRET
  ) {
    log.detect("env updated with the credentials you provided");
  } else {
    console.log("\x1b[33m%s\x1b[0m", ".env created with sample values.");
  }

  console.log("\x1b[1m\x1b[92m%s\x1b[0m", "GITHUB OAuth setup complete!");
}

import path from "path";
import inquirer from "inquirer";
import fs from "fs";
import { fileURLToPath } from "url";
import { ensureDir, renderTemplate } from "../../utils/filePaths.js";
import { installDepsWithChoice } from "../../utils/packageManager.js";
import { injectEnvVars } from "../../utils/injectEnvVars.js";
import { ensureAppJsHasGoogleOAuthSetup } from "./utils/ensureAppJsHasOAuthSetup.js";
import { initProject } from "../../utils/initProject.js";
import { log } from "../../utils/moduleUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function runGoogleOAuthGenerator(targetPath) {
  // 1️⃣ Reuse shared initializer
  const { packageManager, language, entryFilePath, entryFileName } =
    await initProject(targetPath);

  // 2️⃣ Install dependencies
  const runtimeDeps = [
    "express",
    "passport",
    "passport-google-oauth20",
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

  await installDepsWithChoice(targetPath, runtimeDeps, packageManager, false);
  if (devDeps.length > 0)
    await installDepsWithChoice(targetPath, devDeps, packageManager, true);

  // 3️⃣ Prepare templates
  const baseDir =
    language === "TypeScript" ? path.join(targetPath, "src") : targetPath;
  const controllersDir = path.join(baseDir, "config");
  const routesDir = path.join(baseDir, "routes");
  ensureDir(controllersDir);
  ensureDir(routesDir);

  const templateDir = path.join(__dirname, "templates", language.toLowerCase());
  renderTemplate(
    path.join(templateDir, "config", "googleStrategy.ejs"),
    path.join(
      controllersDir,
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

  // 4️⃣ Inject middleware & routes
  ensureAppJsHasGoogleOAuthSetup(entryFilePath, language);

  // 5️⃣ Ask for credentials & inject .env
  const creds = await inquirer.prompt([
    {
      type: "input",
      name: "GOOGLE_CLIENT_ID",
      message: "Enter your Google Client ID:",
    },
    {
      type: "input",
      name: "GOOGLE_CLIENT_SECRET",
      message: "Enter your Google Client Secret:",
    },
    {
      type: "input",
      name: "GOOGLE_CALLBACK_URL",
      message: "Enter your Google Callback URL:",
      default: "http://localhost:3000/auth/google/callback",
    },
    {
      type: "input",
      name: "SESSION_SECRET",
      message: "Enter a session secret:",
    },
  ]);

  injectEnvVars(targetPath, {
    GOOGLE_CLIENT_ID: creds.GOOGLE_CLIENT_ID || "your-client-id",
    GOOGLE_CLIENT_SECRET: creds.GOOGLE_CLIENT_SECRET || "your-client-secret",
    GOOGLE_CALLBACK_URL: creds.GOOGLE_CALLBACK_URL,
    SESSION_SECRET: creds.SESSION_SECRET || "your-session-secret",
  });

  log.bigSuccess("🎉 Google OAuth setup complete!");
}

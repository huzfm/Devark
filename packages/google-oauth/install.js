// modules/google-oauth/index.js
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import { isValidNodeProject, detectPackageManager } from "../../utils/packageManager.js";
import { injectEnvVars } from "../../utils/injectEnvVars.js";
import { ensureAppJsHasGoogleOAuthSetup } from "./utils/ensureAppJsHasOAuthSetup.js";
import {
      log,
      ensureEntryFile,
      createTemplates,
      promptEnvCredentials,
      installDeps,
} from "../../utils/moduleUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function runGoogleOAuthGenerator(targetPath) {
      if (!isValidNodeProject(targetPath)) {
            log.error("Not a valid Node.js project (missing package.json).");
            return;
      }

      const packageManager = detectPackageManager(targetPath) || "npm";
      log.info(`Using ${packageManager}`);

      const { language } = await inquirer.prompt([
            { type: "list", name: "language", message: "Choose version:", choices: ["JavaScript", "TypeScript"], default: "JavaScript" },
      ]);

      const defaultEntry = language === "TypeScript" ? "src/app.ts" : "app.js";
      const { entryFile } = await inquirer.prompt([
            { name: "entryFile", message: "Project entry file:", default: defaultEntry },
      ]);

      const appPath = ensureEntryFile(targetPath, entryFile, language);

      // 🔧 Generate templates
      const templateDir = path.join(__dirname, "templates", language.toLowerCase());
      createTemplates(language, targetPath, templateDir, [
            { src: "config/googleStrategy.ejs", dest: "config/googleStrategy.<ext>" },
            { src: "routes/googleAuthRoutes.ejs", dest: "routes/googleAuthRoutes.<ext>" },
      ]);

      // 🧠 Ensure OAuth setup in app file
      ensureAppJsHasGoogleOAuthSetup(appPath, language);

      // 🔐 Prompt credentials
      const envVars = await promptEnvCredentials([
            { name: "GOOGLE_CLIENT_ID", message: "Google Client ID:" },
            { name: "GOOGLE_CLIENT_SECRET", message: "Google Client Secret:" },
            { name: "GOOGLE_CALLBACK_URL", message: "Callback URL (default http://localhost:3000/auth/google/callback):" },
            { name: "SESSION_SECRET", message: "Session Secret:" },
      ]);

      if (Object.keys(envVars).length) {
            await injectEnvVars(targetPath, envVars);
            log.success(".env updated with credentials.");
      } else {
            log.warn("No credentials provided, skipped .env update.");
      }

      // 📦 Install deps
      const runtimeDeps = ["express", "passport", "passport-google-oauth20", "dotenv", "express-session"];
      const devDeps = [
            "typescript", "ts-node", "@types/node", "@types/express",
            "@types/express-session", "@types/passport", "@types/passport-google-oauth20"
      ];
      await installDeps(targetPath, packageManager, language, runtimeDeps, devDeps);

      log.bigSuccess("✅ Google OAuth setup complete!");
}

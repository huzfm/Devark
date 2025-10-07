import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { fileURLToPath } from "url";
import { ensureDir, renderTemplate } from "../../utils/filePaths.js";
import { installDepsWithChoice, isValidNodeProject, detectPackageManager } from "../../utils/packageManager.js";
import { injectEnvVars } from "../../utils/injectEnvVars.js";
import { ensureAppJsHasGoogleOAuthSetup } from './utils/ensureAppJsHasOAuthSetup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function runGoogleOAuthGenerator(targetPath) {
      // 1️⃣ Validate Node project
      if (!isValidNodeProject(targetPath)) {
            console.error("❌ Not a valid Node.js project (missing package.json). Aborting.");
            return;
      }

      // 2️⃣ Detect package manager
      const packageManager = detectPackageManager(targetPath);
      if (packageManager) console.log(`📦 Detected ${packageManager}, dependencies will be installed automatically.`);
      else console.warn("⚠️ Could not detect package manager. You may need to install dependencies manually.");

      // 3️⃣ Ask for JS/TS
      const { language } = await inquirer.prompt([{
            type: "list",
            name: "language",
            message: "Which version do you want to add?",
            choices: ["JavaScript", "TypeScript"],
            default: "JavaScript",
      }]);

      // 4️⃣ Determine entry file
      const defaultEntry = language === "TypeScript" ? "src/app.ts" : "app.js";
      let { entryFile } = await inquirer.prompt([{
            type: "input",
            name: "entryFile",
            message: "Enter your project entry file (relative to root):",
            default: defaultEntry,
      }]);
      let appPath = path.join(targetPath, entryFile);

      // 5️⃣ Auto-detect TS entry file if missing
      if (language === "TypeScript" && !fs.existsSync(appPath)) {
            const srcDir = path.join(targetPath, "src");
            if (fs.existsSync(srcDir)) {
                  const tsFiles = fs.readdirSync(srcDir).filter(f => f.endsWith(".ts"));
                  if (tsFiles.length > 0) {
                        entryFile = path.join("src", tsFiles[0]);
                        appPath = path.join(targetPath, entryFile);
                        console.log(`ℹ️ TypeScript entry file auto-detected: ${entryFile}`);
                  }
            }
      }

      if (!fs.existsSync(appPath)) {
            console.error(`❌ Entry file "${entryFile}" not found. Aborting.`);
            return;
      }

      // 6️⃣ Prepare controllers & routes
      const baseDir = language === "TypeScript" ? path.join(targetPath, "src") : targetPath;
      const controllersDir = path.join(baseDir, "config");
      const routesDir = path.join(baseDir, "routes");
      ensureDir(controllersDir);
      ensureDir(routesDir);

      const templateDir = path.join(__dirname, "templates", language.toLowerCase());
      renderTemplate(
            path.join(templateDir, "config", "googleStrategy.ejs"),
            path.join(controllersDir, `googleStrategy.${language === "TypeScript" ? "ts" : "js"}`)
      );
      renderTemplate(
            path.join(templateDir, "routes", "googleAuthRoutes.ejs"),
            path.join(routesDir, `googleAuthRoutes.${language === "TypeScript" ? "ts" : "js"}`)
      );

      // 7️⃣ Ensure entry file has imports, middleware & routes
      try {
            ensureAppJsHasGoogleOAuthSetup(appPath, language);
      } catch (err) {
            console.error("❌ Failed to inject Google OAuth setup:", err.message);
            return;
      }

      // 8️⃣ Ask user for credentials (optional)
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
                  message: "Enter your Google Callback URL (default http://localhost:3000/auth/google/callback):",
            },
            {
                  type: "input",
                  name: "SESSION_SECRET",
                  message: "Enter a session secret:",
            },
      ]);

      // Only inject variables that the user provided
      const envVars = {};
      if (creds.GOOGLE_CLIENT_ID) envVars.GOOGLE_CLIENT_ID = creds.GOOGLE_CLIENT_ID;
      if (creds.GOOGLE_CLIENT_SECRET) envVars.GOOGLE_CLIENT_SECRET = creds.GOOGLE_CLIENT_SECRET;
      if (creds.GOOGLE_CALLBACK_URL) envVars.GOOGLE_CALLBACK_URL = creds.GOOGLE_CALLBACK_URL;
      if (creds.SESSION_SECRET) envVars.SESSION_SECRET = creds.SESSION_SECRET;

      if (Object.keys(envVars).length > 0) {
            await injectEnvVars(targetPath, envVars);
            console.log("\x1b[32m%s\x1b[0m", " .env updated with provided credentials");
      } else {
            console.log("\x1b[31m%s\x1b[0m", " No credentials provided. .env was not modified.");
      }

      // 9️⃣ Install dependencies
      if (packageManager) {
            const runtimeDeps = ["express", "passport", "passport-google-oauth20", "dotenv"];
            const devDeps = language === "TypeScript"
                  ? ["typescript", "ts-node", "@types/node", "@types/express", "@types/passport", "@types/passport-google-oauth20"]
                  : [];
            await installDepsWithChoice(targetPath, runtimeDeps, packageManager, false);
            if (devDeps.length > 0) await installDepsWithChoice(targetPath, devDeps, packageManager, true);
      }

      console.log("\x1b[1m\x1b[92m%s\x1b[0m", "Google OAuth setup complete!");

}

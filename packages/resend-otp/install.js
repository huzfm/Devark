import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import { injectEnvVars } from "../../utils/injectEnvVars.js";
import { ensureDir, renderTemplate } from "../../utils/filePaths.js";
import { detectPackageManager, installDependencies } from "../../utils/packageManager.js";
import { ensureAppJsHasOtpSetup } from "./utils/ensureAppJsHasOtpSetup.js";

// __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function installOtp(targetPath) {
      console.log("ℹ️ Installing Resend OTP module...");

      // ✅ Prompt entry file first
      const { entryFile } = await inquirer.prompt([
            {
                  type: "input",
                  name: "entryFile",
                  message: "What is your entry file? (e.g., app.js , index.js , server.js)",
                  default: "app.js",
            },
      ]);

      const entryFilePath = path.join(targetPath, entryFile);
      if (!fs.existsSync(entryFilePath)) {
            console.error(`❌ Entry file ${entryFile} not found in ${targetPath}. Aborting.`);
            return;
      }

      // ✅ Prompt for env vars
      const { apiKey, fromEmail } = await inquirer.prompt([
            {
                  type: "input",
                  name: "apiKey",
                  message: "Enter your Resend API Key:",
            },
            {
                  type: "input",
                  name: "fromEmail",
                  message: "Enter your FROM email address:",
            },
      ]);

      // ✅ Inject into .env
      injectEnvVars(targetPath, {
            RESEND_API_KEY: apiKey,
            FROM_EMAIL: fromEmail,
      });

      // ✅ Patch entry file with express.json + otpRoutes
      ensureAppJsHasOtpSetup(entryFilePath);

      // ✅ Copy EJS templates → project files
      const templatesDir = path.join(__dirname, "templates");

      // controllers/otpController.js
      const controllersDir = path.join(targetPath, "controllers");
      ensureDir(controllersDir);
      renderTemplate(
            path.join(templatesDir, "otpFunctions.ejs"),
            path.join(controllersDir, "otpFunctions.js"),
            path.join(templatesDir, "otp.ejs"),
            path.join(controllersDir, "otp.js"),
            {}
      );

      // routes/otpRoutes.js
      const routesDir = path.join(targetPath, "routes");
      ensureDir(routesDir);
      renderTemplate(
            path.join(templatesDir, "otpRoutes.ejs"),
            path.join(routesDir, "otpRoutes.js"),
            {}
      );

      console.log("📂 OTP controller & routes created!");

      // ✅ Install dependencies
      const packageManager = detectPackageManager(targetPath);
      const deps = ["resend"]

      if (!packageManager) {
            console.error("❌ Could not detect package manager. Please install manually:");
            console.log(`npm install ${deps.join(" ")}`);
            return;
      }

      installDependencies(targetPath, deps);

      console.log("✅ Resend OTP setup complete!");
}

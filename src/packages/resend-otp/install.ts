import fs from "fs";
import path from "path";
import * as inquirer from "inquirer";
import { injectEnvVars } from "../../utils/injectEnvVars.js";
import { ensureDir, renderTemplate } from "../../utils/filePaths.js";
import { detectPackageManager, installDependencies } from "../../utils/packageManager.js";
import { ensureAppJsHasOtpSetup } from "./utils/ensureAppJsHasOtpSetup.js";
import { isValidNodeProject } from "../../utils/packageManager.js";
// __dirname workaround
// Use process.argv[1] for CommonJS compatibility
const __filename = process.argv[1];
const __dirname = path.dirname(__filename);

export default async function installOtp(targetPath: string) {
  if (!isValidNodeProject(targetPath)) {
    console.error("❌ The folder does not contain a valid Node.js project (missing or invalid package.json). Aborting.");
    return;
  }
  console.log('\x1b[1m\x1b[32mInstalling Resend-OTP module to your project. Please read the instructions carefully.\x1b[0m');

  const packageManager = detectPackageManager(targetPath);
  if (packageManager) {
    console.log(` ${packageManager} detected as package manager.`);
  } else {
    console.error("❌ Could not detect package manager (pnpm, npm, or yarn). Please install dependencies manually:");
    return;
  }
  // ✅ Prompt entry file first
  const { entryFile } = await inquirer.default.prompt([
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
  const { apiKey, fromEmail } = await inquirer.default.prompt([
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
  const deps = ["resend"]
  installDependencies(targetPath, deps);

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
    {}
  );
  renderTemplate(
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
  console.log("✅ Resend OTP setup complete!");
}

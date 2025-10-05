import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { injectEnvVars } from "../../utils/injectEnvVars.js";
import { ensureAppJsHasOAuthSetup } from "./utils/ensureAppJsHasOAuthSetup.js";
import { ensureDir, renderTemplate, getTemplatesDir } from "../../utils/filePaths.js";
import { detectPackageManager, installDependencies } from "../../utils/packageManager.js";
import { isValidNodeProject } from "../../utils/packageManager.js";

// __dirname workaround
// Use process.argv[1] for CommonJS compatibility
const __filename = process.argv[1];
const __dirname = path.dirname(__filename);

export default async function installGoogleOAuth(targetPath: string) {
  if (!isValidNodeProject(targetPath)) {
    console.error("❌ The folder does not contain a valid Node.js project (missing or invalid package.json). Aborting installation.");
    return;
  }
  console.log('\x1b[1m\x1b[32mInstalling Google OAuth to your project. Please read the instructions carefully.\x1b[0m');
  const packageManager = detectPackageManager(targetPath);


  if (packageManager) {
    console.log(`${packageManager} detected as package manager. Installing dependencies...`);
  } else {
    console.error(
    "❌ Could not detect package manager (pnpm, npm, or yarn). Please install dependencies manually:"
    );

    return;
  }

  //  First prompt only for entry file
  const { entryFile } = await inquirer.prompt([
    {
      type: "input",
      name: "entryFile",
      message: "What is your entry file? (e.g., app.js , index.js , server.js)",
      default: "app.js",
    },
  ]);

  //  Ensure entry file exists before asking anything else
  const entryFilePath = path.join(targetPath, entryFile);
  if (!fs.existsSync(entryFilePath)) {
    console.error(`❌ Entry file ${entryFile} not found in ${targetPath}. Aborting installation.`);
    return;
  }

  //  Now ask for secrets only if entry file exists
  const { clientID, clientSecret, callbackURL } = await inquirer.prompt([
    {
      type: "input",
      name: "clientID",
      message: "Enter your Google OAuth Client ID:",
    },
    {
      type: "input",
      name: "clientSecret",
      message: "Enter your Google OAuth Client Secret:",
    },
    {
      type: "input",
      name: "callbackURL",
      message: "Enter your Google OAuth Callback URL:",
    },
  ]);

  //  Inject into .env
  injectEnvVars(targetPath, {
    GOOGLE_CLIENT_ID: clientID,
    GOOGLE_CLIENT_SECRET: clientSecret,
    GOOGLE_CALLBACK_URL: callbackURL,
  });

  const deps = ["passport", 'passport-google-oauth20', "express-session", "dotenv"];
  installDependencies(targetPath, deps);

  //  Patch entry file
  ensureAppJsHasOAuthSetup(entryFilePath);

  //  Copy EJS templates → project files
  const templatesDir = getTemplatesDir("google-oauth");

  // config/GoogleStrategy.js
  const configDir = path.join(targetPath, "config");
  ensureDir(configDir);
  renderTemplate(
    path.join(templatesDir, "config", "googleStrategy.ejs"),
    path.join(configDir, "googleStrategy.js"),
    { clientID, clientSecret, callbackURL }
  );

  // routes/authRoutes.js
  const routesDir = path.join(targetPath, "routes");
  ensureDir(routesDir);
  renderTemplate(
    path.join(templatesDir, "routes", "googleRoutes.ejs"),
    path.join(routesDir, "googleRoutes.js"),
    {}
  );

  console.log("📂 OAuth config & routes created!");
  console.log("✅ Google OAuth setup complete!");
}

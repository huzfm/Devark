import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import { injectEnvVars } from "../../utils/injectEnvVars";
import { ensureAppJsHasOAuthSetup } from "./utils/ensureAppJsHasOAuthSetup";
import { ensureDir, renderTemplate } from "../../utils/filePaths";
import { detectPackageManager, installDependencies, isValidNodeProject } from "../../utils/packageManager";
// __dirname workaround
const __filename = import.meta.url ? fileURLToPath(import.meta.url) : process.argv[1];
const __dirname = path.dirname(__filename);

export default async function installGithubOAuth(targetPath) {
      if (!isValidNodeProject(targetPath)) {
            console.error("❌ The folder does not contain a valid Node.js project (missing or invalid package.json). Aborting installation.");
            return;
      }
      console.log('\x1b[1m\x1b[32mInstalling GitHub OAuth to your project. Please read the instructions carefully.\x1b[0m');
      const packageManager = detectPackageManager(targetPath);

      if (packageManager) {
            console.log(`${packageManager} detected as package manager. Installing dependencies...`);
      }
      else {
            console.error(
                  "❌ Could not detect package manager (pnpm, npm, or yarn). Please install dependencies manually:"

            )
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
                  message: "Enter your GitHub OAuth Client ID:",
            },
            {
                  type: "input",
                  name: "clientSecret",
                  message: "Enter your GitHub OAuth Client Secret:",
            },
      ]);

      //  Inject into .env
      injectEnvVars(targetPath, {
            GITHUB_CLIENT_ID: clientID,
            GITHUB_CLIENT_SECRET: clientSecret,
            GITHUB_CALLBACK_URL: callbackURL,
      });


      const deps = ["passport", 'passport-github2', "express-session", "dotenv"];
      installDependencies(targetPath, deps);
      //  Patch entry file
      ensureAppJsHasOAuthSetup(entryFilePath);

      //  Copy EJS templates → project files
      const templatesDir = path.join(__dirname, "templates");

      // config/githubStrategy.js
      const configDir = path.join(targetPath, "config");
      ensureDir(configDir);
      renderTemplate(
            path.join(templatesDir, "config", "githubStrategy.ejs"),
            path.join(configDir, "githubStrategy.js"),
            { clientID, clientSecret, callbackURL }
      );

      // routes/authRoutes.js
      const routesDir = path.join(targetPath, "routes");
      ensureDir(routesDir);
      renderTemplate(
            path.join(templatesDir, "routes", "githubRoutes.ejs"),
            path.join(routesDir, "githubRoutes.js"),
            {}
      );

      console.log("📂 OAuth config & routes created!");

      //  Install dependencies


      console.log("✅ GitHub OAuth setup complete!");
}

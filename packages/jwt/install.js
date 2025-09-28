import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import { ensureDir, renderTemplate } from "../../utils/filePaths.js";
import { installDepsWithChoice } from "../../utils/packageManager.js";
import { isValidNodeProject } from "../../utils/packageManager.js";

// __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function installJWT(targetPath) {

      if (!isValidNodeProject(targetPath)) {
            console.error("The folder does not contain a valid Node.js project");
            return;
      }
      console.log("\x1b[1m\x1b[32m🚀 Setting up JWT authentication...\x1b[0m");

      // Ask user for package manager
      const { packageManager } = await inquirer.prompt([
            {
                  type: "list",
                  name: "packageManager",
                  message: "Which package manager do you want to use?",
                  choices: ["npm", "pnpm", "yarn"],
                  default: "pnpm",
            },
      ]);

      // Ensure required folders exist
      const folders = ["controllers", "routes", "utils"];
      folders.forEach((folder) => ensureDir(path.join(targetPath, folder)));

      // Templates directory
      const templatesDir = path.join(__dirname, "templates");

      // Generate controllers, routes, utils
      renderTemplate(
            path.join(templatesDir, "controllers/authController.ejs"),
            path.join(targetPath, "controllers/authController.js"),
            {}
      );
      renderTemplate(
            path.join(templatesDir, "routes/authRoutes.ejs"),
            path.join(targetPath, "routes/authRoutes.js"),
            {}
      );
      renderTemplate(
            path.join(templatesDir, "utils/jwtUtils.ejs"),
            path.join(targetPath, "utils/jwtUtils.js"),
            {}
      );

      // Inject .env variables
      const envPath = path.join(targetPath, ".env");
      let envContent = "";
      if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, "utf-8");
      }
      if (!envContent.includes("JWT_SECRET")) {
            envContent += `\nJWT_SECRET=your_jwt_secret\nJWT_EXPIRES_IN=1h\n`;
            fs.writeFileSync(envPath, envContent);
            console.log("🔑 Injected JWT_SECRET into .env");
      }

      // Install dependencies
      const deps = ["jsonwebtoken", "bcryptjs"];
      await installDepsWithChoice(targetPath, deps, packageManager);

      console.log(
            "\x1b[1m\x1b[32m✅ JWT authentication setup completed!\x1b[0m\n" +
            "📄 Endpoints: /auth/register, /auth/login, /auth/profile"
      );

      console.log(
            "\x1b[1m\x1b[32m Please check and update the user schema and other necessary files\x1b[0m\n" +
            "m,"
      );
}

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import { ensureDir, renderTemplate } from "../../utils/filePaths";
import { installDepsWithChoice } from "../../utils/packageManager";
import { detectPackageManagerByCommnad } from "../../utils/packageManager";

// __dirname workaround
const __filename = import.meta.url ? fileURLToPath(import.meta.url) : process.argv[1];
const __dirname = path.dirname(__filename);

export default async function runNodeMongoGenerator(targetPath) {
      console.log("\x1b[1m\x1b[32m🚀 Setting up Node.js + MongoDB project...\x1b[0m");

      // Ask user for package manager instead of auto-detect

      const packageManager = detectPackageManagerByCommnad();
      console.log(`📦 Using package manager \x1b[1m\x1b[36m${packageManager}\x1b[0m`);

      // Ensure required folders exist
      const folders = ["models", "routes", "controllers"];
      folders.forEach((folder) => ensureDir(path.join(targetPath, folder)));

      // Templates directory
      const templatesDir = path.join(__dirname, "templates");

      // Core files
      renderTemplate(path.join(templatesDir, "app.ejs"), path.join(targetPath, "app.js"), {});
      renderTemplate(path.join(templatesDir, "env.example.ejs"), path.join(targetPath, ".env.example"), {});
      renderTemplate(path.join(templatesDir, "package.json.ejs"), path.join(targetPath, "package.json"), {});

      // MVC boilerplate
      renderTemplate(path.join(templatesDir, "models/User.ejs"), path.join(targetPath, "models/User.js"), {});
      renderTemplate(path.join(templatesDir, "routes/userRoutes.ejs"), path.join(targetPath, "routes/userRoutes.js"), {});
      renderTemplate(
            path.join(templatesDir, "controllers/userController.ejs"),
            path.join(targetPath, "controllers/userController.js"),
            {}
      );

      // Add Instructions.md
      renderTemplate(path.join(templatesDir, "Instructions.ejs"), path.join(targetPath, "Instructions.md"), {});

      // Install dependencies
      const deps = ["express", "mongoose", "morgan", "dotenv", "nodemon"];
      await installDepsWithChoice(targetPath, deps, packageManager);



      console.log(
            "\x1b[1m\x1b[32m✅ Node.js + MongoDB project setup completed!\x1b[0m\n" +
            "📄 Please read the Instructions.md file for help on how to run and use your project."
      );
}

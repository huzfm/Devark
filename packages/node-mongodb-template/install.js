import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ensureDir, renderTemplate } from "../../utils/filePaths.js";
import { installDepsWithChoice, detectByCommand } from "../../utils/packageManager.js";

// __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function runNodeMongoGenerator(targetPath) {
      console.log("\x1b[1m\x1b[32m🚀 Setting up Node.js + MongoDB project...\x1b[0m");

      // 🔍 Step 1: Detect package manager automatically (from user agent)
      const packageManager = detectByCommand();
      console.log(`📦 Using package manager \x1b[1m\x1b[36m${packageManager}\x1b[0m`);

      // 📁 Step 2: Ensure required folders exist
      const folders = ["models", "routes", "controllers"];
      folders.forEach((folder) => ensureDir(path.join(targetPath, folder)));

      // 📄 Step 3: Define templates directory
      const templatesDir = path.join(__dirname, "templates");

      // ⚙️ Step 4: Generate core boilerplate files
      renderTemplate(path.join(templatesDir, "app.ejs"), path.join(targetPath, "app.js"), {});
      renderTemplate(path.join(templatesDir, "env.example.ejs"), path.join(targetPath, ".env.example"), {});
      renderTemplate(path.join(templatesDir, "package.json.ejs"), path.join(targetPath, "package.json"), {});

      // 🧩 Step 5: MVC boilerplate
      renderTemplate(path.join(templatesDir, "models/User.ejs"), path.join(targetPath, "models/User.js"), {});
      renderTemplate(path.join(templatesDir, "routes/userRoutes.ejs"), path.join(targetPath, "routes/userRoutes.js"), {});
      renderTemplate(
            path.join(templatesDir, "controllers/userController.ejs"),
            path.join(targetPath, "controllers/userController.js"),
            {}
      );

      // 📝 Step 6: Add instructions
      renderTemplate(path.join(templatesDir, "Instructions.ejs"), path.join(targetPath, "Instructions.md"), {});

      // 📦 Step 7: Install dependencies using the detected package manager
      const deps = ["express", "mongoose", "morgan", "dotenv", "nodemon"];
      await installDepsWithChoice(targetPath, deps, packageManager);

      // ✅ Step 8: Success message
      console.log(
            "\x1b[1m\x1b[32m✅ Node.js + MongoDB project setup completed!\x1b[0m\n" +
            "📄 Please read the Instructions.md file for help on how to run and use your project."
      );
}

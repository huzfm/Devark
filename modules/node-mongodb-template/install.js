import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import { ensureDir, renderTemplate } from "../../utils/filePaths.js";
import {
  installDepsWithChoice,
  detectByCommand,
} from "../../utils/packageManager.js";
import { log } from "../../utils/moduleUtils.js";

// __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function runNodeMongoGenerator(targetPath, options = {}) {
  // 🧠 Step 1: Detect if --typescript flag is provided
  let isTypeScript =
    options.typescript ||
    process.argv.includes("--typescript") ||
    process.argv.includes("--ts");

  // ❓ Step 2: Prompt only if no flag provided
  if (!isTypeScript) {
    const { language } = await inquirer.prompt([
      {
        type: "list",
        name: "language",
        message: "Which language do you want to use?",
        choices: ["JavaScript", "TypeScript"],
        default: "JavaScript",
      },
    ]);
    isTypeScript = language === "TypeScript";
  }

  log.bigSuccess(
    ` Setting up Node.js + MongoDB project in ${
      isTypeScript ? "TypeScript" : "JavaScript"
    }`
  );

  // 🔍 Step 3: Detect package manager
    const packageManager = detectByCommand();
  log.detect(
    `Using ${packageManager} as package manager`
  );

  // 🧩 Step 4: Define target source path
  const srcPath = isTypeScript ? path.join(targetPath, "src") : targetPath;

  // 📁 Step 5: Ensure required folders exist
  const folders = ["models", "routes", "controllers"];
  folders.forEach((folder) => ensureDir(path.join(srcPath, folder)));

  // 📄 Step 6: Define templates directory based on language
  const templatesDir = path.join(
    __dirname,
    "templates",
    isTypeScript ? "typescript" : "javascript"
  );

  // ⚙️ Step 7: Generate main files
  renderTemplate(
    path.join(templatesDir, isTypeScript ? "app.ts.ejs" : "app.ejs"),
    path.join(srcPath, isTypeScript ? "app.ts" : "app.js"),
    {}
  );

  renderTemplate(
    path.join(templatesDir, "env.example.ejs"),
    path.join(targetPath, ".env.example"),
    {}
  );
  renderTemplate(
    path.join(templatesDir, "gitignore.ejs"),
    path.join(targetPath, ".gitignore"),
    {}
  );

  renderTemplate(
    path.join(templatesDir, "package.json.ejs"),
    path.join(targetPath, "package.json"),
    { isTypeScript }
  );

  // 🧩 Step 8: MVC structure
  renderTemplate(
    path.join(
      templatesDir,
      "models",
      isTypeScript ? "userModel.ts.ejs" : "userModel.ejs"
    ),
    path.join(
      srcPath,
      "models",
      isTypeScript ? "userModel.ts" : "userModel.js"
    ),
    {}
  );

  renderTemplate(
    path.join(
      templatesDir,
      "routes",
      isTypeScript ? "userRoutes.ts.ejs" : "userRoutes.ejs"
    ),
    path.join(
      srcPath,
      "routes",
      isTypeScript ? "userRoutes.ts" : "userRoutes.js"
    ),
    {}
  );

  renderTemplate(
    path.join(
      templatesDir,
      "controllers",
      isTypeScript ? "userController.ts.ejs" : "userController.ejs"
    ),
    path.join(
      srcPath,
      "controllers",
      isTypeScript ? "userController.ts" : "userController.js"
    ),
    {}
  );

  // 📝 Step 9: Add Instructions
  renderTemplate(
    path.join(templatesDir, "Instructions.ejs"),
    path.join(targetPath, "Instructions.md"),
    {}
  );

  // ⚙️ Step 10: Render tsconfig.json (only for TS)
  if (isTypeScript) {
    renderTemplate(
      path.join(templatesDir, "tsconfig.json.ejs"),
      path.join(targetPath, "tsconfig.json"),
      {}
    );
  }

  // 📦 Step 11: Install dependencies
  const deps = ["express", "mongoose", "morgan", "dotenv","helmet","cors"];
  const devDeps = isTypeScript
    ? [
        "typescript",
        "@types/node",
        "@types/express",
        "@types/cors",
        "@types/morgan",
        "ts-node",
        "nodemon",
      ]
    : ["nodemon"];

  try {
    // Install main dependencies
    log.info(" Installing dependencies...");
    await installDepsWithChoice(targetPath, deps, packageManager);
    await installDepsWithChoice(targetPath, devDeps, packageManager, true);
  } catch (error) {
    log.error("Failed to install dependencies:", error);
    return;
  }

  log.bigSuccess(
    ` Node.js + MongoDB ${isTypeScript ? "TypeScript" : "JavaScript"} project setup completed!\n` +
      `Please read the Instructions.md file for help on how to run and use your project.`
  );
}
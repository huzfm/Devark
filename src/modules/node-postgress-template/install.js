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

export default async function runNodePostgresGenerator(
  targetPath,
  options = {}
) {
  // 🧠 Step 1: Detect if --typescript flag is provided
  let isTypeScript =
    options.typescript ||
    process.argv.includes("--typescript") ||
    process.argv.includes("--ts");

  // ❓ Step 2: Prompt if no flag provided
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
    ` Setting up Node.js + PostgreSQL + Prisma project in ${
      isTypeScript ? "TypeScript" : "JavaScript"
    }`
  );

  // 🔍 Step 3: Detect package manager
  const packageManager = detectByCommand();
  log.detect(`Using ${packageManager} as package manager`);

  // 🧩 Step 4: Define target source path
  const srcPath = isTypeScript ? path.join(targetPath, "src") : targetPath;

  // 📁 Step 5: Ensure required folders exist
  const folders = ["prisma", "routes", "controllers", "utils"];
  folders.forEach((folder) => ensureDir(path.join(srcPath, folder)));

  // 📄 Step 6: Define templates directory based on language
  const templatesDir = path.join(
    __dirname,
    "templates",
    isTypeScript ? "typescript" : "javascript"
  );

  const ext = isTypeScript ? "ts" : "js";

  // ⚙️ Step 7: Generate main app files
  renderTemplate(
    path.join(templatesDir, isTypeScript ? "app.ts.ejs" : "app.ejs"),
    path.join(srcPath, `app.${ext}`),
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

  // 🧩 Step 8: Prisma setup
  renderTemplate(
    path.join(templatesDir, "schema.prisma.ejs"),
    path.join(targetPath, "prisma/schema.prisma"),
    {}
  );

  renderTemplate(
    path.join(templatesDir, "utils", "prismaClient.ejs"),
    path.join(srcPath, `utils/prismaClient.${ext}`),
    {}
  );

  // 🧩 Step 9: MVC structure
  renderTemplate(
    path.join(templatesDir, "routes", `userRoutes.ejs`),
    path.join(srcPath, `routes/userRoutes.${ext}`),
    {}
  );

  renderTemplate(
    path.join(templatesDir, "controllers", `userController.ejs`),
    path.join(srcPath, `controllers/userController.${ext}`),
    {}
  );

  // 📝 Step 10: Add Instructions
  renderTemplate(
    path.join(templatesDir, "Instructions.ejs"),
    path.join(targetPath, "Instructions.md"),
    {}
  );

  // ⚙️ Step 11: Render tsconfig.json (only for TS)
  if (isTypeScript) {
    renderTemplate(
      path.join(templatesDir, "tsconfig.json.ejs"),
      path.join(targetPath, "tsconfig.json"),
      {}
    );
  }

  // 📦 Step 12: Install dependencies
  const deps = ["express", "@prisma/client", "dotenv", "morgan"];
  const devDeps = ["prisma", "nodemon"];

  if (isTypeScript) {
    devDeps.push(
      "typescript",
      "ts-node",
      "@types/node",
      "@types/express",
      "@types/morgan"
    );
  }

  try {
    log.info(" Installing dependencies...");
    await installDepsWithChoice(targetPath, deps, packageManager);
    await installDepsWithChoice(targetPath, devDeps, packageManager, true);
  } catch (error) {
    log.error("Failed to install dependencies:", error);
    return;
  }

  // ✅ Step 13: Finish
  log.bigSuccess(
    `✅ Node.js + PostgreSQL + Prisma ${
      isTypeScript ? "TypeScript" : "JavaScript"
    } project setup completed!\n` +
      `📄 Please read the Instructions.md file for details on how to run and use your project.`
  );

  log.detect("Run the following commands:");
  log.detect("npx prisma generate");
  log.detect('npx prisma migrate dev --name "init"');
  log.info("Once done, you're all set!");
}

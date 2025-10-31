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

export default async function runNodePostgresGenerator(targetPath) {
  log.info(
    "Setting up Node.js + PostgreSQL + Prisma project"
  );

  // Ask for language choice
  const { language } = await inquirer.prompt([
    {
      type: "list",
      name: "language",
      message: "Which language would you like to use?",
      choices: ["JavaScript", "TypeScript"],
      default: "JavaScript",
    },
  ]);

  // Detect package manager automatically
  const packageManager = detectByCommand();
  log.detect(` Using package manager: ${packageManager}`);

  // === Dependencies ===
  const deps = ["express", "@prisma/client", "dotenv", "morgan"];
  const devDeps = ["prisma", "nodemon"];

  if (language === "TypeScript") {
    devDeps.push(
      "typescript",
      "ts-node",
      "@types/node",
      "@types/express",
      "@types/morgan"
    );
  }

  await installDepsWithChoice(targetPath, deps, packageManager, false);
  await installDepsWithChoice(targetPath, devDeps, packageManager, true);

  // Set templates directory based on language
  const templatesDir = path.join(
    __dirname,
    "templates",
    language.toLowerCase()
  );

  // Base directory (src for TS)
  const baseDir =
    language === "TypeScript" ? path.join(targetPath, "src") : targetPath;

  // Ensure required folders exist
  const folders = ["prisma", "routes", "controllers", "utils"];
  folders.forEach((folder) => ensureDir(path.join(baseDir, folder)));

  // File extensions
  const ext = language === "TypeScript" ? "ts" : "js";
  const appFileName = `app.${ext}`;

  // === Core App File ===
  renderTemplate(
    path.join(
      templatesDir,
      language === "TypeScript" ? "app.ts.ejs" : "app.ejs"
    ),
    path.join(baseDir, appFileName),
    {}
  );

  // === Env & package.json ===
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
    path.join(
      templatesDir,
      language === "TypeScript" ? "package.json.ts.ejs" : "package.json.ejs"
    ),
    path.join(targetPath, "package.json"),
    {}
  );

  // === Prisma Schema ===
  renderTemplate(
    path.join(templatesDir, "schema.prisma.ejs"),
    path.join(targetPath, "prisma/schema.prisma"),
    {}
  );

  // === MVC Boilerplate ===
  renderTemplate(
    path.join(templatesDir, "routes/userRoutes.ejs"),
    path.join(baseDir, `routes/userRoutes.${ext}`),
    {}
  );

  renderTemplate(
    path.join(templatesDir, "controllers/userController.ejs"),
    path.join(baseDir, `controllers/userController.${ext}`),
    {}
  );

  // === Utils Folder ===
  renderTemplate(
    path.join(templatesDir, "utils/prismaClient.ejs"),
    path.join(baseDir, `utils/prismaClient.${ext}`),
    {}
  );

  // === Instructions.md ===
  renderTemplate(
    path.join(templatesDir, "Instructions.ejs"),
    path.join(targetPath, "Instructions.md"),
    {}
  );

  // === tsconfig.json (only for TS) ===
  if (language === "TypeScript") {
    renderTemplate(
      path.join(templatesDir, "tsconfig.json.ejs"),
      path.join(targetPath, "tsconfig.json"),
      {}
    );
  }

  // === Done ===
  log.bigSuccess(
    "\x1b[1m\x1b[32m✅ Node.js + PostgreSQL + Prisma project setup completed!\x1b[0m\n" +
      "📄 Please read the Instructions.md file for help on how to run and use your project."
  );
  

  log.detect("Run the following commands");
  log.detect("npx prisma generate");
  log.detect("npx prisma migrate dev --name init");
  log.info("Once done, you're all set!");
}

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import { ensureDir, renderTemplate } from "../../utils/filePaths.js";
import {
  installDepsWithChoice,
  detectByCommand,
} from "../../utils/packageManager.js";

// __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function runNodePostgresGenerator(targetPath) {
  console.log(
    "\x1b[1m\x1b[32m🚀 Setting up Node.js + PostgreSQL + Prisma project...\x1b[0m"
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

  // Detect package manager
  const packageManager = "pnpm";
  //   const packageManager = detectByCommand();
  console.log(`📦 Using package manager: ${packageManager}`);

  // Set templates directory based on language
  const templatesDir = path.join(
    __dirname,
    "templates",
    language.toLowerCase()
  );

  // Determine base directory (src for TS)
  const baseDir =
    language === "TypeScript" ? path.join(targetPath, "src") : targetPath;

  // Ensure required folders exist
  const folders = ["prisma", "routes", "controllers", "utils"];
  folders.forEach((folder) => ensureDir(path.join(baseDir, folder)));

  // Copy core app and config files
  const appFileName = language === "TypeScript" ? "app.ts" : "app.js";
  renderTemplate(
    path.join(
      templatesDir,
      language === "TypeScript" ? "app.ts.ejs" : "app.ejs"
    ),
    path.join(baseDir, appFileName),
    {}
  );

  // Env and package.json files
  renderTemplate(
    path.join(templatesDir, "env.example.ejs"),
    path.join(targetPath, ".env.example"),
    {}
  );
  renderTemplate(
    path.join(
      templatesDir,
      language === "TypeScript" ? "package-ts.json.ejs" : "package.json.ejs"
    ),
    path.join(targetPath, "package.json"),
    {}
  );

  // Prisma schema
  renderTemplate(
    path.join(templatesDir, "schema.prisma.ejs"),
    path.join(targetPath, "prisma/schema.prisma"),
    {}
  );

  // MVC boilerplate
  const ext = language === "TypeScript" ? "ts" : "js";
  renderTemplate(
    path.join(templatesDir, `routes/userRoutes.ejs`),
    path.join(baseDir, `routes/userRoutes.${ext}`),
    {}
  );
  renderTemplate(
    path.join(templatesDir, `controllers/userController.ejs`),
    path.join(baseDir, `controllers/userController.${ext}`),
    {}
  );

  // ✅ utils/prisma-client.ts
  renderTemplate(
    path.join(templatesDir, "utils/prismaClient.ejs"),
    path.join(baseDir, "utils/prisma-client.ts"),
    {}
  );

  // Add Instructions.md
  renderTemplate(
    path.join(templatesDir, "Instructions.ejs"),
    path.join(targetPath, "Instructions.md"),
    {}
  );

  // Copy tsconfig.json for TypeScript
  if (language === "TypeScript") {
    renderTemplate(
      path.join(templatesDir, "tsconfig.json.ejs"),
      path.join(targetPath, "tsconfig.json"),
      {}
    );
  }

  // Dependencies
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

  // Install dependencies
  await installDepsWithChoice(targetPath, deps, packageManager, false);
  await installDepsWithChoice(targetPath, devDeps, packageManager, true);

  // Done!
  console.log(
    "\x1b[1m\x1b[32m✅ Node.js + PostgreSQL + Prisma project setup completed!\x1b[0m\n" +
      "📄 Please read the Instructions.md file for help on how to run and use your project."
  );

  console.log("\x1b[1m\x1b[32m✅ Run the following commands:\x1b[0m\n");
  console.log("\x1b[36m npx prisma generate\x1b[0m");
  console.log("\x1b[36m npx prisma migrate dev --name init\x1b[0m\n");
  console.log("\x1b[33m Once done, you're all set! \x1b[0m");
}

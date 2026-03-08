import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { select, intro, outro, cancel } from "@clack/prompts";
import { ensureDir, renderTemplate } from "../../utils/filePaths.js";
import {
  installDepsWithChoice,
  detectByCommand,
} from "../../utils/packageManager.js";
import { log } from "../../utils/moduleUtils.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function runNodeMongoGenerator(targetPath, options = {}) {
  intro("🧩 Node.js + MongoDB Project Setup");

  
  let isTypeScript =
    options.typescript ||
    process.argv.includes("--typescript") ||
    process.argv.includes("--ts");

  
  if (!isTypeScript) {
    const language = await select({
      message: "Which language do you want to use?",
      options: [
        { label: "JavaScript", value: "JavaScript" },
        { label: "TypeScript", value: "TypeScript" },
      ],
      initialValue: "JavaScript",
    });

    if (language === cancel) {
      outro("Cancelled by user.");
      return;
    }

    isTypeScript = language === "TypeScript";
  }

  log.bigSuccess(
    ` Setting up Node.js + MongoDB project in ${
      isTypeScript ? "TypeScript" : "JavaScript"
    }`
  );

  
  const packageManager = detectByCommand();
  log.detect(`Using ${packageManager} as package manager`);

  
  const srcPath = isTypeScript ? path.join(targetPath, "src") : targetPath;

  
  const folders = ["models", "routes", "controllers"];
  folders.forEach((folder) => ensureDir(path.join(srcPath, folder)));

  
  const templatesDir = path.join(
    __dirname,
    "templates",
    isTypeScript ? "typescript" : "javascript"
  );

  
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

  
  renderTemplate(
    path.join(templatesDir, "Instructions.ejs"),
    path.join(targetPath, "Instructions.md"),
    {}
  );

  
  if (isTypeScript) {
    renderTemplate(
      path.join(templatesDir, "tsconfig.json.ejs"),
      path.join(targetPath, "tsconfig.json"),
      {}
    );
  }

  
  const deps = ["express", "mongoose", "morgan", "dotenv", "helmet", "cors"];
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
    
    log.info(` Installing dependencies using ${packageManager}...`);
    await installDepsWithChoice(targetPath, deps, packageManager);
    await installDepsWithChoice(targetPath, devDeps, packageManager, true);
  } catch (error) {
    log.error("Failed to install dependencies:", error);
    return;
  }

  outro(`Node.js + MongoDB ${isTypeScript ? "TypeScript" : "JavaScript"}`);

  outro("project setup completed.");
  outro(
    "Please read the Instructions.md file for help on how to run and use your project"
  );
}

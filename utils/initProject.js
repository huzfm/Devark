import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import {
  runPackageInit,
  detectPackageManager,
  isValidNodeProject,
} from "./packageManager.js";
import { log } from "./moduleUtils.js";

/**
 * Ensures the target directory has a valid Node.js project setup.
 * - Detects or initializes package.json
 * - Detects package manager
 * - Prompts for language & entry file
 * - Creates entry file if missing
 * Returns: { packageManager, language, entryFileName, entryFilePath }
 */
export async function initProject(targetPath) {
  log.info("Preparing your project...");

  let packageManager = detectPackageManager(targetPath);

  // Step 1️⃣: Initialize Node project if not valid
  if (!isValidNodeProject(targetPath)) {
    log.warn("⚠️ No package.json found in this directory.");
    const { shouldInit } = await inquirer.prompt([
      {
        type: "confirm",
        name: "shouldInit",
        message: "Would you like to initialize a new Node.js project here?",
        default: true,
      },
    ]);

    if (!shouldInit) {
      log.error("❌ Aborted: No valid Node project found.");
      process.exit(1);
    }

    if (!packageManager) {
      const { pm } = await inquirer.prompt([
        {
          type: "list",
          name: "pm",
          message: "Choose a package manager to initialize with:",
          choices: ["npm", "pnpm", "yarn", "bun"],
          default: "npm",
        },
      ]);
      packageManager = pm;
    }

    log.info(`Initializing new Node.js project using ${packageManager}...`);
    await runPackageInit(targetPath, packageManager);
    log.success("✅ Project initialized successfully!");
  } else {
    log.success("✅ Node.js project detected.");
  }

  // Step 2️⃣: Detect package manager again (after init)
  if (!packageManager) packageManager = detectPackageManager(targetPath);
  if (packageManager) log.detect(`📦 ${packageManager} detected`);
  else log.error("⚠️ Could not detect package manager.");

  // Step 3️⃣: Ask for language & entry file name
  const { language, entryFileName } = await inquirer.prompt([
    {
      type: "list",
      name: "language",
      message: "Which version do you want to add?",
      choices: ["JavaScript", "TypeScript"],
      default: "JavaScript",
    },
    {
      type: "input",
      name: "entryFileName",
      message: "Enter your project entry file (relative to root):",
      default: (answers) =>
        answers.language === "TypeScript" ? "src/app.ts" : "app.js",
    },
  ]);

  const entryFilePath = path.join(targetPath, entryFileName);

  // Step 4️⃣: Create entry file if missing
  if (!fs.existsSync(entryFilePath)) {
    log.warn(`⚠️ Entry file "${entryFileName}" not found. Creating one...`);
    const dirName = path.dirname(entryFilePath);
    if (!fs.existsSync(dirName)) fs.mkdirSync(dirName, { recursive: true });

    const boilerplate = `import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("🚀 Server running successfully!"));
app.listen(PORT, () => console.log(\`✅ Listening on http://localhost:\${PORT}\`));`;

    fs.writeFileSync(entryFilePath, boilerplate, "utf-8");
    log.success(`📝 Created entry file: ${entryFileName}`);
  }

  return { packageManager, language, entryFileName, entryFilePath };
}

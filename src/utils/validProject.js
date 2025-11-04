import inquirer from "inquirer";
import { execSync } from "child_process";
import { log } from "./moduleUtils.js";
import path from "path";
import fs from "fs";
import { entryTemplates, tsConfigTemplate } from "./projectTemplates.js";

export async function ensureNodeProject(targetPath) {
  const packageJsonPath = path.join(targetPath, "package.json");

  // ✅ If package.json exists → already a valid project
  if (fs.existsSync(packageJsonPath)) {
    const pkgManager = detectPackageManager(targetPath);
    return { success: true, pkgManager };
  }

  log.warn("No project detected in this directory.");

  // Ask user if they want to create a new one
  const { shouldCreate } = await inquirer.prompt([
    {
      type: "confirm",
      name: "shouldCreate",
      message: "Would you like to create a new project here?",
      default: true,
    },
  ]);

  if (!shouldCreate) {
    log.error("Aborting module installation.");
    return { success: false, pkgManager: null };
  }

  // Ask for package manager
  const { pkgManager } = await inquirer.prompt([
    {
      type: "list",
      name: "pkgManager",
      message: "Choose a package manager to initialize the project:",
      choices: ["npm", "pnpm", "bun", "yarn"],
      default: "npm",
    },
  ]);

  try {
    console.log(`🚀 Initializing a new project with ${pkgManager}...`);
    const initCommands = {
      npm: "npm init -y",
      pnpm: "pnpm init",
      yarn: "yarn init ",
      bun: "bun init",
    };
    execSync(initCommands[pkgManager], { cwd: targetPath, stdio: "inherit" });
    console.log("✅ Node.js project initialized successfully!");
  } catch (error) {
    console.error("❌ Failed to initialize the project:", error.message);
    return { success: false, pkgManager: null };
  }

  // 🧠 Ask for language
  const { language } = await inquirer.prompt([
    {
      type: "list",
      name: "language",
      message: "Which language do you want to use?",
      choices: ["JavaScript", "TypeScript"],
      default: "JavaScript",
    },
  ]);

  // 🧩 Ask for entry file name
  const defaultEntry = language === "TypeScript" ? "src/app.ts" : "app.js";
  const { entryFile } = await inquirer.prompt([
    {
      type: "input",
      name: "entryFile",
      message: "What do you want name your entry file (app.js, index.js):",
      default: defaultEntry,
    },
  ]);

  const entryPath = path.join(targetPath, entryFile);
  const entryDir = path.dirname(entryPath);
  fs.mkdirSync(entryDir, { recursive: true });

  // 📝 Write entry file
  const entryContent =
    language === "TypeScript" ? entryTemplates.ts : entryTemplates.js;
  fs.writeFileSync(entryPath, entryContent, "utf8");
  console.log(`📄 Entry file created at: ${entryFile}`);

  // ⚙️ TypeScript setup if chosen
  if (language === "TypeScript") {
    console.log("⚙️ Setting up TypeScript environment...");
    try {
      execSync(
        `${pkgManager} add -D typescript ts-node @types/node @types/express`,
        { cwd: targetPath, stdio: "inherit" }
      );

      const tsconfigPath = path.join(targetPath, "tsconfig.json");
      if (!fs.existsSync(tsconfigPath)) {
        fs.writeFileSync(
          tsconfigPath,
          JSON.stringify(tsConfigTemplate, null, 2)
        );
        console.log("📝 tsconfig.json created!");
      }
    } catch (err) {
      console.error("❌ Failed to set up TypeScript:", err.message);
    }
  }

  return { success: true, pkgManager };
}

// 🔍 Detect existing package manager
function detectPackageManager(targetPath) {
  if (fs.existsSync(path.join(targetPath, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(targetPath, "package-lock.json"))) return "npm";
  if (fs.existsSync(path.join(targetPath, "yarn.lock"))) return "yarn";
  if (fs.existsSync(path.join(targetPath, "bun.lockb"))) return "bun";
  return null;
}

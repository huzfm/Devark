import fs from "fs";
import path from "path";
import { execSync, spawnSync } from "child_process";
import {
  intro,
  outro,
  select,
  confirm,
  text,
  spinner,
  cancel,
} from "@clack/prompts";
import { log } from "./moduleUtils.js";
import { entryTemplates, tsConfigTemplate } from "./projectTemplates.js";

export async function ensureNodeProject(targetPath) {
  const packageJsonPath = path.join(targetPath, "package.json");


  if (fs.existsSync(packageJsonPath)) {
    const pkgManager = detectPackageManager(targetPath);
    outro(" Valid project detected!");
    return { success: true, pkgManager };
  }

  log.warn("No project detected in this directory.");


  const shouldCreate = await confirm({
    message: "Would you like to create a new project here?",
    initialValue: true,
  });

  if (shouldCreate === cancel || !shouldCreate) {
    outro("❌ Aborting module installation.");
    return { success: false, pkgManager: null };
  }


  const pkgManager = await select({
    message: "Choose a package manager to initialize the project:",
    options: [
      { label: "bun", value: "bun" },
      { label: "pnpm", value: "pnpm" },
      { label: "npm", value: "npm" },
      { label: "yarn", value: "yarn" },
    ],
    initialValue: "bun",
  });

  if (pkgManager === cancel) {
    outro("Cancelled by user.");
    return { success: false, pkgManager: null };
  }


  if (pkgManager === "bun") {
    console.log(`\n Initializing project with Bun (interactive)...\n`);
    const result = spawnSync("bun", ["init"], {
      cwd: targetPath,
      stdio: "inherit",
    });
    if (result.error) {
      log.error("Failed to initialize Bun project.");
      log.error(result.error.message);
      return { success: false, pkgManager: null };
    }
    log.success("Project initialized successfully!");
  } else {
    const spin = spinner();
    try {
      spin.start(`Initializing a new project with ${pkgManager}...`);
      const initCommands = {
        npm: "npm init -y",
        pnpm: "pnpm init",
        yarn: "yarn init",
      };
      execSync(initCommands[pkgManager], { cwd: targetPath, stdio: "ignore" });
      spin.stop("Project initialized successfully!");
    } catch (error) {
      spin.stop(" Failed to initialize the project.");
      log.error(error.message);
      return { success: false, pkgManager: null };
    }
  }


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
    return { success: false, pkgManager: null };
  }


  const defaultEntry = language === "TypeScript" ? "src/app.ts" : "app.js";
  const entryFile = await text({
    message: "What do you want to name your entry file?",
    placeholder: defaultEntry,
    initialValue: defaultEntry,
  });

  if (entryFile === cancel || !entryFile) {
    outro("Cancelled by user.");
    return { success: false, pkgManager: null };
  }

  const entryPath = path.join(targetPath, entryFile);
  const entryDir = path.dirname(entryPath);
  fs.mkdirSync(entryDir, { recursive: true });


  const entryContent =
    language === "TypeScript" ? entryTemplates.ts : entryTemplates.js;
  fs.writeFileSync(entryPath, entryContent, "utf8");
  log.success(` Entry file created at: ${entryFile}`);


  if (language === "TypeScript") {
    const spinTs = spinner();
    spinTs.start("Setting up TypeScript environment...");
    try {
      execSync(
        `${pkgManager} add -D typescript ts-node @types/node @types/express`,
        { cwd: targetPath, stdio: "ignore" }
      );

      const tsconfigPath = path.join(targetPath, "tsconfig.json");
      if (!fs.existsSync(tsconfigPath)) {
        fs.writeFileSync(
          tsconfigPath,
          JSON.stringify(tsConfigTemplate, null, 2)
        );
        log.info("tsconfig.json created!");
      }
      spinTs.stop("TypeScript environment setup complete!");
    } catch (err) {
      spinTs.stop("Failed to set up TypeScript.");
      log.error(err.message);
    }
  }

  outro("Project setup complete!");
  return { success: true, pkgManager };
}


function detectPackageManager(targetPath) {
  if (fs.existsSync(path.join(targetPath, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(targetPath, "package-lock.json"))) return "npm";
  if (fs.existsSync(path.join(targetPath, "yarn.lock"))) return "yarn";
  if (fs.existsSync(path.join(targetPath, "bun.lockb"))) return "bun";
  return null;
}

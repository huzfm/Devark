import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { log } from "./moduleUtils.js";


export function detectPackageManager(targetPath) {
  const lockFiles = {
    pnpm: ["pnpm-lock.yaml"],
    yarn: ["yarn.lock"],
    npm: ["package-lock.json"],
    bun: ["bun.lock", "bun.lockb"],
  };

  for (const [manager, files] of Object.entries(lockFiles)) {
    if (files.some((file) => fs.existsSync(path.join(targetPath, file)))) {
      return manager;
    }
  }
  return null;
}


export function installDependencies(targetPath, dependencies) {
  const packageManager = detectPackageManager(targetPath);
  if (!packageManager) {
    console.error("  Could not detect package manager. Install manually:");
    console.log(`   npm install ${dependencies.join(" ")}`);
    return;
  }

  const commands = {
    npm: `npm install ${dependencies.join(" ")}`,
    yarn: `yarn add ${dependencies.join(" ")}`,
    pnpm: `pnpm add ${dependencies.join(" ")}`,
    bun: `bun add ${dependencies.join(" ")}`,
  };

  console.log(
    ` Installing dependencies using \x1b[1m\x1b[36m${packageManager}\x1b[0m`
  );
  execSync(commands[packageManager], { cwd: targetPath, stdio: "inherit" });
}


export function isValidNodeProject(targetPath) {
  const pkgPath = path.join(targetPath, "package.json");
  if (!fs.existsSync(pkgPath)) return false;
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    return pkg && typeof pkg === "object";
  } catch {
    return false;
  }
}


export async function installDepsWithChoice(
  targetPath,
  dependencies,
  packageManager
) {
  const commands = {
    npm: `npm install ${dependencies.join(" ")}`,
    yarn: `yarn add ${dependencies.join(" ")}`,
    pnpm: `pnpm add ${dependencies.join(" ")}`,
    bun: `bun add ${dependencies.join(" ")}`,
  };

  if (!commands[packageManager]) {
    return false;
  }

  execSync(commands[packageManager], { cwd: targetPath, stdio: "inherit" });
  return true;
}


export function detectByCommand() {
  const ua = process.env.npm_config_user_agent || "";
  if (ua.startsWith("yarn")) return "yarn";
  if (ua.startsWith("pnpm")) return "pnpm";
  if (ua.startsWith("bun")) return "bun";
  if (ua.startsWith("npm")) return "npm";
  return "bun";
}

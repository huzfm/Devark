import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export function detectPackageManager(targetPath: string) {
  const lockFiles = {
    pnpm: 'pnpm-lock.yaml',
    yarn: 'yarn.lock',
    npm: 'package-lock.json',
  };

  for (const [manager, fileName] of Object.entries(lockFiles)) {
    if (fs.existsSync(path.join(targetPath, fileName))) return manager;
  }
  return null;
}

export function installDependencies(targetPath: string, dependencies: string[]) {
  const packageManager = detectPackageManager(targetPath);
  if (!packageManager) {
    console.error('❌ Could not detect package manager. Install manually:');
    console.log(`   npm install ${dependencies.join(' ')}`);
    return;
  }

  const commands = {
    npm: `npm install ${dependencies.join(' ')}`,
    yarn: `yarn add ${dependencies.join(' ')}`,
    pnpm: `pnpm add ${dependencies.join(' ')}`,
  };

  console.log(`📦 Installing dependencies using \x1b[1m\x1b[36m${packageManager}\x1b[0m`);
  execSync(commands[packageManager as keyof typeof commands], { cwd: targetPath, stdio: 'inherit' });
}

export function isValidNodeProject(targetPath: string) {
  const pkgPath = path.join(targetPath, "package.json");
  if (!fs.existsSync(pkgPath)) {
    return false;
  }
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    return pkg && typeof pkg === "object";
  } catch {
    return false;
  }
}

/**
 * Case 2: Freshly scaffolded project (user chooses package manager)
 */
export async function installDepsWithChoice(targetPath: string, dependencies: string[], packageManager: string) {
  const commands = {
    npm: `npm install ${dependencies.join(" ")}`,
    yarn: `yarn add ${dependencies.join(" ")}`,
    pnpm: `pnpm add ${dependencies.join(" ")}`,
  };

  if (!commands[packageManager as keyof typeof commands]) {
    console.error("❌ Invalid package manager provided.");
    return false;
  }

  console.log(`📦 Installing dependencies using ${packageManager}...`);
  execSync(commands[packageManager as keyof typeof commands], { cwd: targetPath, stdio: "inherit" });
  console.log("✅ Dependencies installed successfully!");
  return true;
}

export function detectPackageManagerByCommnad() {
  const ua = process.env.npm_config_user_agent || "";
  if (ua.startsWith("yarn")) return "yarn";
  if (ua.startsWith("pnpm")) return "pnpm";
  if (ua.startsWith("npm")) return "npm";
  return "npm";
}

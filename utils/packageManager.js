import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Detect package manager by lockfiles in project
 */
export function detectPackageManager(targetPath) {
      const lockFiles = {
            pnpm: ['pnpm-lock.yaml'],
            yarn: ['yarn.lock'],
            npm: ['package-lock.json'],
            bun: ['bun.lock', 'bun.lockb'], // support both Bun versions
      };

      for (const [manager, files] of Object.entries(lockFiles)) {
            if (files.some(file => fs.existsSync(path.join(targetPath, file)))) {
                  return manager;
            }
      }
      return null;
}

/**
 * Install dependencies using detected package manager
 */
export function installDependencies(targetPath, dependencies) {
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
            bun: `bun add ${dependencies.join(' ')}`,
      };

      console.log(`📦 Installing dependencies using \x1b[1m\x1b[36m${packageManager}\x1b[0m`);
      execSync(commands[packageManager], { cwd: targetPath, stdio: 'inherit' });
}

/**
 * Validate if targetPath is a Node.js project
 */
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

/**
 * Install dependencies using a specific package manager (no prompt)
 */
export async function installDepsWithChoice(targetPath, dependencies, packageManager) {
      const commands = {
            npm: `npm install ${dependencies.join(" ")}`,
            yarn: `yarn add ${dependencies.join(" ")}`,
            pnpm: `pnpm add ${dependencies.join(" ")}`,
            bun: `bun add ${dependencies.join(" ")}`,
      };

      if (!commands[packageManager]) {
            console.error("❌ Invalid package manager provided:", packageManager);
            return false;
      }

      console.log(`📦 Installing dependencies using ${packageManager}...`);
      execSync(commands[packageManager], { cwd: targetPath, stdio: "inherit" });
      console.log("✅ Dependencies installed successfully!");
      return true;
}

/**
 * Detect package manager from CLI / user agent
 */
export function detectByCommand() {
      const ua = process.env.npm_config_user_agent || "";
      if (ua.startsWith("yarn")) return "yarn";
      if (ua.startsWith("pnpm")) return "pnpm";
      if (ua.startsWith("bun")) return "bun";
      if (ua.startsWith("npm")) return "npm";
      return "bun";
}

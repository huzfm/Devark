import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export function detectPackageManager(targetPath) {
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
      };

      console.log(`📦 Installing dependencies using ${packageManager}...`);
      execSync(commands[packageManager], { cwd: targetPath, stdio: 'inherit' });
}

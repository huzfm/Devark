import inquirer from 'inquirer'
import fs from 'fs'
import path from 'path'
import { install } from '../../packages/oauth/install.js'
import { resolveEntryFile } from '../../packages/oauth/utils/resolveEntryFile.js'

export async function add() {
      const targetPath = process.cwd();
      const pkgPath = path.join(targetPath, 'package.json');

      // Check if package.json exists
      if (!fs.existsSync(pkgPath)) {
            console.error(`❌ No package.json found in this directory. Please run inside a Node.js project.`);
            return;
      }

      // Resolve entry file (e.g., app.js/server.js) — will prompt if needed
      const entryFile = await resolveEntryFile(targetPath);

      // 🚀 Run the installer
      await install(targetPath, entryFile);
}

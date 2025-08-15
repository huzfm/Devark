// utils/detectPackageManager.js
import fs from 'fs'
import path from 'path'

export function detectPackageManager(targetPath) {
      if (fs.existsSync(path.join(targetPath, 'pnpm-lock.yaml'))) return 'pnpm'
      if (fs.existsSync(path.join(targetPath, 'yarn.lock'))) return 'yarn'
      return 'npm' // default fallback
}

import fs from 'fs-extra'
import { execa } from 'execa'

export default async function init() {
      const folder = 'examples/my-app'
      await fs.ensureDir(folder)

      await fs.writeFile(`${folder}/app.js`, `console.log("Express app ready");\n`)
      await execa('pnpm', ['init'], { cwd: folder, stdio: 'inherit' })
      await execa('pnpm', ['add', 'express', 'express-session', 'passport'], {
            cwd: folder,
            stdio: 'inherit',
      })

      console.log(`✅ Project created in ${folder}/`)
}

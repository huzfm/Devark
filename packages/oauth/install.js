import fs from 'fs'
import path from 'path'
import ejs from 'ejs'
import inquirer from 'inquirer'
import { execSync } from 'child_process'
import { ensureAppJsHasOAuthSetup } from './utils/ensureAppJsHasOAuthSetup.js'
import { createFullAppJs } from './utils/createFullAppJs.js'

export async function install(targetPath, entryFile) {
      targetPath = path.resolve(targetPath)
      const templatesPath = path.join(process.cwd(), 'packages', 'oauth', 'templates')
      const pkgPath = path.join(targetPath, 'package.json')
      const entryFilePath = path.join(targetPath, entryFile)

      if (!fs.existsSync(pkgPath)) {
            console.error('❌ No package.json found.')
            return
      }

      // ✅ If entry file doesn't exist, create it first
      if (!fs.existsSync(entryFilePath)) {
            console.warn(`⚠️ Entry file "${entryFile}" not found. Creating full OAuth app.`)
            createFullAppJs(targetPath, entryFile) // pass entryFile here!
      }

      const { clientId, clientSecret } = await inquirer.prompt([
            { type: 'input', name: 'clientId', message: 'Enter Google Client ID:' },
            { type: 'input', name: 'clientSecret', message: 'Enter Google Client Secret:' },
      ])

      // ✅ .env setup
      const envPath = path.join(targetPath, '.env')
      if (!fs.existsSync(envPath)) {
            fs.writeFileSync(envPath, `GOOGLE_CLIENT_ID=${clientId}\nGOOGLE_CLIENT_SECRET=${clientSecret}\n`)
            console.log('✅ .env created')
      } else {
            console.log('⚠️ .env already exists. Skipped.')
      }

      // ✅ Template injection
      const filesToGenerate = [
            { template: 'authRoutes.ejs', output: 'routes/authRoutes.js' },
            { template: 'passport.ejs', output: 'config/passport.js' },
      ]

      for (const file of filesToGenerate) {
            const templatePath = path.join(templatesPath, file.template)
            const outputPath = path.join(targetPath, file.output)

            const rendered = ejs.render(fs.readFileSync(templatePath, 'utf-8'), {
                  clientId,
                  clientSecret,
            })

            fs.mkdirSync(path.dirname(outputPath), { recursive: true })
            fs.writeFileSync(outputPath, rendered)
            console.log(`✅ Created ${file.output}`)
      }

      // ✅ Insert OAuth into the specified entry file
      console.log(`⚙️ Updating ${entryFile} with OAuth setup...`)
      await ensureAppJsHasOAuthSetup(entryFilePath)

      // ✅ Scripts
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
      pkg.scripts = pkg.scripts || {}

      if (!pkg.scripts.start) {
            pkg.scripts.start = `node ${entryFile}`
            console.log('✅ Added "start" script')
      }

      if (!pkg.scripts.dev) {
            pkg.scripts.dev = `nodemon ${entryFile}`
            console.log('✅ Added "dev" script')
      }

      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
      console.log('✅ package.json updated')

      // ✅ Dependencies
      console.log('📦 Installing dependencies...')
      try {
            execSync(`pnpm add express express-session passport passport-google-oauth20 dotenv`, {
                  cwd: targetPath,
                  stdio: 'inherit',
            })
            execSync(`pnpm add -D nodemon`, {
                  cwd: targetPath,
                  stdio: 'inherit',
            })
            console.log('✅ Dependencies installed.')
      } catch (err) {
            console.error('❌ Dependency installation failed:', err)
      }
}

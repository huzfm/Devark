import fs from 'fs'
import path from 'path'
import ejs from 'ejs'
import { fileURLToPath } from 'url'
import inquirer from 'inquirer'
import { execSync } from 'child_process'
import { ensureAppJsHasOAuthSetup } from './utils/ensureAppJsHasOAuthSetup.js'
import { createFullAppJs } from './utils/createFullAppJs.js'

// Get __dirname from import.meta.url
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function install(targetPath) {
      targetPath = path.resolve(targetPath)

      // Prompt for entry file
      const { entryFile } = await inquirer.prompt([
            {
                  type: 'input',
                  name: 'entryFile',
                  message: 'Enter your entry file (e.g., app.js, server.js):',
                  default: 'app.js',
            }
      ])

      const entryFilePath = path.join(targetPath, entryFile)
      const fileExists = fs.existsSync(entryFilePath)

      // Prompt for credentials
      const { clientID, clientSecret } = await inquirer.prompt([
            { type: 'input', name: 'clientID', message: 'Enter Google Client ID:' },
            { type: 'input', name: 'clientSecret', message: 'Enter Google Client Secret:' },
      ])

      // Write .env file
      const envPath = path.join(targetPath, '.env')
      fs.writeFileSync(envPath, `GOOGLE_CLIENT_ID=${clientID}\nGOOGLE_CLIENT_SECRET=${clientSecret}\n`, 'utf-8')
      console.log('✅ .env created')

      // Use correct template path
      const authRoutesTemplatePath = path.join(__dirname, 'templates', 'authRoutes.ejs')
      const passportConfigTemplatePath = path.join(__dirname, 'templates', 'passport.ejs')

      const routesDir = path.join(targetPath, 'routes')
      const configDir = path.join(targetPath, 'config')
      fs.mkdirSync(routesDir, { recursive: true })
      fs.mkdirSync(configDir, { recursive: true })

      // Render and write route and config files
      const authRoutes = ejs.render(fs.readFileSync(authRoutesTemplatePath, 'utf-8'))
      const passportConfig = ejs.render(fs.readFileSync(passportConfigTemplatePath, 'utf-8'))

      fs.writeFileSync(path.join(routesDir, 'authRoutes.js'), authRoutes, 'utf-8')
      fs.writeFileSync(path.join(configDir, 'passport.js'), passportConfig, 'utf-8')
      console.log('✅ OAuth route and passport config created')

      // Insert into app.js or create it
      if (fileExists) {
            await ensureAppJsHasOAuthSetup(entryFilePath)
      } else {
            console.log("No Project found")
            //createFullAppJs(targetPath, entryFile) // pass filename explicitly
      }

      // Dependencies
      const dependencies = ['express', 'passport', 'passport-google-oauth20', 'dotenv', 'express-session']
      execSync(`pnpm add ${dependencies.join(' ')}`, { cwd: targetPath, stdio: 'inherit' })

      // Add dev script to package.json
      const packageJsonPath = path.join(targetPath, 'package.json')
      if (fs.existsSync(packageJsonPath)) {
            const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
            pkg.scripts = pkg.scripts || {}
            pkg.scripts.start = pkg.scripts.start || `node ${entryFile}`
            fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2), 'utf-8')
            console.log('✅ Added "start" script to package.json')
      }

      console.log('✅ OAuth module installed successfully 🚀')
}

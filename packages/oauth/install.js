import fs from 'fs'
import path from 'path'
import ejs from 'ejs'
import { fileURLToPath } from 'url'
import inquirer from 'inquirer'
import { execSync } from 'child_process'
import { ensureAppJsHasOAuthSetup } from './utils/ensureAppJsHasOAuthSetup.js'

// Get __dirname from import.meta.url
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)




function detectPackageManager(targetPath) {
      if (fs.existsSync(path.join(targetPath, 'pnpm-lock.yaml'))) return 'pnpm'
      if (fs.existsSync(path.join(targetPath, 'yarn.lock'))) return 'yarn'
      if (fs.existsSync(path.join(targetPath, 'package-lock.json'))) return 'npm'
      return null
}

export default async function install(targetPath = process.cwd()) {
      targetPath = path.resolve(targetPath)
      console.log("\x1b[32m\x1b[1mThis adds Google-OAuth module to your project. Please follow the instructions carefully.\x1b[0m");

      const packageJsonPath = path.join(targetPath, 'package.json')
      if (!fs.existsSync(packageJsonPath)) {
            console.error('❌ No package.json found in the target project. Aborting.')
            return
      }

      const { entryFile } = await inquirer.prompt([
            {
                  type: 'input',
                  name: 'entryFile',
                  message: 'Enter your entry file (e.g., app.js, server.js):',
                  default: 'app.js',
            },
      ])

      const entryFilePath = path.join(targetPath, entryFile)
      const entryFileExists = fs.existsSync(entryFilePath)

      if (!entryFileExists) {
            console.error(`❌ Entry file "${entryFile}" not found in target project. Aborting.`)
            return
      }

      const { clientID, clientSecret } = await inquirer.prompt([
            { type: 'input', name: 'clientID', message: 'Enter Google Client ID:' },
            { type: 'input', name: 'clientSecret', message: 'Enter Google Client Secret:' },
      ])

      const envPath = path.join(targetPath, '.env')
      fs.writeFileSync(envPath, `GOOGLE_CLIENT_ID=${clientID}\nGOOGLE_CLIENT_SECRET=${clientSecret}\n`, 'utf-8')
      console.log('✅ .env created')

      const authRoutesTemplatePath = path.join(__dirname, 'templates', 'authRoutes.ejs')
      const passportConfigTemplatePath = path.join(__dirname, 'templates', 'passport.ejs')

      const routesDir = path.join(targetPath, 'routes')
      const configDir = path.join(targetPath, 'config')
      fs.mkdirSync(routesDir, { recursive: true })
      fs.mkdirSync(configDir, { recursive: true })

      const authRoutes = ejs.render(fs.readFileSync(authRoutesTemplatePath, 'utf-8'))
      const passportConfig = ejs.render(fs.readFileSync(passportConfigTemplatePath, 'utf-8'))

      fs.writeFileSync(path.join(routesDir, 'authRoutes.js'), authRoutes, 'utf-8')
      fs.writeFileSync(path.join(configDir, 'passport.js'), passportConfig, 'utf-8')
      console.log('✅ OAuth route and passport config created')

      await ensureAppJsHasOAuthSetup(entryFilePath)

      const dependencies = ['express', 'passport', 'passport-google-oauth20', 'dotenv', 'express-session']
      const packageManager = detectPackageManager(targetPath)

      if (!packageManager) {
            console.error('❌ Could not detect package manager (pnpm, npm, or yarn). Please install dependencies manually.')
            return
      }

      console.log(`📦 Installing dependencies using ${packageManager}...`)
      const installCmd =
            packageManager === 'npm'
                  ? `npm install ${dependencies.join(' ')}`
                  : packageManager === 'yarn'
                        ? `yarn add ${dependencies.join(' ')}`
                        : `pnpm add ${dependencies.join(' ')}`

      execSync(installCmd, { cwd: targetPath, stdio: 'inherit' })

      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
      pkg.scripts = pkg.scripts || {}
      pkg.scripts.start = pkg.scripts.start || `node ${entryFile}`
      fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2), 'utf-8')
      console.log('✅ Added "start" script to package.json')

      console.log('✅ OAuth module installed successfully 🚀')
}

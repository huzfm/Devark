
import fs from 'fs'
import path from 'path'
import ejs from 'ejs'
import inquirer from 'inquirer'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { ensureAppJsHasOAuthSetup } from './utils/ensureAppJsHasOAuthSetup.js'
import { createFullAppJs } from './utils/createFullAppJs.js'

// For __dirname support in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function install(targetPath) {
      // ✅ Use module-safe path resolution
      const templatesPath = path.join(__dirname, 'templates')

      // Step 1: Ask for OAuth credentials
      const { clientId, clientSecret } = await inquirer.prompt([
            { type: 'input', name: 'clientId', message: 'Enter Google Client ID:' },
            { type: 'input', name: 'clientSecret', message: 'Enter Google Client Secret:' },
      ])

      // Step 2: Create .env file if not exists
      const envPath = path.join(targetPath, '.env')
      if (!fs.existsSync(envPath)) {
            fs.writeFileSync(envPath, `GOOGLE_CLIENT_ID=${clientId}\nGOOGLE_CLIENT_SECRET=${clientSecret}\n`)
            console.log('✅ .env created')
      } else {
            console.log('⚠️ .env already exists. Skipped.')
      }

      // Step 3: Render and write template files
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

      // Step 4: Handle app.js
      const appJsPath = path.join(targetPath, 'app.js')
      if (fs.existsSync(appJsPath)) {
            console.log('⚙️  app.js found, injecting required lines...')
            await ensureAppJsHasOAuthSetup(appJsPath)
      } else {
            console.log('❌ app.js not found. Creating new app.js...')
            await createFullAppJs(targetPath)
      }

      // Step 5: Handle package.json
      const pkgPath = path.join(targetPath, 'package.json')
      let pkg = {}

      if (fs.existsSync(pkgPath)) {
            console.log('📄 package.json found. Updating scripts...')
            pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
      } else {
            console.log('🆕 No package.json found. Creating a new one...')
            pkg = {
                  name: 'oauth-app',
                  version: '1.0.0',
                  type: 'module',
                  scripts: {},
            }
      }

      pkg.scripts = pkg.scripts || {}

      if (!pkg.scripts.start) {
            pkg.scripts.start = 'node app.js'
            console.log('✅ Added "start" script')
      }

      if (!pkg.scripts.dev) {
            pkg.scripts.dev = 'nodemon app.js'
            console.log('✅ Added "dev" script')
      }

      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
      console.log('✅ package.json updated')

      // Step 6: Install dependencies
      console.log('📦 Installing required dependencies...\n')
      try {
            execSync(`pnpm add express express-session passport passport-google-oauth20 dotenv`, { cwd: targetPath, stdio: 'inherit' })
            execSync(`pnpm add -D nodemon`, { cwd: targetPath, stdio: 'inherit' })
            console.log('✅ Dependencies installed successfully.')
      } catch (err) {
            console.error('❌ Failed to install dependencies:', err)
      }
}

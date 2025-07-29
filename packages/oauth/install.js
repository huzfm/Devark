import fs from 'fs'
import path from 'path'
import ejs from 'ejs'
import { input } from '@inquirer/prompts'

export default async function install() {
      const clientID = await input({ message: 'Enter Google Client ID:' })
      const clientSecret = await input({ message: 'Enter Google Client Secret:' })

      const appDir = path.join(process.cwd(), 'examples', 'my-app')
      const configDir = path.join(appDir, 'config')
      const routesDir = path.join(appDir, 'routes')

      fs.mkdirSync(configDir, { recursive: true })
      fs.mkdirSync(routesDir, { recursive: true })

      // Create .env if not present
      const envPath = path.join(appDir, '.env')
      if (!fs.existsSync(envPath)) {
            const envContent = `GOOGLE_CLIENT_ID=${clientID}\nGOOGLE_CLIENT_SECRET=${clientSecret}\n`
            fs.writeFileSync(envPath, envContent)
            console.log('✅ .env created')
      } else {
            console.log('⚠️ .env already exists, skipping creation')
      }

      // Copy templates with EJS
      const templatesDir = path.join(process.cwd(), 'packages', 'oauth', 'templates')

      const passportTemplate = fs.readFileSync(path.join(templatesDir, 'passport.ejs'), 'utf-8')
      const passportCode = ejs.render(passportTemplate)
      fs.writeFileSync(path.join(configDir, 'passport.js'), passportCode)

      const authRoutesTemplate = fs.readFileSync(path.join(templatesDir, 'authRoutes.ejs'), 'utf-8')
      const authRoutesCode = ejs.render(authRoutesTemplate)
      fs.writeFileSync(path.join(routesDir, 'authRoutes.js'), authRoutesCode)

      console.log('✅ OAuth installed in example app!')
}

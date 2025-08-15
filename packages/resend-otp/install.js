import fs from 'fs'
import path from 'path'
import ejs from 'ejs'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import inquirer from 'inquirer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function detectPackageManager(targetPath) {
      if (fs.existsSync(path.join(targetPath, 'pnpm-lock.yaml'))) return 'pnpm'
      if (fs.existsSync(path.join(targetPath, 'yarn.lock'))) return 'yarn'
      if (fs.existsSync(path.join(targetPath, 'package-lock.json'))) return 'npm'
      return null
}

function injectEnvVarsInline(vars = {}, targetPath) {
      const envPath = path.join(targetPath, '.env')
      let content = ''

      if (fs.existsSync(envPath)) {
            content = fs.readFileSync(envPath, 'utf-8')
      }

      const lines = content.split('\n').filter(Boolean)
      const existingKeys = new Set(lines.map(line => line.split('=')[0]))

      for (const [key, value] of Object.entries(vars)) {
            const line = `${key}=${value}`
            if (existingKeys.has(key)) {
                  const index = lines.findIndex(l => l.startsWith(key + '='))
                  lines[index] = line
            } else {
                  lines.push(line)
            }
      }

      fs.writeFileSync(envPath, lines.join('\n') + '\n', 'utf-8')
      console.log('✅ Environment variables updated in .env')
}

function injectRouteAndJsonMiddleware(targetPath, entryFile) {
      const entryPath = path.join(targetPath, entryFile)
      if (!fs.existsSync(entryPath)) {
            console.warn(`⚠️ ${entryFile} not found. Skipping route injection.`)
            return
      }

      let appContent = fs.readFileSync(entryPath, 'utf-8')
      let modified = false

      if (!appContent.includes(`import express`)) {
            appContent = `import express from 'express'\n` + appContent
            modified = true
      }

      if (!appContent.includes('app.use(express.json())')) {
            const appInitIndex = appContent.indexOf('const app =') || appContent.indexOf('const app=')
            if (appInitIndex !== -1) {
                  const insertIndex = appContent.indexOf('\n', appInitIndex) + 1
                  appContent = appContent.slice(0, insertIndex) + `app.use(express.json());\n` + appContent.slice(insertIndex)
                  console.log('✅ app.use(express.json()) injected')
                  modified = true
            }
      }

      if (!appContent.includes(`./routes/otpRoutes`)) {
            appContent = `import otpRoutes from './routes/otpRoutes.js'\n` + appContent
            modified = true
      }

      if (!appContent.includes(`app.use("/", otpRoutes)`)) {
            const useRegex = /app\.use\(.*\)/g
            const lastUse = [...appContent.matchAll(useRegex)].pop()
            const insertPos = lastUse ? lastUse.index + lastUse[0].length : appContent.length
            appContent = appContent.slice(0, insertPos) + `\napp.use("/", otpRoutes);` + appContent.slice(insertPos)
            console.log('✅ Route injected')
            modified = true
      }

      if (modified) {
            fs.writeFileSync(entryPath, appContent, 'utf-8')
      }
}

export default async function install(targetPath = process.cwd()) {
      console.log("\x1b[32m\x1b[1mThis adds Resend-based OTP module to your project. Please follow the instructions carefully.\x1b[0m");

      targetPath = path.resolve(targetPath)

      const packageJsonPath = path.join(targetPath, 'package.json')
      if (!fs.existsSync(packageJsonPath)) {
            console.error('❌ No package.json found in target project.')
            return
      }

      const { entryFile, resendApiKey, fromEmail } = await inquirer.prompt([
            {
                  type: 'input',
                  name: 'entryFile',
                  message: 'What is the entry file of your project? (e.g., app.js or index.js)',
                  default: 'app.js',
            },
            {
                  type: 'input',
                  name: 'resendApiKey',
                  message: 'Enter your Resend API Key:',
            },
            {
                  type: 'input',
                  name: 'fromEmail',
                  message: 'Enter your Resend FROM Email:',
            },
      ])

      injectEnvVarsInline(
            {
                  RESEND_API_KEY: resendApiKey,
                  FROM_EMAIL: fromEmail,
            },
            targetPath
      )

      const controllersDir = path.join(targetPath, 'controllers')
      const routesDir = path.join(targetPath, 'routes')
      fs.mkdirSync(controllersDir, { recursive: true })
      fs.mkdirSync(routesDir, { recursive: true })

      const otpTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'otp.ejs'), 'utf-8')
      const otpFunctionsTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'otpFunctions.ejs'), 'utf-8')
      const otpRoutesTemplate = fs.readFileSync(path.join(__dirname, 'templates', 'otpRoutes.ejs'), 'utf-8')

      fs.writeFileSync(path.join(controllersDir, 'otp.js'), ejs.render(otpTemplate), 'utf-8')
      fs.writeFileSync(path.join(controllersDir, 'otp-functions.js'), ejs.render(otpFunctionsTemplate), 'utf-8')
      fs.writeFileSync(path.join(routesDir, 'otpRoutes.js'), ejs.render(otpRoutesTemplate), 'utf-8')

      injectRouteAndJsonMiddleware(targetPath, entryFile)

      const dependencies = ['express', 'resend', 'dotenv']
      const packageManager = detectPackageManager(targetPath)

      if (!packageManager) {
            console.error('❌ Could not detect package manager. Please install manually.')
            return
      }

      const installCmd =
            packageManager === 'npm'
                  ? `npm install ${dependencies.join(' ')}`
                  : packageManager === 'yarn'
                        ? `yarn add ${dependencies.join(' ')}`
                        : `pnpm add ${dependencies.join(' ')}`

      console.log(`📦 Installing dependencies using ${packageManager}...`)
      execSync(installCmd, { cwd: targetPath, stdio: 'inherit' })

      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
      pkg.scripts = pkg.scripts || {}
      pkg.scripts.start = pkg.scripts.start || `node ${entryFile}`
      fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2), 'utf-8')

      console.log('✅ Resend based OTP module installed successfully 🚀')
}

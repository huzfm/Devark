import fs from 'fs'
import path from 'path'

const requiredImports = [
      `import 'dotenv/config'`,
      `import session from 'express-session'`,
      `import passport from 'passport'`,
      `import googleRoutes from './routes/googleRoutes.js'`,
      `import './config/googleStrategy.js'`,
]

const sessionMiddleware = `app.use(session({
  secret: 'your-session-secret', // or use process.env.SESSION_SECRET
  resave: false,
  saveUninitialized: false,
}))`

const requiredMiddleware = [
      sessionMiddleware,
      `app.use(passport.initialize())`,
      `app.use(passport.session())`,
      `app.use('/',googleRoutes)`,
]

export async function ensureAppJsHasOAuthSetup(appJsPath) {
      if (!fs.existsSync(appJsPath) || !fs.lstatSync(appJsPath).isFile()) {
            throw new Error(`❌ Provided path is not a file: ${appJsPath}`)
      }

      let content = fs.readFileSync(appJsPath, 'utf-8')
      let lines = content.split('\n')
      let updated = false

      // Remove existing required imports (to reinsert them at top cleanly)
      lines = lines.filter(line => !requiredImports.includes(line.trim()))

      // Insert all required imports at the very top in defined order
      lines = [...requiredImports, '', ...lines]
      updated = true

      // Ensure app = express() exists
      const appLineIndex = lines.findIndex(line =>
            /(?:const|let|var)\s+app\s*=\s*express\s*\(\)/.test(line)
      )

      if (appLineIndex === -1) {
            lines.push('', 'const app = express()')
      }

      const finalAppLineIndex = lines.findIndex(line =>
            /(?:const|let|var)\s+app\s*=\s*express\s*\(\)/.test(line)
      )

      // Remove old middleware lines (to reinsert in correct order)
      const middlewareKeywords = ['app.use(session(', 'app.use(passport.initialize()', 'app.use(passport.session()', 'app.use(authRoutes']
      lines = lines.filter(line => !middlewareKeywords.some(keyword => line.trim().startsWith(keyword)))

      // Insert all middlewares in correct order after app = express()
      lines.splice(finalAppLineIndex + 1, 0, ...requiredMiddleware)

      fs.writeFileSync(appJsPath, lines.join('\n'), 'utf-8')
}

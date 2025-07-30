import fs from 'fs'
import path from 'path'

const requiredImports = [
      `import 'dotenv/config'`,
      `import session from 'express-session'`,
      `import passport from 'passport'`,
      `import authRoutes from './routes/authRoutes.js'`,
      `import './config/passport.js'`
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
      `app.use(authRoutes)`
]

export async function ensureAppJsHasOAuthSetup(appJsPath) {
      if (!fs.existsSync(appJsPath) || !fs.lstatSync(appJsPath).isFile()) {
            throw new Error(`❌ Provided path is not a file: ${appJsPath}`)
      }

      let content = fs.readFileSync(appJsPath, 'utf-8')
      let lines = content.split('\n')
      let updated = false

      // 1. Insert imports at the top (after the first import or at the top)
      const firstImportIndex = lines.findIndex(line => line.startsWith('import'))
      for (const imp of requiredImports.reverse()) {
            if (!lines.some(line => line.trim() === imp)) {
                  lines.splice(firstImportIndex >= 0 ? firstImportIndex : 0, 0, imp)
                  updated = true
            }
      }

      // 2. Detect the app creation line more flexibly
      const appLineIndex = lines.findIndex(line =>
            /(?:const|let|var)\s+app\s*=\s*express\s*\(\)/.test(line)
      )

      const insertIndex = appLineIndex !== -1 ? appLineIndex + 1 : lines.length - 1

      // 3. Insert middleware after app = express()
      for (const middleware of requiredMiddleware) {
            const firstLine = middleware.split('\n')[0].trim()
            if (!lines.some(line => line.trim().startsWith(firstLine))) {
                  lines.splice(insertIndex, 0, middleware)
                  updated = true
            }
      }

      if (updated) {
            fs.writeFileSync(appJsPath, lines.join('\n'), 'utf-8')
            console.log('✅ Inserted missing OAuth code into app.js')
      } else {
            console.log('✅ app.js already contains OAuth setup.')
      }
}

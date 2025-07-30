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
      let updated = false

      // Insert imports at the top (after first import if exists)
      const lines = content.split('\n')
      const firstImportIndex = lines.findIndex(line => line.startsWith('import'))
      for (const imp of requiredImports.reverse()) {
            if (!content.includes(imp)) {
                  lines.splice(firstImportIndex >= 0 ? firstImportIndex : 0, 0, imp)
                  updated = true
            }
      }

      // Insert middleware after "const app = express()"
      const appLineIndex = lines.findIndex(line => line.includes('const app = express()'))
      if (appLineIndex !== -1) {
            for (const middleware of requiredMiddleware.reverse()) {
                  if (!content.includes(middleware.split('\n')[0])) {
                        lines.splice(appLineIndex + 1, 0, middleware)
                        updated = true
                  }
            }
      }

      if (updated) {
            fs.writeFileSync(appJsPath, lines.join('\n'), 'utf-8')
            console.log('✅ Inserted missing OAuth code into app.js')
      } else {
            console.log('✅ app.js already contains OAuth setup.')
      }
}

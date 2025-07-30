import fs from 'fs'
import path from 'path'

export function createFullAppJs(projectPath) {
      const appJsContent = `
  import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import passport from 'passport'
import authRoutes from './routes/authRoutes.js'
import './config/passport.js'

const app = express()

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(authRoutes)
const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
  console.log('🚀 Server running at',PORT)
})
`.trimStart()

      const appJsPath = path.join(projectPath, 'app.js')
      fs.writeFileSync(appJsPath, appJsContent, 'utf-8')
      console.log('✅ Created app.js with full OAuth setup.')
}

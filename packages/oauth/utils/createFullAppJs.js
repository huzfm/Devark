import fs from 'fs'
import path from 'path'

export function createFullAppJs(projectPath, filename = 'app.js') {
  const content = `
import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import passport from 'passport'
import authRoutes from './routes/authRoutes.js'
import './config/passport.js'

const app = express()

app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: false,
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(authRoutes)

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log('🚀 Server running at', PORT)
})
`.trimStart()

  const filePath = path.join(projectPath, filename)
  fs.writeFileSync(filePath, content, 'utf-8')
  console.log(`✅ Created ${filename} with full OAuth setup.`)
}

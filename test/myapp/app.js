import 'dotenv/config'
import session from 'express-session'
import passport from 'passport'
import authRoutes from './routes/authRoutes.js'
import './config/passport.js'



import express from 'express';
const app = express();
app.use(session({
  secret: 'your-session-secret', // or use process.env.SESSION_SECRET
  resave: false,
  saveUninitialized: false,
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(authRoutes)

app.listen(3000, () => {
      console.log('Server is running on http://localhost:3000');
})
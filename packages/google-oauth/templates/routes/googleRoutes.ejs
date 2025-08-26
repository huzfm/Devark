import express from 'express'
import passport from 'passport'

const router = express.Router()

router.get('/auth/google',
passport.authenticate('google', { scope: ['profile', 'email'] })
)

router.get('/auth/google/callback',
passport.authenticate('google', {
failureRedirect: '/auth/failure',
successRedirect: '/success', // ✅ redirect here after login
})
)

router.get('/auth/failure', (req, res) => {
res.send('❌ Failed to authenticate..')
})

// ✅ Success page route
router.get('/success', (req, res) => {
res.send('✅ Logged in successfully!')
})

export default router
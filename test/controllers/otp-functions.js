import { sendOtp, verifyOtp } from '../controllers/otp.js';

export async function sendOtpHandler(req, res) {
      const { email } = req.body;

      if (!email) {
            return res.status(400).json({ error: 'Email required' });
      }

      const sent = await sendOtp(email);

      if (sent) {
            return res.json({
                  message: 'OTP sent successfully',
                  success: true,
            });
      } else {
            return res.status(500).json({
                  message: 'Failed to send OTP',
                  success: false,
            });
      }
}

export function verifyOtpHandler(req, res) {
      const { email, otp } = req.body;

      if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required.' });
      }

      const valid = verifyOtp(email, otp);

      if (valid) {
            return res.status(200).json({ message: 'correct' });
      } else {
            return res.status(401).json({ error: 'incorrect' });
      }
}
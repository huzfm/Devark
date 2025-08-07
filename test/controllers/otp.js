// otp.js
import dotenv from "dotenv";
dotenv.config();

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const otpStore = new Map();
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export async function sendOtp(email) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + OTP_EXPIRY_MS;

      otpStore.set(email, { otp, expiresAt });

      const htmlContent = `
<p>Hello,</p>
<p>Your OTP for logging in is:</p>
<p><strong>${otp}</strong></p>
<p>This OTP will expire in 5 minutes. Do not share it with anyone.</p>
<p>&copy; ${new Date().getFullYear()}/p>
      `;

      try {
            await resend.emails.send({
                  from: process.env.FROM_EMAIL,
                  to: email,
                  subject: "Your OTP is",
                  html: htmlContent,
            });
            return true;
      } catch (err) {
            console.error("Failed to send OTP:", err);
            return false;
      }
}

export function verifyOtp(email, otp) {
      const entry = otpStore.get(email);
      if (!entry) return false;

      if (Date.now() > entry.expiresAt) {
            otpStore.delete(email); // Clean up expired OTP
            return false;
      }

      return entry.otp === otp;
}
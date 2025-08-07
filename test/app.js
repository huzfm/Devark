import otpRoutes from './routes/otpRoutes.js'
import express from 'express'
const app = express();
app.use(express.json())
app.use("/", otpRoutes);;
app.listen(8000, () => {
      console.log('Server is running on port 3000');
})
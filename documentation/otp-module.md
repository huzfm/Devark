
# How the `otp` Feature Works (Devark CLI)

> This documentation explains how the `devark add otp` command works internally.

---

## 🔐 Goal

To quickly scaffold OTP email verification using the **Resend API** without storing OTPs manually.

---

## ✅ Example Command

```bash
npx devark add otp
```

This adds the **OTP via email** module to the current Express.js backend project.

---

## ⚙️ What Happens Behind the Scenes

The CLI runs 5 steps for every feature module:

---

### 1. Validate and Prepare Files

- Ensures essential files exist:  
  - `app.js`  
  - `.env`  
  - `package.json`
- If any is missing, creates default versions.

**Technologies used:**  
`fs`, `path`

---

### 2. Modify `app.js`

Patches `app.js` to:

- Ensure `express.json()` middleware is added
- Register OTP routes:
  ```js
  const otpRoutes = require("./routes/otpRoutes");
  app.use("/", otpRoutes);
  ```

**Safety Checks:**
- Only inserts code if it's not already present.

---

### 3. Install Dependencies

Automatically installs the following:

```bash
pnpm add express dotenv resend
```

Also supports `npm` or `yarn` based on project.

---

### 4. Generate Route and Controller Files

Creates the following structure:

```
/controllers/
  └── otpFunctions.js     ← Sends and verifies OTP (no local storage)

/routes/
  └── otpRoutes.js        ← Exposes API routes:
                               POST /send-otp
                               POST /verify-otp
```

Templates are rendered using `.ejs` and filled with correct logic.

---

### 5. Update `.env` and Prompt Inputs

Prompts user for:

- `RESEND_API_KEY`
- `FROM_EMAIL`

These are then saved into `.env` file:

```
RESEND_API_KEY=your-key-here
FROM_EMAIL=admin@example.com
```

---

## 🔄 Flow: How OTP Verification Works

1. **User hits `/send-otp` with an email**  
   → A 6-digit OTP is generated  
   → OTP is sent using Resend API  
   → A hash of the OTP is returned to the client

2. **User hits `/verify-otp` with OTP + hash**  
   → Verifies OTP on the server using HMAC  
   → Returns success/failure

**✅ No OTP is stored** — secure by design.

---

## 🗂 Folder Structure (Feature Module)

```
modules/
  └── otp/
      ├── templates/
      │   ├── controllers/
      │   │   └── otp-functions.ejs
      │   └── routes/
      │       └── otpRoutes.ejs
      ├── install.js
```

---

## 🧰 Technologies Used

- `express` – Web framework
- `dotenv` – Load environment variables
- `resend` – For sending OTP emails
- `crypto` – HMAC hashing for OTP verification

---

## 📂 Final Project Structure Example

```
app.js
.env
routes/
  └── otpRoutes.js
controllers/
  └── otpFunctions.js
```

---

## 🛠 How to Add a New Feature (Devark CLI)

1. Create folder `modules/<feature>/`
2. Add:
   - `templates/` (e.g. for routes/controllers)
   - `install.js` to define the module logic
3. Register feature in CLI entry file (`bin/devark.js`)

---

## 🌟 Future Ideas for OTP

- Add expiration logic (currently handled stateless)
- Use Redis for rate limiting
- Add SMS support (e.g. Twilio)

---

## ✅ Requirements

- Node.js 18+
- Project must have:
  - `package.json`
  - `app.js`
  - `.env`

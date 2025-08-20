# 📄 Resend OTP Module (Devark CLI)

> This document explains how the `devark add resend-otp` command integrates **Resend-based OTP email verification** into your backend project.

---

## 🔐 Goal

Easily scaffold **OTP email verification** in an Express.js backend using the **Resend API**, without the need to manually store OTPs.

---

## ✅ Example Command

```bash
npx devark add resend-otp
```

This command installs and configures the **Resend OTP module** into your project.

---

## ⚙️ What Happens Behind the Scenes

When you run `devark add resend-otp`, the CLI executes the following steps:

---

### 1. Validate & Prepare Project Files

- Ensures essential files are present:  
  - `app.js`  
  - `.env`  
  - `package.json`

**Technologies used:**  
`fs`, `path`

---

### 2. Update `app.js`

The CLI modifies `app.js` to:

- Add required middleware:
  ```js
  app.use(express.json());
  ```
- Register OTP routes:
  ```js
  const otpRoutes = require("./routes/otpRoutes");
  app.use("/", otpRoutes);
  ```

**Built-in Safety:**  
Code is only inserted if not already present.

---

### 3. Install Dependencies

Automatically installs required packages:

```bash
pnpm add express dotenv resend
```

- Supports **pnpm**, **npm**, or **yarn**, depending on your project setup.

---

### 4. Generate Controllers & Routes

Creates OTP logic and routes inside your project:

```
/controllers/
  └── otpFunctions.js   ← Handles sending & verifying OTP
/routes/
  └── otpRoutes.js      ← Exposes REST API endpoints:
                            POST /send-otp
                            POST /verify-otp
```

Templates are generated from `.ejs` files bundled with the module.

---

### 5. Configure Environment Variables

Prompts you for:

- `RESEND_API_KEY`
- `FROM_EMAIL`

Then appends them to `.env`:

```
RESEND_API_KEY=your-api-key
FROM_EMAIL=admin@example.com
```

---

## 🔄 OTP Verification Flow

1. **Request OTP**  
   Client calls `/send-otp` with an email.  
   → A 6-digit OTP is generated  
   → OTP is sent via **Resend API**  
   → Server returns an HMAC hash of the OTP to the client

2. **Verify OTP**  
   Client calls `/verify-otp` with the OTP + hash.  
   → Server verifies using **HMAC**  
   → Responds with **success** or **failure**

**Key Point:**  
✅ No OTP is stored on the server — fully stateless and secure.

---

## 📂 Module Folder Structure

```
packages/
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

- **express** – API framework  
- **dotenv** – Manage environment variables  
- **resend** – Send OTP emails  
- **crypto** – Secure HMAC hashing  

---

## 📦 Final Project Structure (after install)

```
app.js
.env
routes/
  └── otpRoutes.js
controllers/
  └── otpFunctions.js
```

---

## 🛠 Adding a New Feature (Devark CLI)

To add another module in Devark:

1. Create `modules/<feature>/`  
2. Add:
   - `templates/` → route & controller `.ejs` files  
   - `install.js` → installation logic  
3. Register feature in the CLI entry file (`bin/devark.js`)

---

## 🌟 Future Improvements for OTP Module

- Add OTP expiration time  
- Implement rate limiting with Redis  
- Add SMS support (e.g., **Twilio**)  

---

## ✅ Requirements

- Node.js **18+**
- A project with:
  - `package.json`
  - `app.js`
  - `.env`

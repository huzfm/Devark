# How Devark Google OAuth Works

This document explains how the `devark` CLI integrates **Google OAuth** into your Node.js project.

> Goal: Help developers understand what happens when they run `devark add google-oauth`.

---

## 🚀 CLI Command Example

```
npx devark add google-oauth
```

This command adds **Google OAuth authentication** to the current Node.js project.

---

## ⚙️ What Happens Behind the Scenes

The CLI runs 5 main steps for Google OAuth:

---

### 1. Validate and Prepare Files

- Ensures essential files exist (`app.js`, `package.json`, `.env`)

**Uses:**

```js
import fs from 'fs';
import path from 'path';
```

---

### 2. Modify or Patch `app.js`

The CLI guarantees that:

- Required **Google OAuth imports** exist
- `express-session` middleware is placed **before** `passport.initialize()`
- Google OAuth routes are registered
- Duplicate lines are avoided

**Logic Example:**

```js
if (!appJs.includes("const passport = require('passport')")) {
      const updated = `const passport = require('passport');\n` + appJs;
      fs.writeFileSync('app.js', updated);
}
```

---

### 3. Install Dependencies

The CLI installs packages needed for Google OAuth:

```
pnpm add passport passport-google-oauth20 express-session dotenv
```

It auto-detects the package manager (`npm`, `pnpm`, or `yarn`).

---

### 4. 🧱 Generate Google OAuth Templates

Feature-specific files are generated from internal templates:

```
/templates/google-oauth/
  └── routes/
      └── auth.js.ejs
```

Copied into your project as:

```
/my-project/routes/auth.js
```

---

### 5. Update `.env` and `package.json`

- Adds **Google OAuth environment variables** in `.env`:

```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

- Updates `package.json` scripts if needed:

```json
"scripts": {
  "start": "node app.js",
  "dev": "nodemon app.js"
}
```

---

## 📂 Folder Structure (Google OAuth Module)

Each OAuth feature is self-contained:

```
modules/
  └── google-oauth/
      ├── templates/
      │   └── authRoute.ejs
      ├── install.js
      └── ensureAppJsHasOAuthSetup.js
```

- **install.js** → Entry point for feature setup
- **ensureAppJsHasOAuthSetup.js** → Patches existing `app.js` with Google OAuth logic

---

## 🔄 Google OAuth Setup Workflow

| Step | Purpose                                  | Tools Used               |
| ---- | ---------------------------------------- | ------------------------ |
| 1️⃣   | Setup / Validate files                   | `fs`, `path`             |
| 2️⃣   | Patch `app.js` with Google OAuth         | regex, string checks     |
| 3️⃣   | Install deps (`passport-google-oauth20`) | `child_process.execSync` |
| 4️⃣   | Add Google OAuth route templates         | `fs.copyFileSync`        |
| 5️⃣   | Update `.env`, `package.json`            | string, JSON             |

---

## ✅ Requirements

- Node.js v18+
- A Google Cloud Project with **OAuth 2.0 credentials**
- `package.json` initialized in the project
- One of: `pnpm`, `npm`, or `yarn` installed globally

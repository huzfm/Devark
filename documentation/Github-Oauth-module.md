# How Devark GitHub OAuth Works

This document explains how the `devark` CLI integrates **GitHub OAuth** into your Node.js project.

> Goal: Help developers understand what happens when they run `devark add github-oauth`.

---

## 🚀 CLI Command Example

```bash
npx devark add github-oauth
```

This command adds **GitHub OAuth authentication** to the current Node.js project.

---

## ⚙️ What Happens Behind the Scenes

The CLI runs 5 main steps for GitHub OAuth:

---

### 1. Validate and Prepare Files

- Ensures essential files exist (`app.js`, `package.json`, `.env`)

**Uses:**

```js
import fs from "fs";
import path from "path";
```

---

### 2. Modify or Patch `app.js`

The CLI guarantees that:

- Required **GitHub OAuth imports** exist  
- `express-session` middleware is placed **before** `passport.initialize()`  
- GitHub OAuth routes are registered  
- Duplicate lines are avoided  

**Logic Example:**

```js
if (!appJs.includes("const passport = require('passport')")) {
  const updated = `const passport = require('passport');
` + appJs;
  fs.writeFileSync("app.js", updated);
}
```

---

### 3. Install Dependencies

The CLI installs packages needed for GitHub OAuth:

```bash
pnpm add passport passport-github2 express-session dotenv
```

It auto-detects the package manager (`npm`, `pnpm`, or `yarn`).

---

### 4. 🧱 Generate GitHub OAuth Templates

Feature-specific files are generated from internal templates:

```
/templates/github-oauth/
  └── routes/
      └── auth.js.ejs
```

Copied into your project as:

```
/my-project/routes/auth.js
```

---

### 5. Update `.env` and `package.json`

- Adds **GitHub OAuth environment variables** in `.env`:

```
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
```

- Updates `package.json` scripts if needed:

```json
"scripts": {
  "start": "node app.js",
  "dev": "nodemon app.js"
}
```

---

## 📂 Folder Structure (GitHub OAuth Module)

Each OAuth feature is self-contained:

```
modules/
  └── github-oauth/
      ├── templates/
      │   └── authRoute.ejs
      ├── install.js
      └── ensureAppJsHasOAuthSetup.js
```

- **install.js** → Entry point for feature setup  
- **ensureAppJsHasOAuthSetup.js** → Patches existing `app.js` with GitHub OAuth logic  

---

## 🔄 GitHub OAuth Setup Workflow

| Step | Purpose                               | Tools Used               |
|------|---------------------------------------|--------------------------|
| 1️⃣   | Setup / Validate files                | `fs`, `path`             |
| 2️⃣   | Patch `app.js` with GitHub OAuth      | regex, string checks     |
| 3️⃣   | Install deps (`passport-github2`)     | `child_process.execSync` |
| 4️⃣   | Add GitHub OAuth route templates      | `fs.copyFileSync`        |
| 5️⃣   | Update `.env`, `package.json`         | string, JSON             |

---

## ✅ Requirements

- Node.js v18+  
- A GitHub OAuth App (created in **GitHub Developer Settings**)  
- `package.json` initialized in the project  
- One of: `pnpm`, `npm`, or `yarn` installed globally  

# How Devark Oauth Works (Developer Documentation)



## CLI Command Example

```bash
npx devark add oauth
```

This command adds the **OAuth module** to the current Node.js project.

---

## ⚙️ What Happens Behind the Scenes

The CLI runs **5 main steps** for every feature module:

---

### 1. Validate and Prepare Files

- Checks if essential files exist (`app.js`, `package.json`, `.env`)

**Uses:**

```js
import fs from "fs";
import path from "path";
```

---

### 2. Modify or Patch `app.js`

The CLI ensures:

- Required imports exist
- Middleware is correctly ordered (`express-session` before `passport`)
- Routes are registered
- Duplicate lines are avoided

**Logic Example:**

```js
if (!appJs.includes("const passport = require('passport')")) {
  const updated = `const passport = require('passport');\n` + appJs;
  fs.writeFileSync("app.js", updated);
}
```

---

### 3. Install Dependencies

Automatically installs the packages required by the feature.

**Example:**

```js
execSync("pnpm add passport express-session dotenv", { stdio: "inherit" });
```

It detects and uses `npm`, `pnpm`, based on the project.

---

### 4. 🧱 Generate Templates (Routes, Configs)

Feature-specific files are copied from internal templates:

```
/templates/oauth/
  └── routes/
      └── auth.js.ejs
```

Copied into:

```
/my-project/routes/auth.js
```

---

### 5. Update `.env` and `package.json`

- Appends OAuth-specific variables in `.env` file:

```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

- Updates `package.json` with scripts: (only if needed)

```json
"scripts": {
  "start": "node app.js",
  "dev": "nodemon app.js"
}
```

---

## Folder Structure (Feature Modules)

Each feature is a self-contained module:

```
modules/
  └── oauth/
      ├── templates/
      │   └── authRoute.ejs
      ├── install.js
      └── ensureAppJsHasOAuthSetup.js
```

- `install.js`: Entry point for feature
- `ensureAppJsHasOAuthSetup.js`: Modifies app.js if it already exists

---

## 🔄 CLI Core Workflow

| Step | Purpose                       | Tools Used               |
|------|-------------------------------|--------------------------|
| 1️⃣   | Setup / Validate files        | `fs`, `path`             |
| 2️⃣   | Patch `app.js` code           | regex, string checks     |
| 3️⃣   | Install deps                  | `child_process.execSync` |
| 4️⃣   | Add route/config files        | `fs.copyFileSync`        |
| 5️⃣   | Update `.env`, `package.json` | string, JSON             |

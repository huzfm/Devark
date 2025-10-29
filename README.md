#  Devark — The Backend Scafolding CLI

> **Like shadcn/ui, but for backend development.**  
> Scaffold modern backend features instantly with modular, production-ready templates in JavaScript or TypeScript.

<p align="center">
  <img src="https://img.shields.io/npm/v/devark?color=blue&label=version&logo=npm" alt="npm version"/>
  <img src="https://img.shields.io/github/license/huzfm/Devark?color=brightgreen" alt="license"/>
  <img src="https://img.shields.io/npm/dm/devark?color=orange&label=downloads&logo=npm" alt="downloads"/>
  <img src="https://img.shields.io/github/stars/huzfm/Devark?style=social" alt="GitHub stars"/>
</p>


---

##  Features

**Feature Modules**
- Google OAuth (JS + TS)
- GitHub OAuth (JS + TS)
- Resend Email OTP (JS + TS)

 **Project Templates**
- Node + MongoDB template
- Node + PostgreSQL template

 **Coming Soon**
- React Starter Templates
- AWS S3 Uploads
- Payment Integrations (Stripe)

---

##  Installation

```bash
pnpm install devark
```

> Devark itself uses **pnpm** for dependency management.

---

## 🔗 Global Linking (for Local Development)

```bash
pnpm link --global
```

Now you can use the CLI anywhere:

```bash
devark add google-oauth
```

---

##  Usage Examples (for dev)

### Add Google OAuth
```bash
devark add google-oauth
```

### Add GitHub OAuth
```bash
devark add github-oauth
```

### Add Resend Email OTP
```bash
devark add resend-otp
```

### Create a Node.js + MongoDB Backend
```bash
devark create node-mongo
```

### Create a Node.js + PostgreSQL Backend
```bash
devark create node-postgres
```

---

##  Project Structure

```
├── bin/                  # CLI entry point
│   └── devark.js
├── modules/              # Feature modules
│   ├── google-oauth/
│   ├── github-oauth/
│   ├── resend-otp/
│   └── node-mongodb-template
│   └── node-postgres-template
├── utils/                # Shared helpers
│   ├── createFullAppJs.js
│   ├── injectEnvVars.js
│   └── ensureAppJsHasOAuthSetup.js
├── package.json
└── README.md
```

##  Development

Clone and install dependencies:

```bash
git clone https://github.com/huzfm/Devark.git
cd Devark
pnpm install
```

##  Tech Stack

- **Language:** JavaScript
- **Package Manager:** pnpm
- **CLI Framework:** Commander.js + Inquirer.js
- **Templating:** EJS

---

##  Contributing

Contributions are welcome!  
If you'd like to add new modules or fix bugs:


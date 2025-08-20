# Devark

Devark is a modular backend CLI tool that helps developers quickly
scaffold backend features such as OAuth, Email, OTP, and more.

---

## Features

- 🚀 Add OAuth (Google, GitHub, etc.)
- 📧 Add Email sending (Resend API)
- 📦 Auto install dependencies
- ⚡ Easy `.env` injection

---

## Installation

```bash
pnpm install devark
```

---

## Link the CLI Globally (for local development)

```bash
pnpm link --global

```

## Usage

### Add Google-OAuth

```bash
devark add Google-Oauth
```

### Add Github-OAuth

```bash
devark add Github-Oauth
```

### Add Resend-OTP

```bash
devark add resend-otp
```

---

## Project Structure

    ├── bin/                  # CLI entry
    │   └── devark.ts
    ├── modules/              # Feature modules
    │   ├── oauth/
    │   ├── otp/
    │   └── email/
    ├── templates/            # Common boilerplates
    ├── utils/                # Shared utilities
    └── package.json

---

## Roadmap

- [x] Google OAuth
- [x] GitHub OAuth
- [x] Resend Email
- [x] OTP Module
- [ ] S3 Uploads (Coming Soon)
- [ ] Stripe Payments (Coming Soon)

---

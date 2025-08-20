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
    ├── packages/              # Feature modules
    │   ├── Google-Ooauth/
    │   ├── resend-otp/
    │   └── Github-Oauth/          =
    ├── utils/                # Shared utilities
    └── package.json

---

## Roadmap

- [x] Google OAuth
- [x] GitHub OAuth
- [x] Resend Email OTP
- [ ] S3 Uploads (Coming Soon)
- [ ] Stripe Payments (Coming Soon)

---

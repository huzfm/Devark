# Devark

Devark is a modular backend CLI tool that helps developers quickly
scaffold backend features such as OAuth, Email, OTP, and more.

> **Note**: This project has been converted to TypeScript for better type safety and developer experience.

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

## Development Setup

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Build and Install Locally

```bash
# Install dependencies
pnpm install

# Build the TypeScript project
pnpm run build

# Link globally for development
pnpm link --global
```

### Development Workflow

```bash
# Watch mode for development
pnpm run build:watch

# Run the built CLI
pnpm start

# Clean build artifacts
pnpm run clean
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

```
├── src/                     # TypeScript source code
│   ├── bin/                  # CLI entry point
│   │   └── devark.ts
│   ├── packages/             # Feature modules
│   │   ├── google-oauth/
│   │   ├── github-oauth/
│   │   ├── resend-otp/
│   │   ├── node-mongodb-template/
│   │   └── node-postgress-template/
│   └── utils/                 # Shared utilities
│       ├── filePaths.ts
│       ├── injectEnvVars.ts
│       ├── logo.ts
│       └── packageManager.ts
├── dist/                     # Compiled output
│   └── bin/
│       └── devark.cjs
├── documentation/            # Module documentation
├── tsconfig.json            # TypeScript configuration
└── package.json
```

### Build Process

The project uses **TypeScript** with the following build tools:
- **tsup**: Fast TypeScript bundler
- **ts-node**: TypeScript execution for development
- **CommonJS output**: Compatible with Node.js

**Build Commands:**
- `pnpm run build`: Compile TypeScript to CommonJS
- `pnpm run build:watch`: Watch mode for development
- `pnpm run clean`: Remove build artifacts

---

## Contributing

### Development Setup

1. **Clone and install:**
   ```bash
   git clone <repository-url>
   cd devark
   pnpm install
   ```

2. **Build and test:**
   ```bash
   pnpm run build
   pnpm start -- --version
   ```

3. **Development workflow:**
   ```bash
   # Watch mode for development
   pnpm run build:watch
   
   # Test global installation
   pnpm link --global
   devark --version
   ```

### Adding New Modules

1. Create a new package in `src/packages/your-module/`
2. Add `install.ts` with your module logic
3. Update `src/bin/devark.ts` to include your module
4. Add templates in `src/packages/your-module/templates/`
5. Update documentation

### TypeScript Guidelines

- All source code is in `src/` directory
- Use proper TypeScript types
- Follow the existing module structure
- Update imports to use relative paths without extensions

---

## Roadmap

- [x] Google OAuth
- [x] GitHub OAuth
- [x] Resend Email OTP
- [x] Node-MongoDB project template
- [ ] S3 Uploads (Coming Soon)
- [ ]  Payments (Coming Soon)

---

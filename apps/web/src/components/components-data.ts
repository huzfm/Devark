export type CatalogItem = {
  name: string
  pkg: string
  description?: string
  available: boolean
  version: string
  features: string[]
  dependencies: string[]
  requiredEnv?: string[]
  docsLink?: string
 

}

// === AVAILABLE MODULES ===
export const availableComponents: CatalogItem[] = [
  {
 name: "OAuth",
    pkg: "oauth",
    description: "Authenticate users with Third party providers.",
    available: true,
    version: "1.0.0",
    features: [
      "Google, Github sign-in with Passport.js",
      "Session support with express-session",
      "Secure callback handling"
    ],
    dependencies: [""],
    requiredEnv: [],
    // docsLink: "https://console.cloud.google.com/apis/credentials",
  },
  {
    name: "Google OAuth",
    pkg: "google-oauth",
    description: "Authenticate users with Gooogle in minutes.",
    available: true,
    version: "1.0.0",
    features: [
      "Google sign-in with Passport.js",
      "Session support with express-session",
      "Secure callback handling"
    ],
    dependencies: ["passport", "passport-google-oauth20", "express-session", "dotenv"],
    requiredEnv: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_CALLBACK_URL"],
    docsLink: "https://console.cloud.google.com/apis/credentials",

  },
  {
    name: "GitHub OAuth",
    pkg: "github-oauth",
    description: "Authenticate users with GitHub in minutes.",
    available: true,
    version: "1.0.0",
    features: [
      "GitHub login via Passport.js",
      "Session management",
      "API-ready user profiles"
    ],
    dependencies: ["passport", "passport-github2", "express-session", "dotenv"],
    requiredEnv: ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET", "GITHUB_CALLBACK_URL"],
    docsLink: "https://github.com/settings/developers",
   
  },
  {
    name: "Resend OTP",
    pkg: "resend-otp",
    description: "Send and verify OTP codes over email using Resend.",
    available: true,
    version: "1.0.0",
    features: [
      "Send OTP via Resend API",
      "Verify OTP with in-memory store",
      "Prebuilt routes for send & verify"
    ],
    dependencies: ["resend", "express", "dotenv"],
    requiredEnv: ["RESEND_API_KEY", "FROM_EMAIL"],
    docsLink: "https://resend.com/docs",
 
  },
  {
    name: "Node + MongoDB",
    pkg: "node-mongo",
    description: "Starter template with Node.js, Express, and MongoDB.",
    available: true,
    version: "1.0.0",
    features: [
      "MongoDB connection setup",
      "Express boilerplate with routes/controllers",
      "Production-ready structure"
    ],
    dependencies: ["express", "mongodb", "dotenv"],
    requiredEnv: ["MONGO_URI"],
    docsLink: "https://www.mongodb.com/cloud/atlas/register",

  },
  {
    name: "Node + PostgreSQL",
    pkg: "node-postgres",
    description: "Starter template with Node.js, Express, and PostgreSQL + Prisma.",
    available: true,
    version: "1.0.0",
    features: [
      "PostgreSQL connection via Prisma",
      "Pre-configured Prisma schema",
      "Express setup with middleware"
    ],
    dependencies: ["express", "prisma", "@prisma/client", "dotenv"],
    requiredEnv: ["DATABASE_URL"],
    docsLink: "https://www.prisma.io/docs/getting-started",
  }
]

// === COMING SOON MODULES ===
export const comingSoonComponents: CatalogItem[] = [
  {
    name: "Payments",
    pkg: "@devark/payments-stripe",
    description: "Seamless payments integration with Stripe API.",
    available: false,
    version: "0.1.0-alpha",
    features: [
      "Stripe Checkout",
      "Webhook handlers",
      "Subscription support"
    ],
    dependencies: ["stripe"],
    requiredEnv: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
    docsLink: "https://dashboard.stripe.com/apikeys",

  },
  {
    name: "File Uploads (S3)",
    pkg: "@devark/file-uploads",
    description: "Upload and manage files with AWS S3.",
    available: false,
    version: "0.1.0-alpha",
    features: [
      "AWS S3 integration",
      "Signed URL generation",
      "File validation"
    ],
    dependencies: ["aws-sdk"],
    requiredEnv: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_BUCKET_NAME"],
    docsLink: "https://aws.amazon.com/s3/",

  }
]

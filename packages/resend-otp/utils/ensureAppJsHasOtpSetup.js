import fs from "fs";
import path from "path";

/**
 * Ensures entry file (app.js / app.ts / index.ts) has OTP setup for Resend.
 * ✅ Handles both JavaScript and TypeScript.
 * ✅ Safely merges imports, middleware, and route mounting.
 */
export function ensureAppJsHasOtpSetup(appPath, language = "JavaScript") {
  const isTS = language === "TypeScript";
  const ext = isTS ? ".ts" : ".js";

  if (!fs.existsSync(appPath)) {
    console.warn(`⚠️ File not found: ${appPath}. Aborting update.`);
    return;
  }

  let content = fs.readFileSync(appPath, "utf-8");

  // ✅ Imports needed for OTP setup
  const requiredImports = [
    isTS
      ? "import express, { Application } from 'express'"
      : "import express from 'express'",
    `import otpRoutes from './routes/otpRoutes.js'`,
  ];

  // ✅ Middleware setup
  const requiredMiddleware = [
    "app.use(express.json())",
    "app.use('/', otpRoutes)",
  ];

  // ✅ If empty file, write from scratch
  if (!content.trim()) {
    const scaffold = `
${requiredImports.join(";\n")};

const app${isTS ? ": Application" : ""} = express();

${requiredMiddleware.join(";\n")};

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
`.trim();

    fs.writeFileSync(appPath, scaffold, "utf-8");
    return;
  }

  // ✅ Otherwise, safely merge setup into existing file
  let lines = content.split("\n");

  // Remove duplicate imports
  const trimmedImports = requiredImports.map((imp) => imp.trim());
  lines = lines.filter((line) => !trimmedImports.includes(line.trim()));

  // Prepend imports
  lines = [...requiredImports, "", ...lines];

  // Ensure app initialization exists
  let appIndex = lines.findIndex((line) =>
    /(?:const|let|var)\s+app\s*[:=]/.test(line)
  );

  if (appIndex === -1) {
    lines.push(
      "",
      isTS ? "const app: Application = express();" : "const app = express();"
    );
    appIndex = lines.findIndex((line) =>
      /(?:const|let|var)\s+app\s*[:=]/.test(line)
    );
  }

  // Remove old middleware (to prevent duplicates)
  const mwKeywords = ["app.use(express.json", "app.use('/"];
  lines = lines.filter(
    (line) => !mwKeywords.some((kw) => line.trim().startsWith(kw))
  );

  // Insert middlewares after app = express()
  lines.splice(appIndex + 1, 0, ...requiredMiddleware, "");

  // Add listener if missing
  if (!lines.some((line) => /app\.listen/.test(line))) {
    lines.push(
      "",
      "app.listen(3000, () => {",
      "  console.log('Server running on http://localhost:3000');",
      "});"
    );
  }

  fs.writeFileSync(appPath, lines.join("\n"), "utf-8");
}

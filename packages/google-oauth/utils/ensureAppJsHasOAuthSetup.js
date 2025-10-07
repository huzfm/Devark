import fs from "fs";

/**
 * Ensures app.js / app.ts has full Google OAuth setup.
 * Handles empty files, merges for non-empty files, works for JS or TS.
 */
export function ensureAppJsHasGoogleOAuthSetup(appPath, language = "JavaScript") {
      const isTS = language === "TypeScript";

      // Create the file if it doesn't exist
      if (!fs.existsSync(appPath)) {
            fs.writeFileSync(appPath, "", "utf-8");
            console.log(`ℹ️ Created ${isTS ? "app.ts" : "app.js"} because it did not exist.`);
      }

      const requiredImports = [
            "import 'dotenv/config'",
            isTS ? "import express, { Application } from 'express'" : "import express from 'express'",
            "import session from 'express-session'",
            "import passport from 'passport'",
            "import googleAuthRoutes from './routes/googleAuthRoutes'",
            "import './config/googleStrategy'",
      ];

      const requiredMiddleware = [
            `app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
}))`,
            "app.use(passport.initialize())",
            "app.use(passport.session())",
            "app.use('/', googleAuthRoutes)",
      ];

      let content = fs.readFileSync(appPath, "utf-8");

      // If file is empty, write full scaffold
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
            console.log(`✅ Full scaffold written to ${isTS ? "app.ts" : "app.js"}!`);
            return;
      }

      // Merge imports and middleware for non-empty files
      let lines = content.split("\n");

      // Remove duplicates imports
      lines = lines.filter(line => !requiredImports.includes(line.trim()));

      // Prepend imports
      lines = [...requiredImports, "", ...lines];

      // Ensure `const app = express()` exists
      let appIndex = lines.findIndex(line => /const\s+app\s*=/.test(line));
      if (appIndex === -1) {
            lines.push("", isTS ? "const app: Application = express();" : "const app = express();");
            appIndex = lines.findIndex(line => /const\s+app\s*=/.test(line));
      }

      // Remove old middleware to avoid duplicates
      const mwKeywords = ["app.use(session", "app.use(passport.initialize", "app.use(passport.session", "app.use('/"];
      lines = lines.filter(line => !mwKeywords.some(kw => line.trim().startsWith(kw)));

      // Insert required middleware
      lines.splice(appIndex + 1, 0, ...requiredMiddleware, "");

      // Add listener if missing
      if (!lines.some(line => /app.listen/.test(line))) {
            lines.push(
                  "",
                  "app.listen(3000, () => {",
                  "  console.log('Server running on http://localhost:3000');",
                  "});"
            );
      }

      fs.writeFileSync(appPath, lines.join("\n"), "utf-8");
      console.log(`✅ App entry file updated with Google OAuth setup!`);
}

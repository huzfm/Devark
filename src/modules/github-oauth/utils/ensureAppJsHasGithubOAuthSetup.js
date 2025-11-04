import fs from "fs";
import path from "path";

/**
 * Ensures entry file (app.js / app.ts / index.ts) has full GitHub OAuth setup.
 * ✅ Only modifies existing files — does NOT create new ones.
 * ✅ Works for both JavaScript & TypeScript.
 */
export function ensureAppJsHasGithubOAuthSetup(
  appPath,
  language = "JavaScript"
) {
  const isTS = language === "TypeScript";
  const ext = isTS ? ".ts" : ".js";

  if (!fs.existsSync(appPath)) {
    console.warn(`⚠️ File not found: ${appPath}. Aborting update.`);
    return;
  }

  let content = fs.readFileSync(appPath, "utf-8");

  const requiredImports = [
    "import 'dotenv/config'",
    "import session from 'express-session'",
    "import passport from 'passport'",
    "import githubAuthRoutes from './routes/githubAuthRoutes.js'",
    "import './config/githubStrategy.js'",
  ];

  const requiredMiddleware = [
    `app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
}))`,
    "app.use(passport.initialize())",
    "app.use(passport.session())",
    "app.use('/', githubAuthRoutes)",
  ];

  // ✅ If the file is empty, write a new scaffold
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

  // ✅ Merge into existing file
  let lines = content.split("\n");

  // Remove duplicate imports
  const trimmedImports = requiredImports.map((imp) => imp.trim());
  lines = lines.filter((line) => !trimmedImports.includes(line.trim()));

  // Prepend all required imports
  lines = [...requiredImports, "", ...lines];

  // Ensure app initialization
  let appIndex = lines.findIndex((line) => /const\s+app\s*[:=]/.test(line));
  if (appIndex === -1) {
    lines.push(
      "",
      isTS ? "const app: Application = express();" : "const app = express();"
    );
    appIndex = lines.findIndex((line) => /const\s+app\s*[:=]/.test(line));
  }

  // Remove outdated middleware lines
  const mwKeywords = [
    "app.use(session",
    "app.use(passport.initialize",
    "app.use(passport.session",
    "app.use('/",
  ];
  lines = lines.filter(
    (line) => !mwKeywords.some((kw) => line.trim().startsWith(kw))
  );

  // Insert required middleware right after app initialization
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

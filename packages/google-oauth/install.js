import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { fileURLToPath } from "url";
import { ensureDir, renderTemplate } from "../../utils/filePaths.js";
import { installDepsWithChoice, isValidNodeProject, detectPackageManager } from "../../utils/packageManager.js";
import { injectEnvVars } from "../../utils/injectEnvVars.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function runGoogleOAuthGenerator(targetPath) {
      // 1️⃣ Check for valid Node.js project
      if (!isValidNodeProject(targetPath)) {
            console.error("❌ The folder does not contain a valid Node.js project (missing or invalid package.json). Aborting installation.");
            return;
      }

      // 2️⃣ Detect package manager
      const packageManager = detectPackageManager(targetPath);
      if (packageManager) {
            console.log(`📦 ${packageManager} detected. Dependencies will be installed automatically.`);
      } else {
            console.error("❌ Could not detect package manager (pnpm, npm, or yarn). Please install dependencies manually.");
      }

      // 3️⃣ Ask user for JS/TS version
      const { language } = await inquirer.prompt([
            {
                  type: "list",
                  name: "language",
                  message: "Which version do you want to add?",
                  choices: ["JavaScript", "TypeScript"],
                  default: "JavaScript",
            },
      ]);

      // 4️⃣ Determine default entry file
      const defaultEntry = language === "TypeScript" ? "src/app.ts" : "app.js";

      // 5️⃣ Ask user for entry file
      let { entryFile } = await inquirer.prompt([
            {
                  type: "input",
                  name: "entryFile",
                  message: "Enter your project entry file (relative to project root):",
                  default: defaultEntry,
            },
      ]);

      let appPath = path.join(targetPath, entryFile);

      // 6️⃣ TypeScript: auto-detect entry file in src/ if not found
      if (language === "TypeScript" && !fs.existsSync(appPath)) {
            const srcDir = path.join(targetPath, "src");
            if (fs.existsSync(srcDir)) {
                  const tsFiles = fs.readdirSync(srcDir).filter(f => f.endsWith(".ts"));
                  if (tsFiles.length > 0) {
                        entryFile = path.join("src", tsFiles[0]);
                        appPath = path.join(targetPath, entryFile);
                        console.log(`ℹ️ TypeScript entry file auto-detected: ${entryFile}`);
                  }
            }
      }

      // 7️⃣ Abort if entry file still does not exist
      if (!fs.existsSync(appPath)) {
            console.error(`❌ Entry file "${entryFile}" not found. Aborting installation.`);
            return;
      }

      // 8️⃣ Set directories for controllers/routes
      const baseDir = language === "TypeScript" ? path.join(targetPath, "src") : targetPath;
      const controllersDir = path.join(baseDir, "controllers");
      const routesDir = path.join(baseDir, "routes");
      ensureDir(controllersDir);
      ensureDir(routesDir);

      // 9️⃣ Template rendering
      const templateDir = path.join(__dirname, "templates", language.toLowerCase());
      renderTemplate(
            path.join(templateDir, "config", "googleAuthController.ejs"),
            path.join(controllersDir, `googleAuthController.${language === "TypeScript" ? "ts" : "js"}`)
      );
      renderTemplate(
            path.join(templateDir, "routes", "googleAuthRoutes.ejs"),
            path.join(routesDir, `googleAuthRoutes.${language === "TypeScript" ? "ts" : "js"}`)
      );

      // 🔟 Inject routes into entry file
      let appCode = fs.readFileSync(appPath, "utf-8");
      if (!appCode.includes("googleAuthRoutes")) {
            const importLine = language === "TypeScript"
                  ? `import googleAuthRoutes from "./routes/googleAuthRoutes";`
                  : `import googleAuthRoutes from "./routes/googleAuthRoutes.js";`;
            appCode = `${importLine}\n${appCode}`;
            if (!appCode.includes(`app.use("/", googleAuthRoutes);`)) {
                  appCode += `\napp.use("/", googleAuthRoutes);\n`;
            }
            fs.writeFileSync(appPath, appCode);
      }

      // 1️⃣1️⃣ Install dependencies
      if (packageManager) {
            // Runtime dependencies for both JS and TS
            const runtimeDeps = ["express", "passport", "passport-google-oauth20", "dotenv"];

            // Dev dependencies only for TypeScript
            const devDeps = language === "TypeScript"
                  ? [
                        "typescript",
                        "ts-node",
                        "@types/node",
                        "@types/express",
                        "@types/passport",
                        "@types/passport-google-oauth20",
                        "@types/dotenv"
                  ]
                  : [];

            // Install runtime dependencies
            await installDepsWithChoice(targetPath, runtimeDeps, packageManager, false); // false = runtime

            // Install dev dependencies if any
            if (devDeps.length > 0) {
                  await installDepsWithChoice(targetPath, devDeps, packageManager, true); // true = dev
            }
      } else {
            console.warn("⚠️ Could not detect package manager. Please install dependencies manually.");
      }

      // 1️⃣2️⃣ Inject .env variables
      await injectEnvVars(targetPath, {
            GOOGLE_CLIENT_ID: "your_google_client_id_here",
            GOOGLE_CLIENT_SECRET: "your_google_client_secret_here",
            GOOGLE_CALLBACK_URL: "http://localhost:3000/auth/google/callback",
      });

      console.log("✅ Google OAuth setup complete!");
}

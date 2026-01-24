import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { select, text, intro, outro, spinner, cancel } from "@clack/prompts";
import { ensureDir, renderTemplate } from "../../utils/filePaths.js";
import {
  installDepsWithChoice,
  detectPackageManager,
} from "../../utils/packageManager.js";
import { injectEnvVars } from "../../utils/injectEnvVars.js";
import { ensureAppJsHasGithubOAuthSetup } from "./utils/ensureAppJsHasGithubOAuthSetup.js";
import { log } from "../../utils/moduleUtils.js";
import { ensureNodeProject } from "../../utils/validProject.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function installGithubOAuth(targetPath) {
  intro("GitHub OAuth Module Setup");


  const { success, pkgManager } = await ensureNodeProject(targetPath);
  if (!success) {
    outro("Aborted: Not a valid project.");
    return;
  }

  log.info("Installing GitHub OAuth module...");


  const packageManager = pkgManager || detectPackageManager(targetPath);
  if (packageManager) log.detect(` ${packageManager} detected`);
  else log.detect(" Could not detect package manager.");


  const language = await select({
    message: "Which version do you want to add for this module?",
    options: [
      { label: "JavaScript", value: "JavaScript" },
      { label: "TypeScript", value: "TypeScript" },
    ],
    initialValue: "JavaScript",
  });
  if (language === cancel) {
    outro("Cancelled by user.");
    return;
  }


  const defaultEntry = language === "TypeScript" ? "src/app.ts" : "app.js";
  const entryFile = await text({
    message: "Enter your project entry file (relative to root):",
    placeholder: defaultEntry,
    initialValue: defaultEntry,
  });
  if (entryFile === cancel) {
    outro("Cancelled by user.");
    return;
  }

  let appPath = path.join(targetPath, entryFile);


  if (language === "TypeScript" && !fs.existsSync(appPath)) {
    const srcDir = path.join(targetPath, "src");
    if (fs.existsSync(srcDir)) {
      const tsFiles = fs.readdirSync(srcDir).filter((f) => f.endsWith(".ts"));
      if (tsFiles.length > 0) {
        appPath = path.join(targetPath, "src", tsFiles[0]);
        log.detect(`Auto-detected TypeScript entry file: src/${tsFiles[0]}`);
      }
    }
  }

  if (!fs.existsSync(appPath)) {
    log.error(` Entry file "${entryFile}" not found.`);
    outro("Please create the entry file and run again.");
    return;
  }


  const clientId = await text({
    message: "Enter your GitHub Client ID (leave empty for sample):",
    placeholder: "your-client-id",
  });
  if (clientId === cancel) {
    outro("Cancelled by user.");
    return;
  }

  const clientSecret = await text({
    message: "Enter your GitHub Client Secret (leave empty for sample):",
    placeholder: "your-client-secret",
  });
  if (clientSecret === cancel) {
    outro("Cancelled by user.");
    return;
  }

  const callbackUrl = await text({
    message:
      "Enter your GitHub Callback URL (default: http://localhost:3000/auth/github/callback):",
    placeholder: "http://localhost:3000/auth/github/callback",
  });
  if (callbackUrl === cancel) {
    outro("Cancelled by user.");
    return;
  }

  const sessionSecret = await text({
    message: "Enter your session secret (leave empty for sample):",
    placeholder: "your-session-secret",
  });
  if (sessionSecret === cancel) {
    outro("Cancelled by user.");
    return;
  }


  const runtimeDeps = [
    "express",
    "passport",
    "passport-github2",
    "express-session",
    "dotenv",
  ];

  const devDeps =
    language === "TypeScript"
      ? [
        "typescript",
        "ts-node",
        "@types/node",
        "@types/express",
        "@types/express-session",
        "@types/passport",
        "@types/passport-github2",
      ]
      : [];

  const spin = spinner();
  spin.start("Installing dependencies...");

  try {
    await installDepsWithChoice(targetPath, runtimeDeps, packageManager, false);
    if (devDeps.length > 0)
      await installDepsWithChoice(targetPath, devDeps, packageManager, true);
    spin.stop("Dependencies installed successfully.");
  } catch (err) {
    spin.stop("Failed to install dependencies.");
    log.error(err.message);
    return;
  }


  try {
    ensureAppJsHasGithubOAuthSetup(appPath, language);
  } catch (err) {
    log.error(`Failed to inject GitHub OAuth setup: ${err.message}`);
    outro("Aborting due to errors.");
    return;
  }


  const baseDir =
    language === "TypeScript" ? path.join(targetPath, "src") : targetPath;

  const configDir = path.join(baseDir, "config");
  const routesDir = path.join(baseDir, "routes");

  ensureDir(configDir);
  ensureDir(routesDir);

  const templateDir = path.join(__dirname, "templates", language.toLowerCase());

  renderTemplate(
    path.join(templateDir, "config", "githubStrategy.ejs"),
    path.join(
      configDir,
      `githubStrategy.${language === "TypeScript" ? "ts" : "js"}`
    )
  );

  renderTemplate(
    path.join(templateDir, "routes", "githubAuthRoutes.ejs"),
    path.join(
      routesDir,
      `githubAuthRoutes.${language === "TypeScript" ? "ts" : "js"}`
    )
  );


  const envVars = {
    GITHUB_CLIENT_ID: clientId || "your-client-id",
    GITHUB_CLIENT_SECRET: clientSecret || "your-client-secret",
    GITHUB_CALLBACK_URL:
      callbackUrl || "http://localhost:3000/auth/github/callback",
    SESSION_SECRET: sessionSecret || "your-session-secret",
  };

  injectEnvVars(targetPath, envVars);

  if (clientId || clientSecret || callbackUrl || sessionSecret)
    log.detect(".env updated with credentials you provided");
  else log.detect(".env created with sample values.");

  outro("GitHub OAuth setup complete!");
}

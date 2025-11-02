// utils/moduleUtils.js
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import { ensureDir, renderTemplate } from "./filePaths.js";
import { installDepsWithChoice } from "./packageManager.js";

/* Colored logger */
export const log = {
info: (msg) => console.log(`\x1b[1m\x1b[32m  ${msg}\x1b[0m`),
  success: (msg) => console.log(`\x1b[32m✔ ${msg}\x1b[0m`),
  warn: (msg) => console.log(`\x1b[33m⚠ ${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[1m\x1b[31m❌ ${msg}\x1b[0m`),
  bigSuccess: (msg) => console.log(`\x1b[1m\x1b[92m${msg}\x1b[0m`),
  detect: (msg) => console.log(`\x1b[1m\x1b[34m✔ ${msg}\x1b[0m`),
};

/* 🧩 Language helpers */
export const getExtension = (lang) => (lang === "TypeScript" ? "ts" : "js");
export const getBaseDir = (targetPath, lang) =>
  lang === "TypeScript" ? path.join(targetPath, "src") : targetPath;

/* 🧱 Entry file resolver */
export function ensureEntryFile(targetPath, entryFile, lang) {
  let appPath = path.join(targetPath, entryFile);
  if (fs.existsSync(appPath)) return appPath;

  // Try auto-detect inside src/
  if (lang === "TypeScript") {
    const srcDir = path.join(targetPath, "src");
    if (fs.existsSync(srcDir)) {
      const tsFiles = fs.readdirSync(srcDir).filter((f) => f.endsWith(".ts"));
      if (tsFiles.length > 0) {
        const detected = path.join(srcDir, tsFiles[0]);
        log.info(`Auto-detected entry file: ${detected}`);
        return detected;
      }
    }
  }

  throw new Error(`Entry file "${entryFile}" not found.`);
}

/* 🧰 Template generator */
export function createTemplates(lang, targetPath, templateDir, templates) {
  const baseDir = getBaseDir(targetPath, lang);
  const ext = getExtension(lang);

  for (const t of templates) {
    const src = path.join(templateDir, t.src);
    const dest = path.join(baseDir, t.dest.replace("<ext>", ext));

    ensureDir(path.dirname(dest));
    renderTemplate(src, dest);
  }

  log.success("Templates generated successfully.");
}

/* 🔐 Credential prompt */
export async function promptEnvCredentials(fields) {
  const answers = await inquirer.prompt(fields);
  const vars = Object.fromEntries(
    Object.entries(answers).filter(([_, v]) => v && v.trim())
  );
  return vars;
}

/* ⚙️ Install dependencies (runtime + dev) */
export async function installDeps(
  targetPath,
  packageManager,
  lang,
  runtimeDeps,
  devDeps = []
) {
  await installDepsWithChoice(targetPath, runtimeDeps, packageManager, false);
  if (lang === "TypeScript" && devDeps.length > 0)
    await installDepsWithChoice(targetPath, devDeps, packageManager, true);
  log.success("Dependencies installed successfully.");
}

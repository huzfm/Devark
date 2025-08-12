import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function detectPackageManager(targetPath) {
      if (fs.existsSync(path.join(targetPath, 'pnpm-lock.yaml'))) return 'pnpm';
      if (fs.existsSync(path.join(targetPath, 'yarn.lock'))) return 'yarn';
      if (fs.existsSync(path.join(targetPath, 'package-lock.json'))) return 'npm';
      return null;
}

function injectGitHubOAuth(entryFilePath) {
      let entryContent = fs.readFileSync(entryFilePath, 'utf-8');
      const lines = entryContent.split('\n');

      // Find last import line index
      let lastImportIndex = -1;
      for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import ')) lastImportIndex = i;
      }

      // Insert import dotenv if missing
      const hasDotenvImport = lines.some(line => line.includes("import dotenv"));
      if (!hasDotenvImport) {
            lines.splice(lastImportIndex + 1, 0, "import dotenv from 'dotenv';");
            lastImportIndex++;
      }

      // Insert dotenv.config(); if missing
      const hasDotenvConfig = lines.some(line => line.includes('dotenv.config()'));
      if (!hasDotenvConfig) {
            lines.splice(lastImportIndex + 1, 0, 'dotenv.config();');
      }

      // Insert other imports if missing
      const importLines = [
            `import session from 'express-session';`,
            `import passport from 'passport';`,
            `import './config/githubStrategy.js';`,
            `import authRoutes from './routes/githubAuth.js';`, // Note updated filename 'githubAuth.js'
      ];
      importLines.forEach((imp) => {
            if (!lines.some(line => line.trim() === imp)) {
                  lines.splice(lastImportIndex + 1, 0, imp);
                  lastImportIndex++;
            }
      });

      // Insert middleware block if missing
      const middlewareBlock = `
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', authRoutes);
`.trim();

      if (!entryContent.includes('app.use(session(')) {
            const appInitIndex = lines.findIndex(line => line.includes('const app'));
            if (appInitIndex !== -1) {
                  lines.splice(appInitIndex + 1, 0, middlewareBlock);
            } else {
                  lines.push('\n' + middlewareBlock);
            }
      }

      fs.writeFileSync(entryFilePath, lines.join('\n'), 'utf-8');
      console.log(`✅ Ordered imports & middleware added to ${path.basename(entryFilePath)}`);
}

export default async function installGithubOAuth(targetPath = process.cwd()) {
      targetPath = path.resolve(targetPath);
      console.log("\x1b[32m\x1b[1mThis adds GitHub-OAuth module to your project. Please follow the instructions carefully.\x1b[0m");

      const packageJsonPath = path.join(targetPath, 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
            console.error('❌ No package.json found in the target project. Aborting.');
            return;
      }

      // Prompt entry file
      const { entryFile } = await inquirer.prompt([
            {
                  type: 'input',
                  name: 'entryFile',
                  message: 'Enter your entry file (e.g., app.js, server.js):',
                  default: 'app.js',
            },
      ]);

      const entryFilePath = path.join(targetPath, entryFile);
      if (!fs.existsSync(entryFilePath)) {
            console.error(`❌ Entry file "${entryFile}" not found in target project. Aborting.`);
            return;
      }

      // Prompt GitHub OAuth credentials
      const { clientID, clientSecret } = await inquirer.prompt([
            { type: 'input', name: 'clientID', message: 'Enter GitHub Client ID:' },
            { type: 'input', name: 'clientSecret', message: 'Enter GitHub Client Secret:' },
      ]);

      // Update .env file - append or update keys
      const envPath = path.join(targetPath, '.env');
      let envContent = '';
      if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf-8');
      }

      // Parse .env lines into a map for updating keys
      const envLines = envContent.split('\n').filter(Boolean);
      const envMap = new Map();
      envLines.forEach(line => {
            const [key, ...vals] = line.split('=');
            if (key) envMap.set(key, vals.join('='));
      });

      envMap.set('GITHUB_CLIENT_ID', clientID);
      envMap.set('GITHUB_CLIENT_SECRET', clientSecret);
      if (!envMap.has('SESSION_SECRET')) {
            envMap.set('SESSION_SECRET', 'your_session_secret');
      }

      const newEnvContent = Array.from(envMap.entries())
            .map(([k, v]) => `${k}=${v}`)
            .join('\n');

      fs.writeFileSync(envPath, newEnvContent, 'utf-8');
      console.log('✅ .env updated with GitHub credentials');

      // Copy config/githubStrategy.js
      const configDir = path.join(targetPath, 'config');
      fs.mkdirSync(configDir, { recursive: true });
      fs.copyFileSync(
            path.join(__dirname, 'templates', 'config', 'githubStrategy.ejs'),
            path.join(configDir, 'githubStrategy.js')
      );

      // Copy routes/githubAuth.js
      const routesDir = path.join(targetPath, 'routes');
      fs.mkdirSync(routesDir, { recursive: true });
      fs.copyFileSync(
            path.join(__dirname, 'templates', 'routes', 'githubAuth.ejs'),
            path.join(routesDir, 'githubAuth.js')
      );

      console.log('✅ GitHub strategy & auth routes copied');

      // Inject imports, dotenv config and middleware into entry file
      injectGitHubOAuth(entryFilePath);

      // Install dependencies
      const dependencies = ['express', 'passport', 'passport-github2', 'dotenv', 'express-session'];
      const packageManager = detectPackageManager(targetPath);
      if (!packageManager) {
            console.error('❌ Could not detect package manager. Install manually:', dependencies.join(' '));
            return;
      }

      console.log(`📦 Installing dependencies using ${packageManager}...`);
      const installCmd =
            packageManager === 'npm'
                  ? `npm install ${dependencies.join(' ')}`
                  : packageManager === 'yarn'
                        ? `yarn add ${dependencies.join(' ')}`
                        : `pnpm add ${dependencies.join(' ')}`;

      execSync(installCmd, { cwd: targetPath, stdio: 'inherit' });

      console.log('✅ GitHub OAuth module installed successfully 🚀');
}

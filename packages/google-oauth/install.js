import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import { ensureAppJsHasOAuthSetup } from './utils/ensureAppJsHasOAuthSetup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




export default async function installGoogleOAuth(targetPath = process.cwd()) {
      targetPath = path.resolve(targetPath);
      console.log(
            '\x1b[32m\x1b[1mThis adds Google-OAuth module to your project. Please follow the instructions carefully.\x1b[0m',
      );
      const packageJsonPath = path.join(targetPath, 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
            console.error('❌ No package.json found in the target project. Run `npm init -y` first.');

            return;
      }

      // ask for entry file
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
            console.error(`❌ Entry file "${entryFile}" not found. Aborting.`);

            return;
      }

      // ask for Google OAuth credentials
      const { clientID, clientSecret } = await inquirer.prompt([
            {
                  type: 'input',
                  name: 'clientID',
                  message: 'Enter Google Client ID:',
            },
            {
                  type: 'input',
                  name: 'clientSecret',
                  message: 'Enter Google Client Secret:',
            },
      ]);

      // append to .env
      const envPath = path.join(targetPath, '.env');
      let envContent = '';
      if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf-8');
      }
      if (!envContent.includes('GOOGLE_CLIENT_ID')) {
            envContent += `\nGOOGLE_CLIENT_ID=${clientID}`;
      }
      if (!envContent.includes('GOOGLE_CLIENT_SECRET')) {
            envContent += `\nGOOGLE_CLIENT_SECRET=${clientSecret}`;
      }
      fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf-8');
      console.log('✅ .env updated with Google credentials');

      // scaffold routes & config
      const routesDir = path.join(targetPath, 'routes');
      const configDir = path.join(targetPath, 'config');
      fs.mkdirSync(routesDir, { recursive: true });
      fs.mkdirSync(configDir, { recursive: true });

      const authRoutesTemplatePath = path.join(
            __dirname,
            'templates',
            'googleRoute.ejs',
      );
      const passportConfigTemplatePath = path.join(
            __dirname,
            'templates',
            'googleStrategy.ejs',
      );

      const routesFile = path.join(routesDir, 'googleRoutes.js');
      const configFile = path.join(configDir, 'googleStrategy.js');

      if (!fs.existsSync(routesFile)) {
            const authRoutes = ejs.render(
                  fs.readFileSync(authRoutesTemplatePath, 'utf-8'),
            );
            fs.writeFileSync(routesFile, authRoutes, 'utf-8');
            console.log('✅ googleRoutes.js created');
      } else {
            console.log('⚠️ googleRoutes.js already exists, skipping.');
      }

      if (!fs.existsSync(configFile)) {
            const passportConfig = ejs.render(
                  fs.readFileSync(passportConfigTemplatePath, 'utf-8'),
            );
            fs.writeFileSync(configFile, passportConfig, 'utf-8');
            console.log('✅ googleStrategy.js created');
      } else {
            console.log('⚠️ googleStrategy.js already exists, skipping.');
      }

      // ensure app.js patched
      await ensureAppJsHasOAuthSetup(entryFilePath);

      // install only required deps
      const dependencies = [
            'express',
            'passport',
            'passport-google-oauth20',
            'dotenv',
            'express-session',
      ];
      const packageManager = detectPackageManager(targetPath);

      if (!packageManager) {
            console.error('❌ Could not detect package manager (pnpm, npm, or yarn). Please install dependencies manually.');

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

      // add start script if missing
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      pkg.scripts = pkg.scripts || {};
      if (!pkg.scripts.start) {
            pkg.scripts.start = `node ${entryFile}`;
      }
      fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2), 'utf-8');
      console.log('✅ Added/verified "start" script in package.json');

      console.log(
            '\x1b[32m✅ Google OAuth module installed successfully 🚀\x1b[0m',
      );
}

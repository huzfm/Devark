import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import inquirer from 'inquirer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------- Package Manager Detector --------------------
function detectPackageManager(targetPath) {
      const lockFiles = {
            pnpm: 'pnpm-lock.yaml',
            yarn: 'yarn.lock',
            npm: 'package-lock.json',
      };

      for (const [manager, fileName] of Object.entries(lockFiles)) {
            const filePath = path.join(targetPath, fileName);
            if (fs.existsSync(filePath)) {
                  return manager;
            }
      }

      return null;
}
// -------------------- Dependency Installer --------------------
function installDependencies(targetPath, dependencies) {
      const packageManager = detectPackageManager(targetPath);

      if (!packageManager) {
            console.error(
                  '❌ Could not detect package manager. Please install manually:',
            );
            console.log(`   npm install ${dependencies.join(' ')}`);

            return;
      }

      const commands = {
            npm: `npm install ${dependencies.join(' ')}`,
            yarn: `yarn add ${dependencies.join(' ')}`,
            pnpm: `pnpm add ${dependencies.join(' ')}`,
      };

      console.log(`📦 Installing dependencies using ${packageManager}...`);
      execSync(commands[packageManager], { cwd: targetPath, stdio: 'inherit' });
}

// -------------------- OTP Module Installer --------------------
export default async function install(targetPath) {
      console.log(
            '\x1b[32m\x1b[1mThis adds Resend-OTP module to your project. Please follow the instructions carefully.\x1b[0m',
      );

      // Prompt for env vars
      const answers = await inquirer.prompt([
            {
                  type: 'input',
                  name: 'RESEND_API_KEY',
                  message: 'Enter your Resend API Key:',
            },
            {
                  type: 'input',
                  name: 'FROM_EMAIL',
                  message: 'Enter the FROM email address:',
            },
      ]);

      // Ensure controllers and routes folders exist
      const controllersDir = path.join(targetPath, 'controllers');
      const routesDir = path.join(targetPath, 'routes');
      if (!fs.existsSync(controllersDir)) { fs.mkdirSync(controllersDir); }
      if (!fs.existsSync(routesDir)) { fs.mkdirSync(routesDir); }

      // Generate OTP controllers
      const otpControllerTemplate = fs.readFileSync(
            path.join(__dirname, 'templates', 'otp.ejs'),
            'utf-8',
      );
      const otpFunctionsTemplate = fs.readFileSync(
            path.join(__dirname, 'templates', 'otpFunctions.ejs'),
            'utf-8',
      );

      fs.writeFileSync(
            path.join(controllersDir, 'otp.js'),
            ejs.render(otpControllerTemplate, {}),
      );
      fs.writeFileSync(
            path.join(controllersDir, 'otpFunctions.js'),
            ejs.render(otpFunctionsTemplate, {}),
      );

      // Generate OTP routes
      const otpRoutesTemplate = fs.readFileSync(
            path.join(__dirname, 'templates', 'otpRoutes.ejs'),
            'utf-8',
      );
      fs.writeFileSync(
            path.join(routesDir, 'otpRoutes.js'),
            ejs.render(otpRoutesTemplate, {}),
      );

      // Update app.js
      const appJsPath = path.join(targetPath, 'app.js');
      if (fs.existsSync(appJsPath)) {
            let appJsContent = fs.readFileSync(appJsPath, 'utf-8');

            if (!appJsContent.includes('express.json()')) {
                  appJsContent = appJsContent.replace(
                        /const app = express\(\);/,
                        'const app = express();\napp.use(express.json());',
                  );
            }

            if (!appJsContent.includes('otpRoutes')) {
                  appJsContent = appJsContent.replace(
                        /app\.use\(.*\);/,
                        (match) => `${match}\napp.use("/", otpRoutes);`,
                  );
                  if (!appJsContent.includes('import otpRoutes')) {
                        appJsContent =
                              'import otpRoutes from "./routes/otpRoutes.js";\n' +
                              appJsContent;
                  }
            }

            fs.writeFileSync(appJsPath, appJsContent);
      } else {
            console.error('❌ app.js not found in target project.');
      }

      // Update .env file
      const envPath = path.join(targetPath, '.env');
      let envContent = fs.existsSync(envPath)
            ? fs.readFileSync(envPath, 'utf-8')
            : '';
      if (!envContent.includes('RESEND_API_KEY')) {
            envContent += `\nRESEND_API_KEY=${answers.RESEND_API_KEY}\n`;
      }
      if (!envContent.includes('FROM_EMAIL')) {
            envContent += `FROM_EMAIL=${answers.FROM_EMAIL}\n`;
      }
      fs.writeFileSync(envPath, envContent);

      // Install only required dependencies
      installDependencies(targetPath, ['express', 'resend', 'dotenv']);

      console.log('✅ OTP module setup complete!');
}

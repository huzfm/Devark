import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import { ensureAppJsHasOAuthSetup } from './utils/ensureAppJsHasOAuthSetup.js';
import { addAbortSignal } from 'stream';

// Get __dirname from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
function installDependencies(targetPath, dependencies) {
  const packageManager = detectPackageManager(targetPath);

  if (!packageManager) {
    console.error(
      '❌ Could not detect package manager (pnpm, npm, or yarn). Please install dependencies manually:',
    );
    console.log(`npm install ${dependencies.join(' ')}`);

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

export default async function install(targetPath = process.cwd()) {
  targetPath = path.resolve(targetPath);
  console.log(
    '\x1b[32m\x1b[1mThis adds GitHub-OAuth module to your project. Please follow the instructions carefully.\x1b[0m',
  );

  const packageJsonPath = path.join(targetPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ No package.json found in the target project. Aborting.');

    return;
  }

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
    console.error(
      `❌ Entry file "${entryFile}" not found in target project. Aborting.`,
    );

    return;
  }

  const { clientID, clientSecret } = await inquirer.prompt([
    {
      type: 'input',
      name: 'clientID',
      message: 'Enter GitHub Client ID:',
    },
    {
      type: 'input',
      name: 'clientSecret',
      message: 'Enter GitHub Client Secret:',
    },
  ]);

  // Create or update .env without overwriting if left blank
  const envPath = path.join(targetPath, '.env');
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  }
  const envMap = new Map(
    envContent
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [k, ...v] = line.split('=');

        return [k, v.join('=')];
      }),
  );

  if (clientID) {
    envMap.set('GITHUB_CLIENT_ID', clientID);
  }
  if (clientSecret) {
    envMap.set('GITHUB_CLIENT_SECRET', clientSecret);
  }
  if (!envMap.has('SESSION_SECRET')) {
    envMap.set('SESSION_SECRET', 'your_session_secret');
  }

  fs.writeFileSync(
    envPath,
    Array.from(envMap.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('\n'),
    'utf-8',
  );
  console.log('✅ .env updated ');

  // Copy templates
  const authRoutesTemplatePath = path.join(
    __dirname,
    'templates',
    'routes',
    'githubRoutes.ejs',
  );
  const passportConfigTemplatePath = path.join(
    __dirname,
    'templates',
    'config',
    'githubStrategy.ejs',
  );

  const routesDir = path.join(targetPath, 'routes');
  const configDir = path.join(targetPath, 'config');
  fs.mkdirSync(routesDir, { recursive: true });
  fs.mkdirSync(configDir, { recursive: true });

  const authRoutes = ejs.render(
    fs.readFileSync(authRoutesTemplatePath, 'utf-8'),
  );
  const passportConfig = ejs.render(
    fs.readFileSync(passportConfigTemplatePath, 'utf-8'),
  );

  fs.writeFileSync(
    path.join(routesDir, 'githubRoutes.js'),
    authRoutes,
    'utf-8',
  );
  fs.writeFileSync(
    path.join(configDir, 'githubStrategy.js'),
    passportConfig,
    'utf-8',
  );
  console.log('✅ OAuth route and passport config created');

  await ensureAppJsHasOAuthSetup(entryFilePath);

  const dependencies = [
    'express',
    'passport',
    'passport-github2',
    'dotenv',
    'express-session',
  ];
  installDependencies(targetPath, dependencies);

  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.start = pkg.scripts.start || `node ${entryFile}`;
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2), 'utf-8');
  console.log('✅ Added "start" script to package.json');

  console.log('✅ GitHub OAuth module installed successfully 🚀');
}

// import path from 'path'
// import fs from 'fs'
// import { fileURLToPath } from 'url'
// import { execSync } from 'child_process'
// import inquirer from 'inquirer'

// const __filename = fileURLToPath(import.meta.url)
// const __diranme = path.dirname(__filename)

// function detectPackageManager(targetPath) {
//       const lockFiles = {
//             pnpm: "pnpm-lock.yaml",
//             yarn: "yarn.lock",
//             npm: "package-lock.json"
//       }

//       for (const [manager, fileName] of Object.entries(lockFiles)) {
//             const filePath = path.join(targetPath, fileName)
//       }
//       if (fs.existsSync(filePath)) {
//             return manager

//       }

//       return null
// }

// function installDependencies(targetPath, dependencies) {
//       const packageManager = detectPackageManager(targetPath)
//       if (!packageManager) {
//             console.log('no pkg manager detected')
//             return
//       }

//       const commands = {
//             npm: `npm i ${dependencies.join(' ')}`,
//             pnpm: `pnpm i ${dependencies.join(' ')}`,
//             yarn: `yarn add ${dependencies.join(' ')}`
//       }
//       console.log(`installl using ${packageManager}`)
//       execSync(
//             commands[packageManager],
//             {
//                   cwd: targetPath,
//                   stdio: 'inherit'
//             }
//       )
// }

// export default async function install(targetPath = process.cwd()) {
//       targetPath = path.resolve(targetPath)
//       console.log('stsring messadge')

//       const packageJsonPath = path.join(targetPath, 'package.json')
//       if (!fs.existsSync(packageJsonPath)) {
//             console.log("no file found")
//             return
//       }

//       const { entryFile } = await inquirer.prompt([
//             {
//                   type: 'input',
//                   name: 'entryFile',
//                   message: "entry you entry file",
//                   default: 'app.js'
//             }
//       ])

//       const entryFilePath = path.join(targetPath, entryFile)
//       if (!fs.existsSync(entryFile)) {
//             console.log("no file foound")
//             return
//       }

//       const { clientID, clientSecret } = await inquirer.prompt([
//             { type: 'input', name: 'clientID', message: 'Enter GitHub Client ID:' },
//             { type: 'input', name: 'clientSecret', message: 'Enter GitHub Client Secret:' },
//       ])

//       // Create or update .env without overwriting if left blank
//       const envPath = path.join(targetPath, '.env')
//       let envContent = ''
//       if (fs.existsSync(envPath)) {
//             envContent = fs.readFileSync(envPath, 'utf-8')
//       }
//       const envMap = new Map(envContent.split('\n').filter(Boolean).map(line => {
//             const [k, ...v] = line.split('=')
//             return [k, v.join('=')]
//       }))

//       if (clientID) envMap.set('GITHUB_CLIENT_ID', clientID)
//       if (clientSecret) envMap.set('GITHUB_CLIENT_SECRET', clientSecret)
//       if (!envMap.has('SESSION_SECRET')) envMap.set('SESSION_SECRET', 'your_session_secret')

//       fs.writeFileSync(envPath, Array.from(envMap.entries()).map(([k, v]) => `${k}=${v}`).join('\n'), 'utf-8')
//       console.log('env updated')

//       const authRoutesTemplatePath = path.join(__dirname, 'templates', 'routes', 'githubRoutes.ejs')
//       const passportConfigTemplatePath = path.join(__dirname, 'templates', 'config', 'githubStrategy.ejs')

// }

#!/usr/bin/env node

import { Command } from 'commander';
import { dirname } from 'path';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import addOAuth from '../packages/google-oauth/install';
import addOtp from '../packages/resend-otp/install';
import addGithubOAuth from '../packages/github-oauth/install';
import nodemongo from '../packages/node-mongodb-template/install';
import nodepostgres from '../packages/node-postgress-template/install';
import { showDevarkLogo } from '../utils/logo';


// Use require.resolve for CommonJS compatibility
const __filename = process.argv[1];
const __dirname = dirname(__filename);

// Try multiple possible locations for package.json
let packageJsonPath;
const possiblePaths = [
  path.join(__dirname, '../../package.json'),
  path.join(__dirname, '../package.json'),
  path.join(process.cwd(), 'package.json')
];

for (const possiblePath of possiblePaths) {
  if (existsSync(possiblePath)) {
  packageJsonPath = possiblePath;
  break;
  }
}

if (!packageJsonPath) {
  console.error('❌ Could not find package.json');
  process.exit(1);
}

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

const program = new Command();

// Handle Ctrl+C gracefully (SIGINT)
process.on('SIGINT', () => {
  console.log('❌ Installation aborted.');
  process.exit(0);
});

async function main() {
  const args = process.argv.slice(2);

  // Show logo only if it's NOT the custom help command
  if (!(args.length && args[0] === 'help') && !(args.length && args[0] === '--version')) {
    await showDevarkLogo();
  }

  program
    .name('devark')
    .description('Devark CLI - Modular backend scaffolder')
    .version(packageJson.version);

  // `add` command
  program
    .command('add <template>')
    .description('Add a backend module to your project')
    .action(async (template) => {
      const input = template.toLowerCase().trim();

      try {
        switch (input) {
      case 'google-oauth':
        await addOAuth(process.cwd());
        break;
      case 'resend-otp':
        await addOtp(process.cwd());
        break;
      case 'github-oauth':
        await addGithubOAuth(process.cwd());
        break;
      case 'node-mongo':
        await nodemongo(process.cwd());
        break;
      case 'node-postgres':
        await nodepostgres(process.cwd());
        break;
      default:
        throw new Error(`Template "${template}" is not supported`);
        }
      } catch (err) {
        if (err instanceof Error && (err as any).isTtyError || (err instanceof Error && err.message.includes('force closed'))) {
      console.log('\n Installation aborted.');
        } else {
      console.error(' Error:', err instanceof Error ? err.message : String(err));
        }
        process.exit(1);
      }
    });

  // Custom `help` command
  program
    .command('help')
    .description('Show all available Devark commands and modules')
    .action(() => {
      console.log(`
        📌 Devark CLI - Available Commands

          npx devark add <module>    Add a backend module into your project

        ✅ Supported Modules:
          - google-oauth    → Google authentication
          - github-oauth    → GitHub authentication
          - resend-otp      → OTP via Resend email

        💡 Examples:
        npx devark add google-oauth
        npx devark add github-oauth
        npx devark add resend-otp
        `);
    });

  // Default help if no args
  if (!args.length) {
    program.outputHelp();
  }

  program.parse(process.argv);
}

main();

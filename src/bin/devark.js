#!/usr/bin/env node

import { Command } from 'commander';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'fs';
import path from 'path';

// modules
import googleAuth from '../modules/google-oauth/install.js';
import addGithubOAuth from '../modules/github-oauth/install.js';
import addOtp from '../modules/resend-otp/install.js';
import nodemongo from '../modules/node-mongodb-template/install.js';
import nodepostgres from '../modules/node-postgress-template/install.js';

// utils
import { showDevarkLogo } from '../utils/logo.js';
import { oauthSelector } from '../utils/oauthSelector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(path.join(__dirname, '../../package.json'), 'utf-8')
);

const program = new Command();

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('❌ Installation aborted.');
  process.exit(0);
});

async function main() {
  const args = process.argv.slice(2);

  // Show logo unless version
  if (!(args.length && args[0] === '--version')) {
    await showDevarkLogo();
  }

  program
    .name('devark')
    .description('Devark CLI - Modular backend scaffolder')
    .version(packageJson.version);

  // add command
  program
    .command('add <module>')
    .description('Add a backend module to your project')
    .action(async (module) => {
      let input = module.toLowerCase().trim();

      try {
        // 👉 OAuth group command
        if (input === 'oauth') {
          input = await oauthSelector(); // returns real module name
        }

        switch (input) {
          case 'google-oauth':
            await googleAuth(process.cwd());
            break;

          case 'github-oauth':
            await addGithubOAuth(process.cwd());
            break;

          case 'resend-otp':
            await addOtp(process.cwd());
            break;

          case 'node-mongo':
            await nodemongo(process.cwd());
            break;

          case 'node-postgres':
            await nodepostgres(process.cwd());
            break;

          default:
            throw new Error(`Module "${module}" is not supported`);
        }
      } catch (err) {
        if (err.isTtyError || err.message?.includes('force closed')) {
          console.log('\n❌ Installation aborted.');
        } else {
          console.error('❌ Error:', err.message);
        }
        process.exit(1);
      }
    });

  // Default help
  if (!args.length) {
    program.outputHelp();
  }

  program.parse(process.argv);
}

main();

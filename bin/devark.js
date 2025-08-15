#!/usr/bin/env node
import { Command } from 'commander';
<<<<<<< Updated upstream
import addOAuth from '../packages/oauth/install.js';
import addOtp from '../packages/otp/install.js';
// import more feature modules as needed
=======
import addOAuth from '../packages/google-oauth/install.js';
import addOtp from '../packages/resend-otp/install.js';
import addGithubOAuth from '../packages/github-oauth/install.js';
import { showDevarkLogo } from '../utils/logo.js';

>>>>>>> Stashed changes

const program = new Command();

async function main() {
      // Always show logo first
      await showDevarkLogo();

      program
            .name('devark')
            .description('Devark CLI - Modular backend scaffolder')
            .version('1.0.0');

<<<<<<< Updated upstream
            switch (input) {
                  case 'oauth':
                        await addOAuth();
                        break;
                  case 'otp':
                        await addOtp();
                        break;
                  // case 'resend':
                  //   await addResend();
                  //   break;
                  default:
                        console.log(`❌ Template "${template}" not supported yet.`);
                        break;
            }
      });
=======
      program
            .command('add <template>')
            .description('Add a backend module to your project')
            .action(async (template) => {
                  const input = template.toLowerCase().trim();
>>>>>>> Stashed changes

                  switch (input) {
                        case "google-oauth":
                              await addOAuth(process.cwd());
                              break;
                        case "resend-otp":
                              await addOtp(process.cwd());
                              break;
                        case "github-oauth":
                              await addGithubOAuth(process.cwd());
                              break;
                        default:
                              console.log(`❌ Template "${template}" not supported yet.`);
                              break;
                  }
            });

      // Show help if no command is passed
      if (!process.argv.slice(2).length) {
            program.outputHelp();
      }

      program.parse(process.argv);
}

main();

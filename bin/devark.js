#!/usr/bin/env node

import { Command } from 'commander';
import addOAuth from '../packages/google-oauth/install.js';
import addOtp from '../packages/resend-otp/install.js';
import addGithubOAuth from '../packages/github-oauth/install.js';
import { showDevarkLogo } from '../utils/logo.js';

const program = new Command();

// Handle Ctrl+C gracefully (SIGINT)
process.on('SIGINT', () => {
      console.log('❌ Installation aborted.');
      process.exit(0);
});

async function main() {
      // Always show logo first
      await showDevarkLogo();

      program
            .name('devark')
            .description('Devark CLI - Modular backend scaffolder')
            .version('1.5.0');

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
                              default:
                                    console.log(`❌ Template "${template}" not supported yet.`);
                        }
                  } catch (err) {
                        if (err.isTtyError || err.message.includes('force closed')) {
                              console.log('\n❌ Installation aborted.');
                        } else {
                              console.error('❌ Error:', err.message);
                        }
                        process.exit(1);
                  }
            });

      // Show help if no command is passed
      if (!process.argv.slice(2).length) {
            program.outputHelp();
      }

      program.parse(process.argv);
}

main();

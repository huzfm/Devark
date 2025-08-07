#!/usr/bin/env node

import { Command } from 'commander';
import install from '../packages/oauth/install.js';
import addOtp from '../packages/otp/install.js';
// import more feature modules as needed

const program = new Command();

program
      .name('devark')
      .description('Devark CLI - Modular backend scaffolder')
      .version('1.0.0');

program
      .command('add <template>')
      .description('Add a backend module to your project')
      .action(async (template) => {
            const input = template.toLowerCase().trim();

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

// Show help if no command is passed
if (!process.argv.slice(2).length) {
      program.outputHelp();
}

program.parse(process.argv);

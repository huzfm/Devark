#!/usr/bin/env node

import { Command } from 'commander'
import { add } from '../cli/commands/add.js'


const program = new Command()

program
      .command('add <template>')
      .description('Add a backend module')
      .action(async (template) => {
            if (template === 'oauth') {
                  await add()
            } else {
                  console.log(`❌ Template "${template}" not supported yet.`)
            }
      })

program.parse(process.argv)

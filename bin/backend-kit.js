#!/usr/bin/env node

import { Command } from 'commander'
import init from '../cli/commands/init.js'
import add from '../cli/commands/add.js'

const program = new Command()

program
      .command('init')
      .description('Initialize an Express backend')
      .action(init)

program
      .command('add <feature>')
      .description('Add a feature like oauth')
      .action(add)

program.parse()

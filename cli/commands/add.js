import inquirer from 'inquirer'
import fs from 'fs'
import path from 'path'
import { install } from '../../packages/oauth/install.js'

export async function add() {
      const examplesPath = path.join(process.cwd(), 'examples')

      if (!fs.existsSync(examplesPath)) {
            console.error('❌ No examples/ folder found.')
            return
      }

      const projectFolders = fs
            .readdirSync(examplesPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)

      if (projectFolders.length === 0) {
            console.error('❌ No projects found inside examples/.')
            return
      }

      // 🔽 Prompt user to choose project
      const { selectedProject } = await inquirer.prompt([
            {
                  type: 'list',
                  name: 'selectedProject',
                  message: 'Select the project to install OAuth:',
                  choices: projectFolders,
            },
      ])

      const targetPath = path.join(examplesPath, selectedProject)

      // 🔽 Call the OAuth installer
      await install(targetPath)
}

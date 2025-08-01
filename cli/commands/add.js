import inquirer from 'inquirer'
import fs from 'fs'
import path from 'path'
import { install } from '../../packages/oauth/install.js'
import { resolveEntryFile } from '../../packages/oauth/utils/resolveEntryFile.js'

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

      const { selectedProject } = await inquirer.prompt([
            {
                  type: 'list',
                  name: 'selectedProject',
                  message: 'Select the project to install OAuth:',
                  choices: projectFolders,
            },
      ])

      const targetPath = path.join(examplesPath, selectedProject)
      const pkgPath = path.join(targetPath, 'package.json')

      if (!fs.existsSync(pkgPath)) {
            console.error(`❌ No package.json found in ${selectedProject}. Please initialize the project first.`)
            return
      }

      // ✅ Use the reusable resolver
      const entryFile = await resolveEntryFile(targetPath)

      // 🚀 Run the installer
      await install(targetPath, entryFile)
}

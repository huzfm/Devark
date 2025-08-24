import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';

export async function resolveEntryFile(targetPath) {
  let entryFile = 'app.js'; // default suggestion

  while (true) {
    const { userInput } = await inquirer.prompt([
      {
        type: 'input',
        name: 'userInput',
        message: 'Enter your entry file (e.g., app.js, server.js):',
        default: entryFile,
      },
    ]);

    const fullPath = path.join(targetPath, userInput);

    if (fs.existsSync(fullPath)) {
      return userInput; // valid, return to caller
    }

    console.error(
      `❌ Entry file "${userInput}" not found in ${targetPath}. Try again.`,
    );
    entryFile = userInput;
  }
}

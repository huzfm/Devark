import fs from 'fs';
import path from 'path';
import ejs from 'ejs';

export function ensureDir(dirPath) {
      fs.mkdirSync(dirPath, { recursive: true });
}

export function renderTemplate(srcPath, destPath, data = {}) {
      const template = fs.readFileSync(srcPath, 'utf-8');
      const content = ejs.render(template, data);
      const destDir = path.dirname(destPath);
      if (destDir && !fs.existsSync(destDir)) {
            // create destination directory directly to avoid any cross-platform
            // edge cases when using path separators
            fs.mkdirSync(destDir, { recursive: true });
      }
      fs.writeFileSync(destPath, content, 'utf-8');
}

export function appendIfMissing(filePath, search, appendContent) {
      let content = fs.readFileSync(filePath, 'utf-8');
      if (!content.includes(search)) {
            fs.writeFileSync(filePath, content + '\n' + appendContent, 'utf-8');
      }
}

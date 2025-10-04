import fs from 'fs';
import path from 'path';
import ejs from 'ejs';

export function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function renderTemplate(srcPath: string, destPath: string, data: Record<string, any> = {}) {
  const template = fs.readFileSync(srcPath, 'utf-8');
  const content = ejs.render(template, data);
  const destDir = path.dirname(destPath);
  if (destDir && !fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.writeFileSync(destPath, content, 'utf-8');
}

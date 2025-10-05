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

export function getTemplatesDir(packageName: string): string {
  // Get the directory of the current file (this utility file)
  const currentFileDir = path.dirname(new URL(import.meta.url).pathname);
  
  // Navigate to the project root from the utils directory
  const projectRoot = path.resolve(currentFileDir, '../../');
  
  // Try to find templates in dist first (production build)
  const distTemplatesPath = path.join(projectRoot, 'dist', 'packages', packageName, 'templates');
  if (fs.existsSync(distTemplatesPath)) {
    return distTemplatesPath;
  }
  
  // Fallback to source templates (development)
  const srcTemplatesPath = path.join(projectRoot, 'src', 'packages', packageName, 'templates');
  if (fs.existsSync(srcTemplatesPath)) {
    return srcTemplatesPath;
  }
  
  throw new Error(`Templates directory not found for package: ${packageName}`);
}

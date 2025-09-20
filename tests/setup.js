import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global test setup
global.testUtils = {
  createTempDir: () => {
    const tempDir = path.join(__dirname, 'temp', Date.now().toString());
    fs.mkdirSync(tempDir, { recursive: true });
    return tempDir;
  },
  
  cleanupTempDir: (dir) => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  },
  
  createPackageJson: (dir, content = {}) => {
    const defaultContent = {
      name: 'test-project',
      version: '1.0.0',
      type: 'module'
    };
    const packageContent = { ...defaultContent, ...content };
    fs.writeFileSync(
      path.join(dir, 'package.json'),
      JSON.stringify(packageContent, null, 2)
    );
  }
};

// Cleanup any existing temp directories before tests
const tempBasePath = path.join(__dirname, 'temp');
if (fs.existsSync(tempBasePath)) {
  fs.rmSync(tempBasePath, { recursive: true, force: true });
}
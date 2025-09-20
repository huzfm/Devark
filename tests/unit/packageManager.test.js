import fs from 'fs';
import path from 'path';
import { jest } from '@jest/globals';
import { 
  detectPackageManager, 
  isValidNodeProject,
  installDependencies 
} from '../../utils/packageManager.js';

describe('Package Manager Utils', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = global.testUtils.createTempDir();
  });

  afterEach(() => {
    global.testUtils.cleanupTempDir(tempDir);
  });

  describe('detectPackageManager', () => {
    test('should detect pnpm when pnpm-lock.yaml exists', () => {
      fs.writeFileSync(path.join(tempDir, 'pnpm-lock.yaml'), '');
      expect(detectPackageManager(tempDir)).toBe('pnpm');
    });

    test('should detect yarn when yarn.lock exists', () => {
      fs.writeFileSync(path.join(tempDir, 'yarn.lock'), '');
      expect(detectPackageManager(tempDir)).toBe('yarn');
    });

    test('should detect npm when package-lock.json exists', () => {
      fs.writeFileSync(path.join(tempDir, 'package-lock.json'), '');
      expect(detectPackageManager(tempDir)).toBe('npm');
    });

    test('should prioritize pnpm over yarn and npm', () => {
      fs.writeFileSync(path.join(tempDir, 'pnpm-lock.yaml'), '');
      fs.writeFileSync(path.join(tempDir, 'yarn.lock'), '');
      fs.writeFileSync(path.join(tempDir, 'package-lock.json'), '');
      expect(detectPackageManager(tempDir)).toBe('pnpm');
    });

    test('should return null when no lock files exist', () => {
      expect(detectPackageManager(tempDir)).toBeNull();
    });
  });

  describe('isValidNodeProject', () => {
    test('should return true for valid package.json', () => {
      global.testUtils.createPackageJson(tempDir);
      expect(isValidNodeProject(tempDir)).toBe(true);
    });

    test('should return false when package.json does not exist', () => {
      expect(isValidNodeProject(tempDir)).toBe(false);
    });

    test('should return false for invalid JSON in package.json', () => {
      fs.writeFileSync(path.join(tempDir, 'package.json'), 'invalid json');
      expect(isValidNodeProject(tempDir)).toBe(false);
    });

    test('should return false for non-object package.json', () => {
      fs.writeFileSync(path.join(tempDir, 'package.json'), '"string"');
      expect(isValidNodeProject(tempDir)).toBe(false);
    });
  });

  describe('installDependencies', () => {
    test('should log error when no package manager detected', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      
      installDependencies(tempDir, ['express']);
      
      expect(consoleSpy).toHaveBeenCalledWith('❌ Could not detect package manager. Install manually:');
      expect(logSpy).toHaveBeenCalledWith('   npm install express');
      
      consoleSpy.mockRestore();
      logSpy.mockRestore();
    });
  });
});
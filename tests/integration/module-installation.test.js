import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock inquirer to provide automated responses
jest.mock('inquirer', () => ({
  prompt: jest.fn()
}));

// Mock execSync to prevent actual package installations
jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

import inquirer from 'inquirer';
import { execSync } from 'child_process';
import installGoogleOAuth from '../../packages/google-oauth/install.js';
import installGithubOAuth from '../../packages/github-oauth/install.js';

describe('Module Installation Integration', () => {
  let tempDir;
  let originalCwd;

  beforeEach(() => {
    tempDir = global.testUtils.createTempDir();
    originalCwd = process.cwd();
    
    // Copy sample project to temp directory
    const sampleProjectPath = path.join(__dirname, '../fixtures/sample-project');
    fs.cpSync(sampleProjectPath, tempDir, { recursive: true });
    
    // Create lock file to simulate npm package manager
    fs.writeFileSync(path.join(tempDir, 'package-lock.json'), '{}');
    
    // Clear mocks
    jest.clearAllMocks();
    
    // Mock execSync to prevent actual package installations
    execSync.mockImplementation(() => {});
  });

  afterEach(() => {
    global.testUtils.cleanupTempDir(tempDir);
    process.chdir(originalCwd);
  });

  describe('Google OAuth Installation', () => {
    test('should install Google OAuth module successfully', async () => {
      // Mock user inputs
      inquirer.prompt
        .mockResolvedValueOnce({ entryFile: 'app.js' })
        .mockResolvedValueOnce({
          CLIENT_ID: 'test-client-id',
          CLIENT_SECRET: 'test-client-secret',
          CALLBACK_URL: 'http://localhost:3000/auth/google/callback'
        });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await installGoogleOAuth(tempDir);

      // Verify files were created
      expect(fs.existsSync(path.join(tempDir, 'config'))).toBe(true);
      expect(fs.existsSync(path.join(tempDir, 'config/googleStrategy.js'))).toBe(true);
      expect(fs.existsSync(path.join(tempDir, 'routes/googleRoutes.js'))).toBe(true);

      // Verify .env was updated
      const envContent = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
      expect(envContent).toContain('GOOGLE_CLIENT_ID=test-client-id');
      expect(envContent).toContain('GOOGLE_CLIENT_SECRET=test-client-secret');

      // Verify dependencies were "installed"
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('passport passport-google-oauth20'),
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });

    test('should fail gracefully when entry file does not exist', async () => {
      inquirer.prompt.mockResolvedValueOnce({ entryFile: 'nonexistent.js' });
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await installGoogleOAuth(tempDir);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Entry file nonexistent.js not found')
      );

      consoleErrorSpy.mockRestore();
    });

    test('should fail when not a valid Node.js project', async () => {
      // Remove package.json to make it invalid
      fs.unlinkSync(path.join(tempDir, 'package.json'));
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await installGoogleOAuth(tempDir);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('does not contain a valid Node.js project')
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('GitHub OAuth Installation', () => {
    test('should install GitHub OAuth module successfully', async () => {
      // Mock user inputs
      inquirer.prompt
        .mockResolvedValueOnce({ entryFile: 'app.js' })
        .mockResolvedValueOnce({
          CLIENT_ID: 'test-github-client-id',
          CLIENT_SECRET: 'test-github-secret',
          CALLBACK_URL: 'http://localhost:3000/auth/github/callback'
        });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await installGithubOAuth(tempDir);

      // Verify files were created
      expect(fs.existsSync(path.join(tempDir, 'config/githubStrategy.js'))).toBe(true);
      expect(fs.existsSync(path.join(tempDir, 'routes/githubRoutes.js'))).toBe(true);

      // Verify .env was updated
      const envContent = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
      expect(envContent).toContain('GITHUB_CLIENT_ID=test-github-client-id');
      expect(envContent).toContain('GITHUB_CLIENT_SECRET=test-github-secret');

      consoleSpy.mockRestore();
    });
  });

  describe('Package Manager Detection', () => {
    test('should work with different package managers', async () => {
      // Test with yarn
      fs.unlinkSync(path.join(tempDir, 'package-lock.json'));
      fs.writeFileSync(path.join(tempDir, 'yarn.lock'), '');

      inquirer.prompt
        .mockResolvedValueOnce({ entryFile: 'app.js' })
        .mockResolvedValueOnce({
          CLIENT_ID: 'test-id',
          CLIENT_SECRET: 'test-secret',
          CALLBACK_URL: 'http://localhost:3000/callback'
        });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await installGoogleOAuth(tempDir);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('yarn detected as package manager')
      );

      consoleSpy.mockRestore();
    });

    test('should handle no package manager detected', async () => {
      // Remove all lock files
      fs.unlinkSync(path.join(tempDir, 'package-lock.json'));
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await installGoogleOAuth(tempDir);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Could not detect package manager')
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
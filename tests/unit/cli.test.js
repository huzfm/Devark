import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { jest } from '@jest/globals';

// Helper function to safely execute CLI commands
function safeExecSync(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf-8', ...options });
  } catch (error) {
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || '',
      status: error.status,
      output: (error.stdout || '') + (error.stderr || '')
    };
  }
}

describe('CLI Commands', () => {
  const cliPath = path.resolve('bin/devark.js');
  
  // Read version from package.json dynamically
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const expectedVersion = packageJson.version;

  test('should display version with --version flag', () => {
    const output = execSync(`node ${cliPath} --version`, { encoding: 'utf-8' });
    expect(output.trim()).toBe(expectedVersion);
  });

  test('should display help with help command', () => {
    const output = execSync(`node ${cliPath} help`, { encoding: 'utf-8' });
    expect(output).toContain('Devark CLI - Available Commands');
    expect(output).toContain('google-oauth');
    expect(output).toContain('github-oauth');
    expect(output).toContain('resend-otp');
  });

  test('should display help when no arguments provided', () => {
    const result = safeExecSync(`node ${cliPath}`);
    expect(result.output).toContain('Usage: devark');
    expect(result.output).toContain('Devark CLI');
  });

  test('should handle unsupported template gracefully', () => {
    const result = safeExecSync(`node ${cliPath} add unsupported-template`);
    expect(result.output).toContain('Template "unsupported-template" not supported yet');
  });

  test('should handle SIGINT gracefully', (done) => {
    const child = spawn('node', [cliPath, 'add', 'google-oauth'], {
      stdio: 'pipe'
    });
    
    setTimeout(() => {
      child.kill('SIGINT');
    }, 100);
    
    child.on('exit', (code) => {
      expect(code).toBe(0);
      done();
    });
  });
});
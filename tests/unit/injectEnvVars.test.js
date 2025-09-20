import fs from 'fs';
import path from 'path';
import { jest } from '@jest/globals';
import { injectEnvVars } from '../../utils/injectEnvVars.js';

describe('Inject Environment Variables', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = global.testUtils.createTempDir();
  });

  afterEach(() => {
    global.testUtils.cleanupTempDir(tempDir);
  });

  test('should create .env file with new variables', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    const vars = {
      API_KEY: 'test-key',
      DATABASE_URL: 'postgresql://localhost:5432/test'
    };
    
    injectEnvVars(tempDir, vars);
    
    const envPath = path.join(tempDir, '.env');
    expect(fs.existsSync(envPath)).toBe(true);
    
    const content = fs.readFileSync(envPath, 'utf-8');
    expect(content).toContain('API_KEY=test-key');
    expect(content).toContain('DATABASE_URL=postgresql://localhost:5432/test');
    
    expect(consoleSpy).toHaveBeenCalledWith('✅ .env updated');
    consoleSpy.mockRestore();
  });

  test('should update existing .env file without overwriting existing values', () => {
    const envPath = path.join(tempDir, '.env');
    fs.writeFileSync(envPath, 'EXISTING_VAR=existing-value\nAPI_KEY=old-key');
    
    const vars = {
      API_KEY: 'new-key',
      NEW_VAR: 'new-value'
    };
    
    injectEnvVars(tempDir, vars);
    
    const content = fs.readFileSync(envPath, 'utf-8');
    expect(content).toContain('EXISTING_VAR=existing-value');
    expect(content).toContain('API_KEY=new-key');
    expect(content).toContain('NEW_VAR=new-value');
  });

  test('should handle empty values by not setting them', () => {
    const vars = {
      API_KEY: 'test-key',
      EMPTY_VAR: '',
      UNDEFINED_VAR: undefined,
      NULL_VAR: null
    };
    
    injectEnvVars(tempDir, vars);
    
    const content = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
    expect(content).toContain('API_KEY=test-key');
    expect(content).not.toContain('EMPTY_VAR=');
    expect(content).not.toContain('UNDEFINED_VAR=');
    expect(content).not.toContain('NULL_VAR=');
  });

  test('should handle values with equals signs', () => {
    const vars = {
      DATABASE_URL: 'postgresql://user:pass=word@localhost:5432/db'
    };
    
    injectEnvVars(tempDir, vars);
    
    const content = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
    expect(content).toContain('DATABASE_URL=postgresql://user:pass=word@localhost:5432/db');
  });
});
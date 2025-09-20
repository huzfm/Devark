import fs from 'fs';
import path from 'path';
import { renderTemplate } from '../../utils/filePaths.js';

describe('Template Rendering Integration', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = global.testUtils.createTempDir();
  });

  afterEach(() => {
    global.testUtils.cleanupTempDir(tempDir);
  });

  test('should render Google OAuth strategy template correctly', () => {
    const templatePath = path.resolve('packages/google-oauth/templates/config/googleStrategy.ejs');
    const outputPath = path.join(tempDir, 'googleStrategy.js');
    
    const templateData = {
      CLIENT_ID: 'test-google-client-id',
      CLIENT_SECRET: 'test-google-secret',
      CALLBACK_URL: 'http://localhost:3000/auth/google/callback'
    };

    renderTemplate(templatePath, outputPath, templateData);

    const content = fs.readFileSync(outputPath, 'utf-8');
    
    expect(content).toContain('passport-google-oauth20');
    expect(content).toContain('test-google-client-id');
    expect(content).toContain('test-google-secret');
    expect(content).toContain('http://localhost:3000/auth/google/callback');
  });

  test('should render GitHub OAuth routes template correctly', () => {
    const templatePath = path.resolve('packages/github-oauth/templates/routes/githubRoutes.ejs');
    const outputPath = path.join(tempDir, 'githubRoutes.js');

    renderTemplate(templatePath, outputPath);

    const content = fs.readFileSync(outputPath, 'utf-8');
    
    expect(content).toContain('/auth/github');
    expect(content).toContain('/auth/github/callback');
    expect(content).toContain('passport.authenticate');
  });

  test('should render Node-MongoDB template with project data', () => {
    const templatePath = path.resolve('packages/node-mongodb-template/templates/package.json.ejs');
    const outputPath = path.join(tempDir, 'package.json');

    renderTemplate(templatePath, outputPath);

    const content = fs.readFileSync(outputPath, 'utf-8');
    const packageJson = JSON.parse(content);
    
    expect(packageJson.name).toBe('node-mongo-app');
    expect(packageJson.type).toBe('module');
    expect(packageJson.scripts.dev).toBe('nodemon app.js');
  });

  test('should handle template with conditional logic', () => {
    // Create a test template with conditionals
    const templatePath = path.join(tempDir, 'conditional.ejs');
    const templateContent = `
<% if (features.includes('auth')) { %>
const authMiddleware = require('./auth');
<% } %>
<% if (features.includes('database')) { %>
const db = require('./database');
<% } %>
const port = <%= port || 3000 %>;
    `.trim();
    
    fs.writeFileSync(templatePath, templateContent);
    
    const outputPath = path.join(tempDir, 'conditional.js');
    const templateData = {
      features: ['auth', 'logging'],
      port: 5000
    };

    renderTemplate(templatePath, outputPath, templateData);

    const content = fs.readFileSync(outputPath, 'utf-8');
    
    expect(content).toContain('const authMiddleware');
    expect(content).not.toContain('const db = require');
    expect(content).toContain('const port = 5000;');
  });
});
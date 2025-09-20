import fs from 'fs';
import path from 'path';
import { ensureDir, renderTemplate, appendIfMissing } from '../../utils/filePaths.js';

describe('File Path Utils', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = global.testUtils.createTempDir();
  });

  afterEach(() => {
    global.testUtils.cleanupTempDir(tempDir);
  });

  describe('ensureDir', () => {
    test('should create directory if it does not exist', () => {
      const dirPath = path.join(tempDir, 'new', 'nested', 'directory');
      ensureDir(dirPath);
      expect(fs.existsSync(dirPath)).toBe(true);
    });

    test('should not fail if directory already exists', () => {
      const dirPath = path.join(tempDir, 'existing');
      fs.mkdirSync(dirPath);
      expect(() => ensureDir(dirPath)).not.toThrow();
      expect(fs.existsSync(dirPath)).toBe(true);
    });
  });

  describe('renderTemplate', () => {
    test('should render EJS template with data', () => {
      const templatePath = path.join(tempDir, 'template.ejs');
      const outputPath = path.join(tempDir, 'output.js');
      
      fs.writeFileSync(templatePath, 'const name = "<%= name %>";\nconst version = "<%= version %>";');
      
      renderTemplate(templatePath, outputPath, { name: 'test-app', version: '1.0.0' });
      
      const content = fs.readFileSync(outputPath, 'utf-8');
      expect(content).toContain('const name = "test-app";');
      expect(content).toContain('const version = "1.0.0";');
    });

    test('should render template without data', () => {
      const templatePath = path.join(tempDir, 'simple.ejs');
      const outputPath = path.join(tempDir, 'simple.js');
      
      fs.writeFileSync(templatePath, 'console.log("Hello World");');
      
      renderTemplate(templatePath, outputPath);
      
      const content = fs.readFileSync(outputPath, 'utf-8');
      expect(content).toBe('console.log("Hello World");');
    });

    test('should handle complex EJS expressions', () => {
      const templatePath = path.join(tempDir, 'complex.ejs');
      const outputPath = path.join(tempDir, 'complex.js');
      
      fs.writeFileSync(templatePath, `
<% if (features.includes('auth')) { %>
const authRoutes = require('./auth');
<% } %>
const port = <%= port || 3000 %>;
      `.trim());
      
      renderTemplate(templatePath, outputPath, { 
        features: ['auth', 'database'], 
        port: 5000 
      });
      
      const content = fs.readFileSync(outputPath, 'utf-8');
      expect(content).toContain("const authRoutes = require('./auth');");
      expect(content).toContain('const port = 5000;');
    });
  });

  describe('appendIfMissing', () => {
    test('should append content if search string is missing', () => {
      const filePath = path.join(tempDir, 'test.js');
      fs.writeFileSync(filePath, 'const express = require("express");');
      
      appendIfMissing(filePath, 'app.listen', 'app.listen(3000);');
      
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('app.listen(3000);');
    });

    test('should not append content if search string exists', () => {
      const filePath = path.join(tempDir, 'test.js');
      const initialContent = 'const express = require("express");\napp.listen(3000);';
      fs.writeFileSync(filePath, initialContent);
      
      appendIfMissing(filePath, 'app.listen', 'app.listen(5000);');
      
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toBe(initialContent);
      expect(content).not.toContain('app.listen(5000);');
    });

    test('should add newline before appended content', () => {
      const filePath = path.join(tempDir, 'test.js');
      fs.writeFileSync(filePath, 'const express = require("express");');
      
      appendIfMissing(filePath, 'app.listen', 'app.listen(3000);');
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      expect(lines).toHaveLength(2); // original + new content
      expect(lines[1]).toBe('app.listen(3000);');
      expect(content).toContain('\napp.listen(3000);'); // Verify newline is added
    });
  });
});
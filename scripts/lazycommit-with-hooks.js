#!/usr/bin/env node
import { execSync } from 'child_process';

try {
      console.log("🔧 Running Husky pre-commit hook...");
      execSync('pnpm exec husky run pre-commit', { stdio: 'inherit' });

      console.log("🚀 Running lazycommit...");
      execSync('pnpm exec lazycommit', { stdio: 'inherit' });
} catch (err) {
      console.error("❌ Hook or lazycommit failed");
      process.exit(1);
}

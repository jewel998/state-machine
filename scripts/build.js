#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  Building @jewel998/state-machine...');

// Clean dist directory
console.log('🧹 Cleaning dist directory...');
try {
  execSync('npm run clean', { stdio: 'inherit' });
} catch (error) {
  console.log('Clean command not found, continuing...');
}

// Run TypeScript compilation
console.log('📦 Compiling TypeScript...');
try {
  execSync('tsc', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation successful');
} catch (error) {
  console.error('❌ TypeScript compilation failed');
  process.exit(1);
}

// Verify dist directory exists and has files
const distPath = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ Dist directory was not created');
  process.exit(1);
}

const files = fs.readdirSync(distPath);
if (files.length === 0) {
  console.error('❌ No files were generated in dist directory');
  process.exit(1);
}

console.log('✅ Build completed successfully!');
console.log(`📁 Generated files: ${files.join(', ')}`);

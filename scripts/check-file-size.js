#!/usr/bin/env node

/**
 * File Size Checker
 * Enforces maximum file size limits
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILE_SIZE_LIMITS = {
  '.html': 500,
  '.js': 500,
  '.css': 1000,
  '.json': 100
};

const CRITICAL_THRESHOLD = 2; // Multiplier for critical status

function checkFileSize(filePath) {
  const stats = fs.statSync(filePath);
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n').length;
  const ext = path.extname(filePath);
  const limit = FILE_SIZE_LIMITS[ext] || 500;
  
  return {
    path: filePath,
    lines: lines,
    limit: limit,
    status: lines <= limit ? 'OK' : lines <= limit * CRITICAL_THRESHOLD ? 'WARNING' : 'CRITICAL',
    percentage: Math.round((lines / limit) * 100)
  };
}

function walkDir(dir, results = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
        walkDir(filePath, results);
      }
    } else {
      const ext = path.extname(file);
      if (FILE_SIZE_LIMITS[ext]) {
        results.push(checkFileSize(filePath));
      }
    }
  }
  
  return results;
}

// Main execution
const projectRoot = path.join(__dirname, '..');
const results = walkDir(projectRoot);

// Filter and sort results
const violations = results.filter(r => r.status !== 'OK');
violations.sort((a, b) => b.percentage - a.percentage);

// Output results
console.log('\n📊 File Size Analysis\n');
console.log('=' .repeat(80));

if (violations.length === 0) {
  console.log('✅ All files are within size limits!');
} else {
  console.log(`Found ${violations.length} files exceeding limits:\n`);
  
  violations.forEach(file => {
    const emoji = file.status === 'CRITICAL' ? '🔴' : '⚠️';
    const relPath = path.relative(projectRoot, file.path);
    console.log(`${emoji} ${relPath}`);
    console.log(`   Lines: ${file.lines} / ${file.limit} (${file.percentage}%)`);
    console.log(`   Status: ${file.status}`);
    console.log();
  });
  
  const critical = violations.filter(v => v.status === 'CRITICAL');
  if (critical.length > 0) {
    console.log(`\n❌ ${critical.length} files in CRITICAL state need immediate refactoring!`);
    process.exit(1);
  }
}

console.log('\nRecommendations:');
console.log('- Files over 500 lines should be split into modules');
console.log('- Extract reusable components');
console.log('- Separate concerns (UI, logic, data)');
console.log();
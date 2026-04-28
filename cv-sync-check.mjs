#!/usr/bin/env node

/**
 * cv-sync-check.mjs — Validates that the career setup is consistent.
 *
 * Checks:
 * 1. cv.md exists
 * 2. config/profile.yml exists and has required fields
 * 3. No hardcoded metrics in _shared.md or batch/batch-prompt.md
 * 4. article-digest.md freshness (if exists)
 */

import { readFileSync, existsSync, statSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = __dirname;

const errors = [];
const warnings = [];

// Detect profiles
const profilesDir = join(projectRoot, 'profiles');
let profiles = [];
if (existsSync(profilesDir)) {
  profiles = readdirSync(profilesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('_'))
    .map(dirent => dirent.name);
}

if (profiles.length === 0) {
  errors.push('No profiles found in profiles/. Create one using profiles/_template as a base.');
}

for (const profile of profiles) {
  const profileRoot = join(profilesDir, profile);
  console.log(`\n--- Checking profile: ${profile} ---`);

  // 1. Check cv.md exists
  const cvPath = join(profileRoot, 'cv.md');
  if (!existsSync(cvPath)) {
    errors.push(`[${profile}] cv.md not found in profile folder.`);
  } else {
    const cvContent = readFileSync(cvPath, 'utf-8');
    if (cvContent.trim().length < 100) {
      warnings.push(`[${profile}] cv.md seems too short.`);
    }
  }

  // 2. Check profile.yml exists
  const profilePath = join(profileRoot, 'profile.yml');
  if (!existsSync(profilePath)) {
    errors.push(`[${profile}] profile.yml not found in profile folder.`);
  } else {
    const profileContent = readFileSync(profilePath, 'utf-8');
    const requiredFields = ['full_name', 'email', 'location'];
    for (const field of requiredFields) {
      if (!profileContent.includes(field) || profileContent.includes(`"Jane Smith"`) || profileContent.includes(`"Name"`)) {
        warnings.push(`[${profile}] profile.yml may still have example data. Check field: ${field}`);
        break;
      }
    }
  }

  // 4. Check article-digest.md freshness
  const digestPath = join(profileRoot, 'article-digest.md');
  if (existsSync(digestPath)) {
    const stats = statSync(digestPath);
    const daysSinceModified = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);
    if (daysSinceModified > 30) {
      warnings.push(`[${profile}] article-digest.md is ${Math.round(daysSinceModified)} days old.`);
    }
  }
}

// 3. Global checks (hardcoded metrics in system prompts)
console.log('\n--- Global checks ---');
const filesToCheck = [
  { path: join(projectRoot, 'modes', '_shared.md'), name: '_shared.md' },
  { path: join(projectRoot, 'batch', 'batch-prompt.md'), name: 'batch-prompt.md' },
];

const metricPattern = /\b\d{2,4}\+?\s*(hours?|%|evals?|layers?|tests?|fields?|bases?)\b/gi;

for (const { path, name } of filesToCheck) {
  if (!existsSync(path)) continue;
  const content = readFileSync(path, 'utf-8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('NEVER hardcode') || line.includes('NUNCA hardcode') || line.startsWith('#') || line.startsWith('<!--')) continue;
    const matches = line.match(metricPattern);
    if (matches) {
      warnings.push(`${name}:${i + 1} — Possible hardcoded metric: "${matches[0]}".`);
    }
  }
}

// Output results
console.log('\n=== career sync check summary ===\n');

if (errors.length === 0 && warnings.length === 0) {
  console.log('All checks passed.');
} else {
  if (errors.length > 0) {
    console.log(`ERRORS (${errors.length}):`);
    errors.forEach(e => console.log(`  ERROR: ${e}`));
  }
  if (warnings.length > 0) {
    console.log(`\nWARNINGS (${warnings.length}):`);
    warnings.forEach(w => console.log(`  WARN: ${w}`));
  }
}

console.log('');
process.exit(errors.length > 0 ? 1 : 0);

console.log('');
process.exit(errors.length > 0 ? 1 : 0);

#!/usr/bin/env node

/**
 * ingest-job.mjs — Ingests job descriptions and creates structured YAML files.
 *
 * Usage:
 *   node ingest-job.mjs --mode structured --slug job-slug --title "Job Title" --company "Company" --requirements "skill1,skill2" ...
 *   node ingest-job.mjs --mode freeform --slug job-slug --input "raw JD text or URL"
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace('--', '');
  const value = args[i + 1];
  options[key] = value;
}

const { mode, slug } = options;

if (!mode || !slug) {
  console.error('Usage: node ingest-job.mjs --mode <structured|freeform> --slug <job-slug> [other options]');
  process.exit(1);
}

const outputPath = join(__dirname, 'data', 'jobs', `${slug}.yml`);

let jobData;

if (mode === 'structured') {
  // Direct creation from form input
  jobData = {
    title: options.title || '',
    company: options.company || '',
    client_slug: options.client_slug || slug,
    requirements: options.requirements ? options.requirements.split(',').map(s => s.trim()) : [],
    nice_to_haves: options.nice_to_haves ? options.nice_to_haves.split(',').map(s => s.trim()) : [],
    archetype: options.archetype || '',
    budget_range: options.budget_range || '',
    clearance_required: options.clearance_required ? JSON.parse(options.clearance_required) : [],
    visa_required: options.visa_required === 'true',
    domain: options.domain || '',
    description_raw: options.description_raw || '',
    status: 'open'
  };
} else if (mode === 'freeform') {
  // LLM-assisted extraction from raw JD text/URL
  const input = options.input;
  if (!input) {
    console.error('--input required for freeform mode');
    process.exit(1);
  }

  // TODO: Implement LLM extraction
  // For now, placeholder
  console.log('Freeform mode: LLM extraction not implemented yet. Use structured mode.');
  process.exit(1);

  // Pseudocode:
  // const extracted = await extractJobDetails(input);
  // jobData = extracted;
} else {
  console.error('Invalid mode. Use "structured" or "freeform"');
  process.exit(1);
}

// Write YAML
const yamlContent = Object.entries(jobData)
  .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
  .join('\n');

writeFileSync(outputPath, yamlContent, 'utf-8');
console.log(`Created ${outputPath}`);
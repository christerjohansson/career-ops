#!/usr/bin/env node

/**
 * match-candidates.mjs — Core matching engine for multi-candidate system.
 *
 * Runs Block B-style matching across all candidates for all jobs.
 * Outputs ranked match reports.
 */

import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Weights from config/profile.yml (default if not set)
const WEIGHTS = {
  skills: 0.40,
  archetype: 0.25,
  proof_points: 0.15,
  availability: 0.10,
  rate: 0.05,
  clearance_visa: 0.05
};

function loadAllCandidates(candidatesDir) {
  const candidates = [];
  const dirs = readdirSync(candidatesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const slug of dirs) {
    const candidateDir = join(candidatesDir, slug);
    const candidate = { slug };

    // Load CV
    const cvPath = join(candidateDir, 'cv.md');
    if (existsSync(cvPath)) {
      candidate.cv = readFileSync(cvPath, 'utf-8');
    }

    // Load profile
    const profilePath = join(candidateDir, 'profile.yml');
    if (existsSync(profilePath)) {
      candidate.profile = yaml.load(readFileSync(profilePath, 'utf-8'));
    }

    // Load article-digest
    const digestPath = join(candidateDir, 'article-digest.md');
    if (existsSync(digestPath)) {
      candidate.proofPoints = readFileSync(digestPath, 'utf-8');
    }

    // Load availability
    const availPath = join(candidateDir, 'availability.yml');
    if (existsSync(availPath)) {
      candidate.availability = yaml.load(readFileSync(availPath, 'utf-8'));
    }

    // Load consulting data
    const consultPath = join(candidateDir, 'consulting-data.yml');
    if (existsSync(consultPath)) {
      candidate.consulting = yaml.load(readFileSync(consultPath, 'utf-8'));
    }

    candidates.push(candidate);
  }

  return candidates;
}

function loadAllJobs(jobsDir) {
  const jobs = [];
  const files = readdirSync(jobsDir)
    .filter(file => file.endsWith('.yml'));

  for (const file of files) {
    const slug = file.replace('.yml', '');
    const jobPath = join(jobsDir, file);
    const job = yaml.load(readFileSync(jobPath, 'utf-8'));
    job.slug = slug;
    jobs.push(job);
  }

  return jobs;
}

function calculateFit(candidate, job) {
  let score = 0;

  // Skills Match (40%)
  const skillsScore = calculateSkillsMatch(candidate, job);
  score += skillsScore * WEIGHTS.skills;

  // Archetype Fit (25%)
  const archetypeScore = calculateArchetypeFit(candidate, job);
  score += archetypeScore * WEIGHTS.archetype;

  // Proof Points (15%)
  const proofScore = calculateProofPointsRelevance(candidate, job);
  score += proofScore * WEIGHTS.proof_points;

  // Availability (10%)
  const availScore = calculateAvailabilityAlignment(candidate, job);
  score += availScore * WEIGHTS.availability;

  // Rate Alignment (5%)
  const rateScore = calculateRateAlignment(candidate, job);
  score += rateScore * WEIGHTS.rate;

  // Clearance/Visa (5%)
  const clearanceScore = calculateClearanceVisaMatch(candidate, job);
  score += clearanceScore * WEIGHTS.clearance_visa;

  return Math.min(5, Math.max(1, score)); // 1-5 scale
}

function calculateSkillsMatch(candidate, job) {
  // Simple keyword matching
  const cvText = candidate.cv || '';
  const requirements = job.requirements || [];
  const niceToHaves = job.nice_to_haves || [];

  let matches = 0;
  let total = requirements.length + niceToHaves.length;

  for (const req of requirements) {
    if (cvText.toLowerCase().includes(req.toLowerCase())) matches++;
  }

  for (const nice of niceToHaves) {
    if (cvText.toLowerCase().includes(nice.toLowerCase())) matches += 0.5; // Partial credit
  }

  return total > 0 ? (matches / total) * 5 : 3; // Normalize to 1-5
}

function calculateArchetypeFit(candidate, job) {
  const candidateArchetypes = candidate.profile?.archetypes || [];
  const jobArchetype = job.archetype;

  if (candidateArchetypes.includes(jobArchetype)) return 5;
  // Could add similarity scoring, for now binary
  return 2.5;
}

function calculateProofPointsRelevance(candidate, job) {
  const proofText = candidate.proofPoints || '';
  const domain = job.domain || '';

  if (proofText.toLowerCase().includes(domain.toLowerCase())) return 5;
  return 3;
}

function calculateAvailabilityAlignment(candidate, job) {
  const status = candidate.availability?.status;
  if (status === 'available') return 5;
  if (status === 'on-project') return 3;
  return 1;
}

function calculateRateAlignment(candidate, job) {
  const candidateRate = candidate.consulting?.bill_rate_range;
  const jobBudget = job.budget_range;

  // Simple string comparison, could parse ranges
  if (candidateRate && jobBudget && candidateRate === jobBudget) return 5;
  return 3;
}

function calculateClearanceVisaMatch(candidate, job) {
  const candidateClearance = candidate.consulting?.security_clearance || [];
  const requiredClearance = job.clearance_required || [];
  const visaRequired = job.visa_required;
  const candidateVisa = candidate.consulting?.visa_status;

  let score = 5;

  for (const req of requiredClearance) {
    if (!candidateClearance.includes(req)) score -= 2;
  }

  if (visaRequired && candidateVisa !== 'US citizen') score -= 2;

  return Math.max(1, score);
}

function generateMatchReport(job, scores) {
  console.log(`\n=== Match Report for Job: ${job.title} (${job.slug}) ===`);
  scores.forEach(({ candidate, score }, index) => {
    console.log(`${index + 1}. ${candidate.slug}: ${score.toFixed(2)}`);
  });
}

// Main execution
const candidatesDir = join(__dirname, 'data', 'candidates');
const jobsDir = join(__dirname, 'data', 'jobs');

const candidates = loadAllCandidates(candidatesDir);
const jobs = loadAllJobs(jobsDir);

console.log(`Loaded ${candidates.length} candidates and ${jobs.length} jobs`);

for (const job of jobs) {
  const scores = [];
  for (const candidate of candidates) {
    const score = calculateFit(candidate, job);
    scores.push({ candidate, score });
  }
  scores.sort((a, b) => b.score - a.score);
  generateMatchReport(job, scores);
}
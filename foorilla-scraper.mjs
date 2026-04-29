#!/usr/bin/env node

/**
 * foorilla-scraper.mjs — Playwright-based scraper for foorilla.com
 */

import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { chromium } from 'playwright';
import yaml from 'js-yaml';
const parseYaml = yaml.load;

// ── Config ──────────────────────────────────────────────────────────

const PORTALS_PATH = 'portals.yml';
const SCAN_HISTORY_PATH = 'data/scan-history.tsv';
const PIPELINE_PATH = 'data/pipeline.md';
const APPLICATIONS_PATH = 'data/applications.md';
const JDS_DIR = 'jds';

mkdirSync('data', { recursive: true });
mkdirSync(JDS_DIR, { recursive: true });

// ── Utils (copied from scan.mjs for now) ────────────────────────────

function buildTitleFilter(titleFilter) {
  const positive = (titleFilter?.positive || []).map(k => k.toLowerCase());
  const negative = (titleFilter?.negative || []).map(k => k.toLowerCase());

  return (title) => {
    const lower = title.toLowerCase();
    const hasPositive = positive.length === 0 || positive.some(k => lower.includes(k));
    const hasNegative = negative.some(k => lower.includes(k));
    return hasPositive && !hasNegative;
  };
}

function loadSeenUrls() {
  const seen = new Set();
  if (existsSync(SCAN_HISTORY_PATH)) {
    const lines = readFileSync(SCAN_HISTORY_PATH, 'utf-8').split('\n');
    for (const line of lines.slice(1)) {
      const url = line.split('\t')[0];
      if (url) seen.add(url);
    }
  }
  if (existsSync(PIPELINE_PATH)) {
    const text = readFileSync(PIPELINE_PATH, 'utf-8');
    for (const match of text.matchAll(/- \[[ x]\] (https?:\/\/\S+|local:jds\/\S+)/g)) {
      seen.add(match[1]);
    }
  }
  return seen;
}

function appendToPipeline(offers) {
  if (offers.length === 0) return;
  let text = readFileSync(PIPELINE_PATH, 'utf-8');
  const marker = '## Pendientes';
  const idx = text.indexOf(marker);
  const block = offers.map(o => `- [ ] ${o.url} | ${o.company} | ${o.title}`).join('\n') + '\n';
  
  if (idx === -1) {
    const procIdx = text.indexOf('## Procesadas');
    const insertAt = procIdx === -1 ? text.length : procIdx;
    text = text.slice(0, insertAt) + `\n${marker}\n\n` + block + '\n' + text.slice(insertAt);
  } else {
    const afterMarker = idx + marker.length;
    const nextSection = text.indexOf('\n## ', afterMarker);
    const insertAt = nextSection === -1 ? text.length : nextSection;
    text = text.slice(0, insertAt) + '\n' + block + text.slice(insertAt);
  }
  writeFileSync(PIPELINE_PATH, text, 'utf-8');
}

function appendToScanHistory(offers, date) {
  if (!existsSync(SCAN_HISTORY_PATH)) {
    writeFileSync(SCAN_HISTORY_PATH, 'url\tfirst_seen\tportal\ttitle\tcompany\tstatus\n', 'utf-8');
  }
  const lines = offers.map(o => `${o.url}\t${date}\tFoorilla\t${o.title}\t${o.company}\tadded`).join('\n') + '\n';
  appendFileSync(SCAN_HISTORY_PATH, lines, 'utf-8');
}

  // ── Scraper ─────────────────────────────────────────────────────────

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const config = parseYaml(readFileSync(PORTALS_PATH, 'utf-8'));
  const titleFilter = buildTitleFilter(config.title_filter);
  const seenUrls = loadSeenUrls();
  const date = new Date().toISOString().slice(0, 10);

  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Navigating to Foorilla...');
  await page.goto('https://foorilla.com/hiring/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000); // Give it a bit more time for HTMX

  // Get initial count
  const initialCount = await page.$$eval('.hstack.justify-content-between', els => els.length);
  console.log(`Found ${initialCount} job entries.`);

  const newOffers = [];
  
  for (let i = 0; i < initialCount; i++) {
    try {
      // Re-fetch the entry by index to avoid "detached from DOM" errors
      const entries = await page.$$('.hstack.justify-content-between');
      if (i >= entries.length) break;
      const entry = entries[i];
      
      // 1. Get title
      const titleRaw = await entry.evaluate(el => el.querySelector('a')?.innerText || el.innerText.split('\n')[0]);
      const title = titleRaw.trim();
      
      if (!titleFilter(title)) continue;

      // 2. Click to load description
      console.log(`Processing [${i+1}/${initialCount}]: ${title}`);
      await entry.scrollIntoViewIfNeeded();
      await entry.click();
      await page.waitForTimeout(1500); // Wait for HTMX swap

      // 3. Extract description and company from the pane
      const details = await page.evaluate(() => {
          const pane = document.querySelector('.col-9, .col-md-10, main');
          if (!pane) return null;
          
          const company = document.querySelector('.offcanvas-title, h1, h2')?.innerText || 'Unknown';
          const description = pane.innerText;
          return { company: company.trim(), description: description.trim() };
      });

      if (!details) continue;

      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50);
      const companySlug = details.company.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 30);
      const jdFilename = `${companySlug}-${slug}.md`.replace(/^-+|-+$/g, '');
      const jdPath = `${JDS_DIR}/${jdFilename}`;
      const localUrl = `local:${JDS_DIR}/${jdFilename}`;

      if (seenUrls.has(localUrl)) {
          console.log(`  Skipping (already seen): ${localUrl}`);
          continue;
      }

      // 4. Save JD
      if (!dryRun) {
          const jdContent = `# ${title}\n\n**Company:** ${details.company}\n**Source:** https://foorilla.com/hiring/\n\n${details.description}`;
          writeFileSync(jdPath, jdContent, 'utf-8');
      }

      newOffers.push({
        title,
        company: details.company,
        url: localUrl,
        source: 'Foorilla'
      });
      
      seenUrls.add(localUrl);
    } catch (err) {
      console.error(`  Error processing entry ${i+1}: ${err.message}`);
      // Continue to next entry
    }
  }

  await browser.close();

  if (!dryRun && newOffers.length > 0) {
    appendToPipeline(newOffers);
    appendToScanHistory(newOffers, date);
    console.log(`\nAdded ${newOffers.length} new offers to pipeline.`);
  } else {
    console.log(`\nScan complete. Found ${newOffers.length} matches (dry-run or no new offers).`);
  }
}

main().catch(console.error);

// @ts-nocheck
// AWS profile discovery for the Bedrock Settings UI. Reads the standard
// shared-config locations + the Vidyard-specific .aws-profile file under
// $VIDYARD_PATH/devyard so users can pick from a known list rather than
// typing profile names from memory.
//
// Format expected (same as ~/.aws/config):
//   [profile NAME]
//   key = value
//   [default]   ← special-cased, exposed as 'default'
//
// We only return profile names — never the contents (sso_start_url etc.)
// since the credential chain handles auth itself.

import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';

const PROFILE_HEADER = /^\[(?:profile\s+([^\]]+)|(default))\]\s*$/;

export function parseAwsProfiles(content) {
  const out = [];
  if (typeof content !== 'string') return out;
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith(';')) continue;
    const match = PROFILE_HEADER.exec(line);
    if (!match) continue;
    const name = (match[1] ?? match[2] ?? '').trim();
    if (name) out.push(name);
  }
  return out;
}

async function readProfileFile(file) {
  try {
    return await readFile(file, 'utf8');
  } catch (err) {
    if (err && err.code === 'ENOENT') return null;
    return null;
  }
}

export function candidateProfileFiles() {
  const files = [];
  const seen = new Set();
  const add = (file) => {
    if (typeof file !== 'string' || !file) return;
    const normalized = path.resolve(file);
    if (seen.has(normalized)) return;
    seen.add(normalized);
    files.push(normalized);
  };
  const vidyard = process.env.VIDYARD_PATH?.trim();
  if (vidyard) {
    add(path.join(vidyard, 'devyard', '.aws-profile'));
    add(path.join(vidyard, 'devyard', '.aws-profiles'));
  }
  add(process.env.AWS_CONFIG_FILE?.trim());
  add(path.join(homedir(), '.aws', 'config'));
  return files;
}

export async function loadAwsProfiles() {
  const sources = [];
  const seen = new Set();
  const profiles = [];
  for (const file of candidateProfileFiles()) {
    const content = await readProfileFile(file);
    if (content === null) continue;
    const found = parseAwsProfiles(content);
    if (found.length === 0) continue;
    sources.push(file);
    for (const name of found) {
      if (seen.has(name)) continue;
      seen.add(name);
      profiles.push(name);
    }
  }
  profiles.sort((a, b) => a.localeCompare(b));
  return { profiles, sources };
}

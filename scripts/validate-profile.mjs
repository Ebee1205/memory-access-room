import { readFileSync } from 'node:fs';

const path = new URL('../public/data/profile.json', import.meta.url);
const data = JSON.parse(readFileSync(path, 'utf8'));
const fail = (reason) => { throw new Error(`Invalid public profile: ${reason}`); };
if (data.meta?.schemaVersion !== 1) fail('unsupported schemaVersion');
if (data.meta?.visibility !== 'public') fail('visibility must be public');
if (typeof data.meta?.approved !== 'boolean') fail('approved must be boolean');
if (!Array.isArray(data.channels) || !data.channels.length) fail('channels are required');
const ids = new Set();
for (const channel of data.channels) {
  if (!channel.id || !channel.label || !channel.title || !Array.isArray(channel.entries)) fail('invalid channel');
  if (ids.has(channel.id)) fail(`duplicate channel: ${channel.id}`);
  ids.add(channel.id);
  for (const entry of channel.entries) {
    if (typeof entry.heading !== 'string' || typeof entry.body !== 'string') fail(`invalid entry in ${channel.id}`);
    if (entry.link?.href && !/^https:\/\//.test(entry.link.href)) fail('entry links must use https');
  }
}
for (const contact of data.contacts ?? []) {
  if (!contact.label || !/^(https:\/\/|mailto:)/.test(contact.href ?? '')) fail('invalid contact link');
}
console.log('Public profile schema is valid.');
if (!data.meta.approved) console.warn('WARNING: this is unreviewed sample content. Do not treat it as LLM-reviewed.');

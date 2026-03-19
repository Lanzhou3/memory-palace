#!/usr/bin/env node
import { MemoryPalaceManager } from '../dist/src/manager.js';
import { ExperienceManager } from '../dist/src/experience-manager.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Workspace path from env or default
const workspacePath = process.env.OPENCLAW_WORKSPACE || process.env.HOME + '/.openclaw/workspace';
const memoryPath = join(workspacePath, 'memory', 'palace');

const manager = new MemoryPalaceManager(memoryPath);
const expManager = new ExperienceManager(memoryPath);

const action = process.argv[2];
const args = JSON.parse(process.argv[3] || '{}');

async function main() {
  let result;
  
  switch (action) {
    case 'write':
      result = await manager.write(args.content, args.location, args.tags, args.importance, args.type);
      break;
    case 'get':
      result = await manager.get(args.id);
      break;
    case 'update':
      result = await manager.update(args.id, args.content, args.tags, args.importance);
      break;
    case 'delete':
      result = await manager.delete(args.id);
      break;
    case 'search':
      result = await manager.search(args.query, args.tags, args.top_k);
      break;
    case 'list':
      result = await manager.list(args.location);
      break;
    case 'stats':
      result = await manager.stats();
      break;
    case 'restore':
      result = await manager.restore(args.id);
      break;
    case 'record_experience':
      result = await expManager.record(args.content, args.category, args.applicability, args.source);
      break;
    case 'get_experiences':
      result = await expManager.list(args.category, args.verified);
      break;
    case 'verify_experience':
      result = await expManager.verify(args.id, args.effective);
      break;
    default:
      console.error('Unknown action:', action);
      process.exit(1);
  }
  
  console.log(JSON.stringify(result, null, 2));
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

#!/usr/bin/env node
import { MemoryPalaceManager } from '../dist/src/manager.js';
import { createTimeReasoning } from '../dist/src/background/time-reasoning.js';
import { defaultSummarizer } from '../dist/src/llm/summarizer.js';
import { createLocalVectorSearch, type LocalVectorSearchConfig } from '../dist/src/background/vector-search.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse CLI arguments
const cliArgs = process.argv.slice(2);
let dbPath = null;

// Look for --db-path in arguments
for (let i = 0; i < cliArgs.length; i++) {
  if (cliArgs[i] === '--db-path' && i + 1 < cliArgs.length) {
    dbPath = cliArgs[i + 1];
    break;
  }
}

// Workspace path from env or default
const workspacePath = process.env.OPENCLAW_WORKSPACE || process.env.HOME + '/.openclaw/workspace';
const memoryPath = join(workspacePath, 'memory', 'palace');

// Create vector search provider with dbPath if provided
let vectorSearch = null;
if (dbPath) {
  const vectorConfig = { dbPath } satisfies LocalVectorSearchConfig;
  vectorSearch = createLocalVectorSearch(vectorConfig);
  console.error('[memory-palace] Using custom db-path:', dbPath);
}

const manager = new MemoryPalaceManager({ 
  workspaceDir: memoryPath,
  vectorSearch 
});
const timeReasoning = createTimeReasoning();
const summarizer = defaultSummarizer;

const action = process.argv[2];
const args = JSON.parse(process.argv[3] || '{}');

async function main() {
  let result;
  
  switch (action) {
    // ========== 基础操作 ==========
    case 'write':
      result = await manager.store({
        content: args.content,
        location: args.location,
        tags: args.tags,
        importance: args.importance,
        type: args.type
      });
      break;
      
    case 'get':
      // 支持对象风格: { id } 或旧版: id 字符串
      result = await manager.get(args.id);
      break;
      
    case 'update':
      result = await manager.update({
        id: args.id,
        content: args.content,
        tags: args.tags,
        importance: args.importance,
        summary: args.summary
      });
      break;
      
    case 'delete':
      result = await manager.delete(args.id, args.permanent);
      break;
      
    case 'search':
      // 支持对象风格 { query, ...options }
      result = await manager.recall({
        query: args.query,
        tags: args.tags,
        topK: args.topK || args.top_k,
        location: args.location
      });
      break;
      
    case 'list':
      result = await manager.list({
        location: args.location,
        tags: args.tags,
        status: args.status,
        limit: args.limit
      });
      break;
      
    case 'stats':
      result = await manager.stats();
      break;
      
    case 'restore':
      result = await manager.restore(args.id);
      break;

    // ========== 经验管理 ==========
    case 'record_experience':
      // 命令格式: record_experience <content> <applicability> <source> [category]
      // 或者通过 args: { content, applicability, source, category }
      result = await manager.recordExperience({
        content: args.content,
        applicability: args.applicability,
        source: args.source,
        category: args.category,
        tags: args.tags
      });
      break;
      
    case 'get_experiences':
      // 命令格式: get_experiences [--category] [--verified]
      result = await manager.getExperiences({
        category: args.category,
        verified: args.verified,
        limit: args.limit || 10,
        sortByVerified: args.sortByVerified
      });
      break;
      
    case 'verify_experience':
      // 命令格式: verify_experience <id> <effective>
      result = await manager.verifyExperience({
        id: args.id,
        effective: args.effective
      });
      break;
      
    case 'get_relevant_experiences':
      // 支持对象风格 { context, limit }
      result = await manager.getRelevantExperiences({
        context: args.context,
        limit: args.limit || 5
      });
      break;
      
    case 'experience_stats':
      result = await manager.getExperienceStats();
      break;

    // ========== LLM 增强功能 ==========
    case 'summarize':
      // 命令格式: summarize <id>
      const mem = await manager.get(args.id);
      if (!mem) {
        throw new Error(`Memory not found: ${args.id}`);
      }
      const summaryResult = await summarizer.summarize(mem.content);
      result = summaryResult.success ? summaryResult.data : { error: summaryResult.error };
      break;
      
    case 'parse_time':
      // 命令格式: parse_time <expression>
      // 使用规则引擎解析时间
      const timeContext = timeReasoning.parseTimeQuery(args.expression);
      result = {
        hasTimeReasoning: timeContext.hasTimeReasoning,
        keywords: timeContext.keywords,
        resolvedDate: timeContext.resolvedDate,
        expression: args.expression
      };
      break;
      
    default:
      console.error('Unknown action:', action);
      console.error('Available actions:');
      console.error('  - write, get, update, delete, search, list, stats, restore');
      console.error('  - record_experience, get_experiences, verify_experience, get_relevant_experiences, experience_stats');
      console.error('  - summarize, parse_time');
      process.exit(1);
  }
  
  console.log(JSON.stringify(result, null, 2));
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
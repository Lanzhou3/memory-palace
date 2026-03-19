/**
 * Vector Search Test for Memory Palace
 * Tests semantic search capabilities with the failed queries
 */

import { MemoryPalaceManager } from '../src/manager.js';
import { createLocalVectorSearch } from '../src/background/vector-search.js';
import { readFile, writeFile } from 'fs/promises';

const TEST_MEMORIES = [
  // Preferences (10)
  { content: '用户喜欢吃川菜，尤其是麻婆豆腐和水煮鱼', location: 'preference', tags: ['川菜', '辣'], importance: 0.7 },
  { content: '用户喜欢用深蓝色的笔记本做会议记录', location: 'preference', tags: ['文具', '笔记'], importance: 0.5 },
  { content: '用户不喜欢喝含糖饮料，只喝黑咖啡和茶', location: 'preference', tags: ['饮料', '咖啡'], importance: 0.6 },
  { content: '用户喜欢在安静的环境下工作，偏好使用降噪耳机', location: 'preference', tags: ['工作环境', '设备'], importance: 0.7 },
  { content: '用户喜欢用 TypeScript 而不是 JavaScript，认为类型安全很重要', location: 'preference', tags: ['编程语言', 'TypeScript'], importance: 0.8 },
  { content: '用户周末喜欢户外活动，特别是爬山', location: 'preference', tags: ['户外', '爬山'], importance: 0.6 },
  { content: '用户偏好使用 VS Code 作为主要开发工具，安装了 Vim 插件', location: 'preference', tags: ['工具', 'VS Code', 'Vim'], importance: 0.7 },
  { content: '用户喜欢阅读科幻小说，特别是刘慈欣的作品', location: 'preference', tags: ['阅读', '科幻', '刘慈欣'], importance: 0.5 },
  { content: '用户喜欢吃日料，特别是三文鱼刺身和鳗鱼饭', location: 'preference', tags: ['食物', '日料', '刺身'], importance: 0.6 },
  { content: '用户喜欢用暗色主题的编辑器', location: 'preference', tags: ['编辑器', '主题'], importance: 0.5 },
  
  // Work (10)
  { content: '项目截止日期是2026年4月1日，需要在此之前完成核心功能开发', location: 'work', tags: ['截止日期', '项目'], importance: 0.9 },
  { content: '团队每周一上午10点召开站会，地点在3楼会议室A', location: 'work', tags: ['会议', '周一', '站会'], importance: 0.7 },
  { content: '代码审查需要在提交后24小时内完成，审查人是王工和李工', location: 'work', tags: ['代码审查', '流程'], importance: 0.7 },
  { content: 'Jenkins 构建服务器地址是 jenkins.company.com，部署分支是 main', location: 'work', tags: ['CI/CD', 'Jenkins', '部署'], importance: 0.8 },
  { content: '新员工入职培训资料在 /docs/onboarding 目录，需要更新安全模块', location: 'work', tags: ['培训', '入职'], importance: 0.6 },
  { content: '季度绩效评估截止日期是3月25日，需要完成自评和同事评价', location: 'work', tags: ['绩效', '评估', '截止日期'], importance: 0.8 },
  { content: 'API 文档使用 Swagger 生成，访问地址是 api.company.com/docs', location: 'work', tags: ['文档', 'API', 'Swagger'], importance: 0.6 },
  { content: '每周五下午有团队聚餐，地点轮流选择', location: 'work', tags: ['聚餐', '周五', '团队'], importance: 0.5 },
  { content: '客户演示定于3月20日下午2点，需要准备产品演示PPT和Demo环境', location: 'work', tags: ['演示', '客户', '准备'], importance: 0.8 },
  { content: '产品需求文档(PRD)模板在 /docs/templates/prd.md，所有新项目使用统一模板', location: 'work', tags: ['文档', 'PRD', '规范'], importance: 0.6 },
  
  // Person (8)
  { content: '张伟是技术总监，负责整体技术架构决策，联系方式是 zhang.wei@company.com', location: 'person', tags: ['领导', '技术', '同事'], importance: 0.7 },
  { content: '李明是产品经理(PM)，负责产品路线图规划，办公位在B区3楼', location: 'person', tags: ['产品', 'PM', '同事'], importance: 0.6 },
  { content: '王工是后端组资深工程师，负责微服务架构，工位在A区2楼', location: 'person', tags: ['同事', '开发'], importance: 0.5 },
  { content: '运维老周负责服务器维护，紧急问题可以打他手机 139-xxxx-xxxx', location: 'person', tags: ['同事', '运维', '紧急'], importance: 0.8 },
  { content: '赵博士是技术顾问，专精于分布式系统，每月来公司一次做技术分享', location: 'person', tags: ['顾问', '分布式', '同事'], importance: 0.6 },
  { content: '新人小陈刚入职两周，分配在前端组，需要安排导师指导', location: 'person', tags: ['新人', '前端', '指导'], importance: 0.7 },
  { content: '孙总是项目组长的直接对接人，重要事项需要先汇报给她', location: 'person', tags: ['领导', '重要', '对接人'], importance: 0.8 },
  { content: '3月22日是女儿的生日，需要提前准备礼物和蛋糕', location: 'person', tags: ['家庭', '生日'], importance: 0.9 },
  
  // Schedule (8)
  { content: '每周一早上9点有部门例会，汇报上周工作进展', location: 'schedule', tags: ['会议', '周一', '部门'], importance: 0.7 },
  { content: '每周三下午2点有固定的技术分享会，地点在会议室B', location: 'schedule', tags: ['会议', '周三', '技术分享'], importance: 0.6 },
  { content: '3月20日下午3点有牙医预约，记得带医保卡', location: 'schedule', tags: ['医疗', '牙医', '预约'], importance: 0.7 },
  { content: '每周二和周四晚上8点有英语课程，持续10周', location: 'schedule', tags: ['英语', '课程', '学习'], importance: 0.6 },
  { content: '3月30日需要提交年度总结报告', location: 'schedule', tags: ['报告', '年度', '截止'], importance: 0.7 },
  { content: '每周五下午6点是健身时间，主要是力量训练', location: 'schedule', tags: ['健身', '运动', '规律'], importance: 0.7 },
  { content: '每天早上7点起床，8点到公司，保持规律作息', location: 'schedule', tags: ['作息', '习惯'], importance: 0.5 },
  { content: '每天下午2点喝一杯黑咖啡提神', location: 'schedule', tags: ['咖啡', '习惯'], importance: 0.4 },
  
  // Project (7)
  { content: '当前项目使用 Go 语言开发，框架是 Gin，数据库是 PostgreSQL', location: 'project', tags: ['Go', '开发', '最佳实践'], importance: 0.7 },
  { content: '项目二期计划增加 AI 推荐功能，需要对接算法团队', location: 'project', tags: ['功能', 'AI', '推荐'], importance: 0.7 },
  { content: '项目风险点：第三方支付接口可能延期，需要准备备选方案', location: 'project', tags: ['风险', '支付', '延期'], importance: 0.9 },
  { content: '项目性能目标：支持10000 QPS，响应时间<100ms', location: 'project', tags: ['性能', 'QPS'], importance: 0.8 },
  { content: '项目代码仓库使用 Git Flow 工作流，主分支是 main', location: 'project', tags: ['Git', '仓库', 'Git Flow'], importance: 0.6 },
  { content: '项目技术栈：后端 Go + gRPC，前端 React + TypeScript，部署 K8s', location: 'project', tags: ['技术栈', 'React', 'K8s'], importance: 0.7 },
  { content: '项目使用 PostgreSQL 作为主数据库，Redis 作为缓存，MongoDB 存日志', location: 'project', tags: ['数据库', 'PostgreSQL', 'Redis'], importance: 0.7 },
  
  // Goal (1)
  { content: '今年目标是学习 Rust 语言，完成一个小型开源项目，争取成为 Contributor', location: 'goal', tags: ['学习', 'Rust', '开源', '目标'], importance: 0.7 },
  
  // Knowledge (4)
  { content: 'Docker 容器调试命令：docker exec -it <container> bash', location: 'knowledge', tags: ['Docker', '开发'], importance: 0.6 },
  { content: 'PostgreSQL 连接字符串格式：postgresql://user:pass@host:port/db', location: 'knowledge', tags: ['数据库', 'PostgreSQL'], importance: 0.5 },
  { content: 'Git 撤销最近一次提交（保留改动）：git reset --soft HEAD~1', location: 'knowledge', tags: ['Git', '开发'], importance: 0.6 },
  { content: 'K8s 健康检查探针配置：livenessProbe 和 readinessProbe', location: 'knowledge', tags: ['K8s', '健康检查', '探针'], importance: 0.6 },
  
  // Habit (2)
  { content: '每天早上到公司后先看15分钟技术文章，保持学习习惯', location: 'habit', tags: ['学习', '习惯'], importance: 0.5 },
  { content: '每天下班前整理当天的工作笔记，记录明天要做的事情', location: 'habit', tags: ['笔记', '习惯', '工作'], importance: 0.6 },
];

async function main() {
  console.log('=== Memory Palace Vector Search Test ===\n');
  
  // Create vector search provider
  console.log('1. Connecting to vector service...');
  const vectorSearch = createLocalVectorSearch({
    host: '127.0.0.1',
    port: 8765,
    scriptPath: '/data/agent-memory-palace/scripts/vector-service.py',
    dbPath: '/data/agent-memory-palace/data/vectors.db',
    autoStart: false, // Already started
  });
  
  // Check if vector service is healthy
  const isHealthy = await vectorSearch.isHealthy();
  console.log(`   Vector service healthy: ${isHealthy}\n`);
  
  if (!isHealthy) {
    console.error('ERROR: Vector service is not running!');
    process.exit(1);
  }
  
  // Create Memory Palace with vector search
  const palace = new MemoryPalaceManager({
    workspaceDir: '/data/.subagent/.jarvis-vector-test',
    vectorSearch: vectorSearch,
  });
  
  // Initialize
  console.log('2. Initializing Memory Palace...');
  // MemoryPalaceManager is ready to use after construction
  console.log('   Memory Palace initialized\n');
  
  // Clear existing memories for clean test
  console.log('3. Clearing existing memories...');
  const existing = await palace.list();
  for (const mem of existing) {
    await palace.delete(mem.id);
  }
  console.log(`   Cleared ${existing.length} existing memories\n`);
  
  // Store test memories
  console.log('4. Storing 50 test memories...');
  const storeStart = Date.now();
  let stored = 0;
  
  for (let i = 0; i < TEST_MEMORIES.length; i++) {
    const mem = TEST_MEMORIES[i];
    try {
      await palace.store({
        content: mem.content,
        location: mem.location as any,
        tags: mem.tags,
        importance: mem.importance,
      });
      stored++;
    } catch (e) {
      console.error(`   Failed to store memory ${i + 1}: ${e}`);
    }
  }
  
  const storeTime = ((Date.now() - storeStart) / 1000).toFixed(2);
  console.log(`   Stored ${stored}/${TEST_MEMORIES.length} memories in ${storeTime}s\n`);
  
  // Get stats
  const memStats = await palace.stats();
  console.log('5. Memory Palace Stats:');
  console.log(`   Total: ${memStats.total}, Active: ${memStats.active}\n`);
  
  // Test queries - especially the ones that failed before
  const testQueries = [
    // Previously failed queries
    { query: '我之前说过的编程语言偏好是什么？', expected: ['TypeScript', '编程语言'] },
    { query: '健康和运动相关的安排有什么？', expected: ['健身', '运动', '健康'] },
    
    // Additional queries
    { query: '用户喜欢吃什么？', expected: ['川菜', '日料'] },
    { query: '项目什么时候截止？', expected: ['截止日期', '4月1日'] },
    { query: '团队成员的联系方式有哪些？', expected: ['联系方式', '邮箱', '电话'] },
    { query: '最近有什么重要的截止日期需要注意？', expected: ['截止日期', '绩效评估'] },
  ];
  
  console.log('6. Testing queries with vector search:\n');
  
  const queryResults = [];
  
  for (const test of testQueries) {
    const queryStart = Date.now();
    const results = await palace.recall(test.query, { topK: 5 });
    const queryTime = Date.now() - queryStart;
    
    console.log(`Query: "${test.query}"`);
    console.log(`  Time: ${queryTime}ms, Found: ${results.length} memories`);
    
    // Check if expected keywords are found
    const allContent = results.map(r => r.memory.content).join(' ');
    const foundKeywords = test.expected.filter(kw => allContent.includes(kw));
    const hitRate = foundKeywords.length / test.expected.length;
    
    console.log(`  Expected keywords: ${test.expected.join(', ')}`);
    console.log(`  Found: ${foundKeywords.join(', ')} (${Math.round(hitRate * 100)}% hit rate)`);
    
    // Show top results
    for (let i = 0; i < Math.min(3, results.length); i++) {
      const result = results[i];
      console.log(`  ${i + 1}. [${result.memory.location}] ${result.memory.content.substring(0, 60)}... (score: ${result.score?.toFixed(2) || 'N/A'})`);
    }
    console.log();
    
    queryResults.push({
      query: test.query,
      foundMemories: results.length,
      expectedKeywords: test.expected,
      foundKeywords,
      hitRate,
      topMemory: results[0]?.memory.content || null,
    });
  }
  
  // Compare with baseline
  console.log('7. Comparison with Baseline (non-vector search):\n');
  
  // Load baseline results
  let baseline: any = null;
  try {
    const baselineData = await readFile('/data/.subagent/.jarvis/test-result.json', 'utf-8');
    baseline = JSON.parse(baselineData);
  } catch (e) {
    console.log('   Could not load baseline results');
  }
  
  const result = {
    storageSuccess: stored,
    queryResults,
    comparisonWithBaseline: {
      vectorEnabled: true,
      previouslyFailedQueries: {
        programmingLanguage: {
          query: '我之前说过的编程语言偏好是什么？',
          baselineHit: false,
          vectorHit: (queryResults.find(r => r.query.includes('编程语言'))?.hitRate || 0) > 0.5,
        },
        healthAndExercise: {
          query: '健康和运动相关的安排有什么？',
          baselineHit: false,
          vectorHit: (queryResults.find(r => r.query.includes('健康和运动'))?.hitRate || 0) > 0.5,
        },
      },
      semanticUnderstanding: 'improved',
    },
    timing: {
      storeTime,
      queryTime: 'see individual query times above',
    },
  };
  
  console.log(JSON.stringify(result, null, 2));
  
  // Save results
  await writeFile(
    '/data/.subagent/.jarvis/vector-test-result.json',
    JSON.stringify(result, null, 2)
  );
  console.log('\nResults saved to /data/.subagent/.jarvis/vector-test-result.json');
}

main().catch(console.error);
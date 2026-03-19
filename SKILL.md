---
name: memory-palace
description: Cognitive enhancement layer for OpenClaw agents with semantic search, time reasoning, knowledge graphs, experience accumulation, and LLM-enhanced features
version: 1.3.6
license: MIT
allowed-tools: Bash(npx memory-palace:*)
references:
  - tools: references/tools.md
  - examples: references/examples.md
---

# Memory Palace

为 AI Agent 提供持久化记忆管理，支持语义搜索、时间推理、经验积累。

## ⚠️ 首次使用 - 向量模型安装

语义搜索功能依赖 **BGE-small-zh-v1.5** 向量模型（约 100MB）。

**安装脚本**:
```bash
cd /path/to/memory-palace
bash scripts/install-vector-dependencies.sh
```

**AI 必须检查**:
1. 首次使用搜索功能时，检查模型是否存在
2. 如用户反馈搜索不到相关内容，优先检查向量模型是否安装
3. 未安装时提示用户安装，或主动帮用户执行安装脚本

**无向量时**: 自动降级到纯文本关键词匹配，命中率下降

## 工具列表

### 基础操作

| 工具 | 功能 | 必填参数 |
|------|------|----------|
| `memory_palace_write` | 写入记忆 | content |
| `memory_palace_get` | 获取记忆 | id |
| `memory_palace_update` | 更新记忆 | id |
| `memory_palace_delete` | 删除记忆 | id |
| `memory_palace_search` | 搜索记忆 | query |
| `memory_palace_list` | 列出记忆 | - |
| `memory_palace_stats` | 统计信息 | - |
| `memory_palace_restore` | 恢复记忆 | id |

### 经验管理

| 工具 | 功能 | 必填参数 |
|------|------|----------|
| `memory_palace_record_experience` | 记录经验 | content, applicability, source |
| `memory_palace_get_experiences` | 获取经验 | - |
| `memory_palace_verify_experience` | 验证经验 | id, effective |
| `memory_palace_get_relevant_experiences` | 相关经验 | context |

### LLM 增强

| 工具 | 功能 | 必填参数 | 超时 |
|------|------|----------|------|
| `memory_palace_summarize` | 智能总结 | id | 60s |
| `memory_palace_extract_experience` | 提取经验 | - | 60s |
| `memory_palace_parse_time_llm` | 时间解析 | expression | 10s |
| `memory_palace_expand_concepts_llm` | 概念扩展 | query | 15s |
| `memory_palace_compress` | 智能压缩 | memory_ids | 60s |

### 辅助工具

| 工具 | 功能 | 必填参数 |
|------|------|----------|
| `memory_palace_time_parse` | 规则时间解析 | query |
| `memory_palace_concept_expand` | 规则概念扩展 | query |

## 详细文档

- [工具详细参数](./references/tools.md)
- [使用示例](./references/examples.md)

## 注意事项

1. **LLM 工具超时**: 智能总结、经验提取等 LLM 工具有超时限制，失败会自动降级到规则引擎
2. **经验验证**: 经验需要多次验证才能标记为有效，避免错误经验传播
3. **重要性**: 建议给重要记忆设置较高的 importance 值（0.7+）
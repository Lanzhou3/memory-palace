---
name: "memory-palace"
description: "Cognitive enhancement layer for OpenClaw agents with semantic search, time reasoning, knowledge graphs, and experience accumulation"
allowed-tools: Bash(npx memory-palace:*)
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
| `memory_palace_parse_time` | 时间表达式解析 | expression | 10s |
| `memory_palace_extract_experience` | 从记忆提取经验 | - | 60s |
| `memory_palace_expand_concepts` | LLM扩展搜索概念 | query | 15s |
| `memory_palace_compress` | 智能压缩记忆 | memory_ids | 60s |

### 经验统计

| 工具 | 功能 | 必填参数 |
|------|------|----------|
| `memory_palace_experience_stats` | 经验统计 | - |

---

## 工具详情

### memory_palace_write

写入一条新记忆。

**参数**:
- `content` (必填): 记忆内容
- `location` (可选): 存储位置，默认 "default"
- `tags` (可选): 标签数组
- `importance` (可选): 重要性 0-1，默认 0.5
- `type` (可选): 类型 fact/experience/lesson/preference/decision

**示例**:
```json
{
  "content": "用户偏好深色模式",
  "location": "preferences",
  "tags": ["ui", "偏好"],
  "importance": 0.8
}
```

---

### memory_palace_search

搜索记忆。

**参数**:
- `query` (必填): 搜索关键词
- `tags` (可选): 标签过滤
- `topK` (可选): 返回数量，默认 10

**示例**:
```json
{
  "query": "用户偏好",
  "tags": ["偏好"],
  "topK": 5
}
```

---

### memory_palace_record_experience

记录一条可复用的经验。

**参数**:
- `content` (必填): 经验内容
- `category` (可选): 类别 development/operations/product/communication/general
- `applicability` (必填): 适用场景描述
- `source` (必填): 来源标识

**示例**:
```json
{
  "content": "TypeScript 的 as const 可以让类型推断更精确",
  "category": "development",
  "applicability": "需要精确类型推断的场景",
  "source": "task-123"
}
```

---

### memory_palace_verify_experience

验证经验是否有效。

**参数**:
- `id` (必填): 经验ID
- `effective` (必填): 是否有效

**说明**: 经验需要 2+ 次正面验证才标记为已验证。

---

### memory_palace_parse_time

解析时间表达式（规则引擎）。

**参数**:
- `expression` (必填): 时间表达式

**支持**: "下周三"、"明天"、"上周五" 等时间表达

**返回**: `{ hasTimeReasoning, keywords, resolvedDate, expression }`

---

### memory_palace_summarize

LLM 智能总结记忆。

**参数**:
- `id` (必填): 记忆ID
- `save_summary` (可选): 是否保存到记忆，默认 true

**返回**: `{ summary, keyPoints, importance, suggestedTags, category }`

---

### memory_palace_extract_experience

从记忆内容中提取可复用的经验和教训。

**参数**:
- `memory_ids` (可选): 记忆ID数组，默认处理所有记忆
- `category` (可选): 筛选特定类别的记忆

**返回**:
```json
{
  "experiences": [
    {
      "content": "经验内容",
      "category": "development",
      "applicability": "适用场景",
      "lessons": ["教训1", "教训2"],
      "bestPractices": ["最佳实践1"],
      "sourceMemoryId": "记忆ID"
    }
  ],
  "count": 3
}
```

---

### memory_palace_expand_concepts

使用 LLM 动态扩展搜索概念，提升搜索的语义理解能力。

**参数**:
- `query` (必填): 搜索词
- `mode` (可选): "search" / "general"，默认 "search"

**返回**:
```json
{
  "originalQuery": "用户偏好",
  "expandedKeywords": ["用户偏好", "设置", "配置", "选项"],
  "relatedConcepts": ["UI设置", "主题配置", "个性化"],
  "domains": ["preferences", "settings"]
}
```

---

### memory_palace_compress

智能压缩多条记忆，保留关键信息。

**参数**:
- `memory_ids` (必填): 记忆ID数组（至少2条）

**返回**:
```json
{
  "compressedMemories": [
    {
      "id": "记忆ID",
      "compressedContent": "压缩后的内容摘要",
      "preservedKeyInfo": ["关键信息1", "关键信息2"],
      "compressionRatio": 0.45
    }
  ],
  "totalOriginalChars": 5000,
  "totalCompressedChars": 2250
}
```

---

### memory_palace_experience_stats

获取经验统计信息。

**返回**: `{ total, verified, unverified, byCategory: {...}, recent }`

---

## 使用场景

### 1. 记住用户偏好
```
memory_palace_write: { content: "用户喜欢简洁的回复", tags: ["偏好"], importance: 0.8 }
```

### 2. 记录开发经验
```
memory_palace_record_experience: { 
  content: "OpenClaw 配置文件支持 JSON5 格式",
  category: "development",
  applicability: "读取 OpenClaw 配置时",
  source: "memory-palace-dev"
}
```

### 3. 查找相关经验
```
memory_palace_get_relevant_experiences: { context: "需要解析用户配置文件" }
```

### 4. 智能总结长记忆
```
memory_palace_summarize: { id: "memory-id" }
```

---

## 注意事项

1. **向量模型安装**: 首次使用搜索功能前需安装 BGE-small-zh-v1.5 模型，未安装时自动降级到纯文本关键词匹配
2. **经验验证**: 经验需要多次验证才能标记为有效，避免错误经验传播
3. **重要性**: 建议给重要记忆设置较高的 importance 值（0.7+）


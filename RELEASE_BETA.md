# Memory Palace v1.4.0-beta.1 发布说明

> 发布日期: 2026-03-20

---

## 🎉 版本亮点

### 统一 API 参数风格
所有方法现在支持 **`{ param, options? }`** 对象风格，同时保持向后兼容：

- `get(id)` → `get({ id })` 
- `recall(query, options)` → `recall({ query, ...options })`
- `update(id, content, ...)` → `update({ id, content, ... })`
- `getRelevantExperiences(context, limit)` → `getRelevantExperiences({ context, limit })`

### CLI 命令增强
- `get_relevant_experiences` - 获取相关经验
- `experience_stats` - 经验统计  
- `summarize` - 智能总结记忆
- `parse_time` - 规则时间解析
- `get` 命令支持对象风格参数

### 验证结果增强
- `verifyExperience` 返回值增加 `verified`, `verifiedCount`, `verifiedAt` 快捷字段
- 新增 `VerifiedExperienceResult` 类型定义

---

## 🔧 修复内容清单

### 本版本修复 (v1.4.0)
- API 类型定义与实际实现对齐
- SKILL.md 文档更新以反映新 API 风格
- 简化 CLI 代码，使用更清晰的 API 调用方式

### 用户反馈紧急修复 (v1.3.4)
- **CLI API 调用错误**: 修复 `MemoryPalaceManager` 构造函数调用方式
- **CLI ExperienceManager**: 移除错误的直接实例化，改用 manager 方法
- **参数映射**: 修复 `top_k` 到 `topK` 的转换问题
- **经验分类筛选**: 修复严格相等导致 category 筛选失效
- **向量搜索降级**: 增加 `isFallback` 字段和警告输出
- **数据库错误处理**: 添加 `--db-path` 参数和权限检查
- **Stats 增强**: 返回 `vectorSearch` 状态信息

### v1.3.7 修复
- update 命令返回 null 问题
- 经验记录的 content 字段保存问题
- verify_experience 测试失败问题

---

## ⚠️ 已知问题

- 向量搜索依赖外部模型，首次使用需下载
- 大规模记忆数据可能出现性能瓶颈（后续版本优化）

---

## 🧪 测试反馈渠道

欢迎测试并反馈问题！

### 反馈方式
1. **GitHub Issues**: https://github.com/Lanzhou3/memory-palace/issues
2. **混沌团队内群**: 直接联系团队成员

### 测试要点
- 新 API 对象风格参数是否正常工作
- 向量搜索降级是否正常
- CLI 命令是否按预期执行
- 与 OpenClaw 集成是否顺畅

---

## 📦 安装方式

```bash
# 使用 pnpm
pnpm add @openclaw/memory-palace

# 或使用 npm  
npm install @openclaw/memory-palace
```

### Beta 版本安装
```bash
npm install @openclaw/memory-palace@beta
# 或
pnpm add @openclaw/memory-palace@beta
```

---

## 🔄 升级建议

建议所有用户升级到此版本，特别是：
- 使用 CLI 工具的用户
- 需要新 API 风格的项目
- 遇到 v1.3.x 版本问题的用户

---

**感谢测试和反馈！** 🔥

*Built with passion by the Chaos Team*
# OpenClaw Integration Guide

This guide explains how to integrate Memory Palace with OpenClaw agents for enhanced memory management.

## Overview

Memory Palace is designed as an OpenClaw Skill that provides persistent, semantically searchable memory for AI agents. It integrates seamlessly with OpenClaw's existing memory systems.

## Configuration

### Add to OpenClaw Workspace

Add Memory Palace to your OpenClaw configuration:

```json
{
  "skills": [
    {
      "name": "memory-palace",
      "path": "/path/to/memory-palace"
    }
  ]
}
```

Or install via ClawHub:

```bash
clawhub install memory-palace
```

### Workspace Directory

Memory Palace stores memories in your OpenClaw workspace:

```
workspace/
├── AGENTS.md
├── MEMORY.md
├── memory/
│   ├── YYYY-MM-DD.md    # Daily notes (OpenClaw default)
│   └── palace/           # Memory Palace storage
│       ├── uuid-1.md
│       ├── uuid-2.md
│       └── .trash/
```

## Integration with AGENTS.md

Memory Palace complements OpenClaw's AGENTS.md system:

### AGENTS.md (Short-term Context)

AGENTS.md defines the agent's identity and current focus. It's loaded at session start.

```markdown
# AGENTS.md - Your Assistant

## Current Focus
- Working on Memory Palace documentation
- Reviewing integration patterns

## Recent Decisions
- Using semantic search for better recall
```

### Memory Palace (Long-term Storage)

Memory Palace stores persistent memories that persist across sessions:

```typescript
// Store a long-term memory
await memoryPalace.store({
  content: 'User prefers concise responses without unnecessary explanations',
  tags: ['preferences', 'communication'],
  importance: 0.8,
  location: 'user-preferences'
});
```

## Integration with MEMORY.md

OpenClaw's MEMORY.md stores curated long-term memories. Memory Palace can enhance this:

### Before (MEMORY.md only)

```markdown
# MEMORY.md

## User Preferences
- Prefers dark mode
- Uses TypeScript for all projects
- Lives in Asia/Shanghai timezone

## Projects
- Memory Palace: A cognitive enhancement layer
- Chaos Team: Multi-agent system
```

### After (MEMORY.md + Memory Palace)

The agent can now:

1. **Recall semantically** - Find memories by meaning, not just keywords
2. **Track importance** - Prioritize critical information
3. **Detect conflicts** - Identify contradictory memories
4. **Compress old data** - Archive less relevant memories

```typescript
// Search for user preferences semantically
const results = await memoryPalace.recall('what does the user like for coding?', {
  tags: ['preferences'],
  top_k: 5
});

// Results will include relevant preferences even if exact words don't match
```

## Usage Examples

### Example 1: Storing User Preferences

**User says:** "I really like using VS Code with the Vim extension for all my coding."

**Agent action:**
```typescript
await memoryPalace.store({
  content: 'User prefers VS Code with Vim extension for coding',
  tags: ['preferences', 'editor', 'coding'],
  importance: 0.7,
  location: 'user-preferences',
  source: 'conversation'
});
```

**Future recall:**
```typescript
const results = await memoryPalace.recall('user editor preference');
// Returns the stored memory about VS Code + Vim
```

### Example 2: Project Context

**User says:** "I'm starting a new project called TaskFlow, it's a task management app using React and Node.js."

**Agent action:**
```typescript
await memoryPalace.store({
  content: 'TaskFlow: New task management project. Stack: React + Node.js. User is project owner.',
  tags: ['project', 'TaskFlow', 'React', 'Node.js'],
  importance: 0.8,
  location: 'projects/TaskFlow',
  source: 'conversation'
});
```

**Later in conversation:**
```typescript
const results = await memoryPalace.recall('TaskFlow tech stack', {
  location: 'projects'
});
// Returns the project context
```

### Example 3: Time-Based Reasoning

**User asks:** "What do I have scheduled for next week?"

**Agent action:**
```typescript
// Use time reasoning to expand the query
const timeContext = timeEngine.parseTimeQuery('next week schedule');
// timeContext.timeRange = { start: Date, end: Date }
// timeContext.keywords = ['3月24日-3月30日', '周一', '周二', ...]

// Search with expanded time context
const results = await memoryPalace.recall(
  timeContext.keywords.join(' '),
  { top_k: 10 }
);
```

### Example 4: Concept Expansion

**User asks:** "Tell me about my health stuff"

**Agent action:**
```typescript
// Expand "health" concept
const expansion = await conceptExpander.expandQuery('health');
// expansion.expandedKeywords = ['健康', '医疗', '医院', '医生', '体检', ...]

// Search with expanded concepts
const results = await memoryPalace.recall(
  expansion.expandedKeywords.join(' '),
  { tags: ['health'] }
);
```

### Example 5: Conflict Detection

Detect contradictions in stored memories:

```typescript
import { ConflictDetector } from '@openclaw/memory-palace';

const detector = new ConflictDetector();
const memories = await memoryPalace.list({ limit: 100 });
const conflicts = await detector.detect(memories);

if (conflicts.length > 0) {
  console.log('Found conflicting memories:');
  conflicts.forEach(c => {
    console.log(`- ${c.type}: ${c.description}`);
    console.log(`  Memory 1: ${c.memory1.id}`);
    console.log(`  Memory 2: ${c.memory2.id}`);
  });
}
```

## Conversation Flow Examples

### Scenario: User Returns After a Week

**User:** "What were we working on last time?"

**Agent's Memory Palace query:**
```typescript
// Find recent project-related memories
const recentWork = await memoryPalace.list({
  tags: ['project'],
  sort_by: 'updatedAt',
  sort_order: 'desc',
  limit: 5
});

// Search for 'last time' context
const context = await memoryPalace.recall('last time working on', {
  top_k: 3
});
```

**Agent response:** "Last time, we were working on Memory Palace documentation. We had just finished the API reference section and were about to start on the integration examples."

### Scenario: User Mentions a Preference

**User:** "Actually, I think I mentioned this before, but I really don't like receiving notifications after 10 PM."

**Agent's Memory Palace action:**
```typescript
// First, search for existing notification preferences
const existing = await memoryPalace.recall('notification preference', {
  tags: ['preferences']
});

if (existing.length > 0) {
  // Update existing memory
  await memoryPalace.update({
    id: existing[0].memory.id,
    content: 'User does not want notifications after 10 PM',
    append_tags: ['quiet-hours', 'notifications']
  });
} else {
  // Store new memory
  await memoryPalace.store({
    content: 'User does not want notifications after 10 PM',
    tags: ['preferences', 'notifications', 'quiet-hours'],
    importance: 0.8,
    location: 'user-preferences'
  });
}
```

### Scenario: Multi-Session Project Tracking

**Session 1:**
```typescript
await memoryPalace.store({
  content: 'Started ProjectX architecture design. Decided on microservices.',
  tags: ['ProjectX', 'architecture', 'decision'],
  importance: 0.9,
  location: 'projects/ProjectX'
});
```

**Session 2 (a week later):**
```typescript
const projectState = await memoryPalace.recall('ProjectX architecture', {
  location: 'projects/ProjectX'
});

// Agent remembers: "Last session we decided on microservices for ProjectX"
```

## Best Practices

### 1. Use Consistent Tags

Choose a tag taxonomy and stick to it:

```typescript
// Good: Consistent tag structure
tags: ['preferences', 'editor', 'vscode']
tags: ['preferences', 'theme', 'dark-mode']
tags: ['project', 'TaskFlow', 'decision']

// Avoid: Inconsistent tags
tags: ['pref', 'editor']  // Different from 'preferences'
tags: ['Project']         // Missing project name
```

### 2. Set Appropriate Importance

Use importance scores to prioritize:

| Score | Use Case |
|-------|----------|
| 0.9+ | Critical: User name, core preferences, key decisions |
| 0.7-0.8 | Important: Project details, regular preferences |
| 0.5-0.6 | Normal: General information, notes |
| 0.3-0.4 | Low: Temporary details, minor updates |
| 0.0-0.2 | Archive: Old, potentially outdated info |

### 3. Use Locations for Organization

Organize memories by location:

```typescript
// Project-specific memories
location: 'projects/TaskFlow'
location: 'projects/MemoryPalace'

// User preferences
location: 'user-preferences'

// Workflows and processes
location: 'workflows/daily-standup'
```

### 4. Include Source Information

Track where memories come from:

```typescript
source: 'conversation'  // Direct user conversation
source: 'document'      // Parsed from a document
source: 'system'        // System-generated
source: 'user'          // Explicitly saved by user
```

## Troubleshooting

### Memories Not Being Found

1. Check if tags match exactly
2. Verify vector search is running
3. Use broader search terms

### Slow Search Performance

1. Ensure vector search is enabled
2. Check memory count (consider compression)
3. Add more specific tags

### Duplicate Memories

1. Use `list()` to check for duplicates
2. Use `update()` instead of `store()` for existing content
3. Consider conflict detection

## API Reference

For complete API documentation, see [README.md](../README.md).
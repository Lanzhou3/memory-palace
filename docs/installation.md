# Installation Guide

This guide covers the complete installation process for Memory Palace, including optional vector search capabilities.

## System Requirements

### Core Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Node.js | 18.0.0 | 20.x LTS |
| TypeScript | 5.3.0 | 5.4+ |
| npm | 8.0.0 | 10.x |
| Disk Space | 50MB | 200MB (with vector search) |

### Optional: Vector Search

| Requirement | Notes |
|-------------|-------|
| Python | 3.8+ (3.10+ recommended) |
| RAM | ~200MB for embedding model |
| Model | BGE-small-zh-v1.5 (~100MB, auto-downloaded) |

## Installation Methods

### Method 1: ClawHub (Recommended)

The easiest way to install Memory Palace is through ClawHub:

```bash
# Install the skill
clawhub install memory-palace

# Verify installation
clawhub list | grep memory-palace
```

### Method 2: From Source

For development or customization:

```bash
# Clone the repository
git clone https://github.com/chaos-team/memory-palace.git
cd memory-palace

# Install dependencies
npm install

# Build TypeScript
npm run build

# Optional: Link globally
npm link
```

## Vector Search Setup (Optional)

Vector search enables semantic similarity matching, providing more accurate search results. Without it, the system falls back to keyword-based text matching.

### Step 1: Install Python Dependencies

```bash
# Using pip
pip install sentence-transformers numpy

# Or using pip with specific versions
pip install sentence-transformers>=2.2.0 numpy>=1.21.0
```

### Step 2: Configure HuggingFace Mirror (China Users)

```bash
# Set mirror for faster downloads in China
export HF_ENDPOINT=https://hf-mirror.com

# Add to your shell profile for persistence
echo 'export HF_ENDPOINT=https://hf-mirror.com' >> ~/.bashrc
```

### Step 3: Start the Vector Service

```bash
# Start as background process
python scripts/vector-service.py &

# Or run in foreground for debugging
python scripts/vector-service.py
```

### Step 4: Verify Vector Search

```bash
# Run tests with vector search enabled
VECTOR_SEARCH=true npm test
```

Expected output should include vector search tests passing.

## Installation Verification

### Run Tests

```bash
npm test
```

Expected output:
```
  MemoryPalaceManager
    ✓ should store a memory
    ✓ should get a memory by ID
    ✓ should search memories
    ✓ should list memories with filters
    ✓ should update a memory
    ✓ should delete and restore a memory
    ✓ should get statistics

  7 passing
```

### Check Build Output

```bash
ls -la dist/
```

Should show compiled JavaScript files:
```
dist/
├── index.js
├── manager.js
├── storage.js
├── types.js
├── background/
│   ├── time-reasoning.js
│   ├── concept-expansion.js
│   └── vector-search.js
└── cognitive/
    ├── cluster.js
    ├── entity.js
    └── graph.js
```

### Test Basic Functionality

```typescript
import { MemoryPalaceManager } from '@openclaw/memory-palace';

const manager = new MemoryPalaceManager({
  workspaceDir: '/tmp/test-palace'
});

// Store a test memory
const memory = await manager.store({
  content: 'Test memory for verification',
  tags: ['test'],
});

console.log('Created memory:', memory.id);

// Search for it
const results = await manager.recall('test');
console.log('Search results:', results.length);

// Clean up
await manager.delete(memory.id, true);
```

## Common Installation Issues

### Issue: Node.js Version Too Old

**Error:**
```
Error: Cannot find module 'node:fs'
```

**Solution:**
```bash
# Check Node.js version
node --version

# If below 18.x, upgrade Node.js
# Using nvm (recommended)
nvm install 20
nvm use 20

# Or using package manager (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Issue: TypeScript Compilation Errors

**Error:**
```
error TS2307: Cannot find module 'xxx'
```

**Solution:**
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Issue: Python Dependencies Missing

**Error:**
```
ModuleNotFoundError: No module named 'sentence_transformers'
```

**Solution:**
```bash
# Install Python dependencies
pip install sentence-transformers numpy

# Or with pip3 if pip points to Python 2
pip3 install sentence-transformers numpy
```

### Issue: Model Download Timeout

**Error:**
```
ConnectionError: Couldn't reach huggingface.co
```

**Solution:**
```bash
# Set HuggingFace mirror (for China users)
export HF_ENDPOINT=https://hf-mirror.com

# Pre-download the model
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('BAAI/bge-small-zh-v1.5')"
```

### Issue: Vector Service Port Conflict

**Error:**
```
OSError: [Errno 98] Address already in use
```

**Solution:**
```bash
# Check what's using the port
lsof -i :8765

# Kill the existing process
kill -9 <PID>

# Or use a different port
VECTOR_PORT=8766 python scripts/vector-service.py &
```

### Issue: Permission Denied

**Error:**
```
EACCES: permission denied
```

**Solution:**
```bash
# Fix npm permissions
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Or use sudo for global installs (not recommended)
sudo npm install -g memory-palace
```

## Next Steps

After successful installation:

1. **Configure OpenClaw Integration** - See [openclaw-integration.md](./openclaw-integration.md)
2. **View Examples** - Check the `examples/` directory for sample usage
3. **Read the API Reference** - See [README.md](../README.md) for full API documentation

## Uninstallation

### ClawHub Installation

```bash
clawhub uninstall memory-palace
```

### Source Installation

```bash
# Remove from global npm packages
npm unlink -g @openclaw/memory-palace

# Remove project directory
rm -rf /path/to/memory-palace

# Optional: Remove cached data
rm -rf ~/.cache/memory-palace
```

## Getting Help

- **Documentation**: [README.md](../README.md)
- **Issues**: [GitHub Issues](https://github.com/chaos-team/memory-palace/issues)
- **Examples**: `examples/` directory
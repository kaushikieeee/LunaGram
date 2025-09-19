# GitHub Actions Setup Guide

## Setting Up GitHub Personal Access Token for Releases

To enable automatic GitHub releases, you need to set up a Personal Access Token:

### 1. Create a Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Set expiration to "No expiration" (or your preferred timeframe)
4. Select these permissions:
   - `repo` (Full control of private repositories)
   - `write:packages` (Upload packages to GitHub Package Registry)

### 2. Add Token to Repository Secrets

1. Go to your LunaGram repository
2. Click Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `GH_TOKEN`
5. Value: Paste your Personal Access Token
6. Click "Add secret"

### 3. Available Workflows

#### Build and Release (with token)
- **File**: `.github/workflows/build-and-release.yml`
- **Purpose**: Builds app + creates GitHub release
- **Requirements**: `GH_TOKEN` secret must be set
- **Usage**: Go to Actions → Build and Release LunaGram → Run workflow
- **Options**:
  - Version (e.g., v1.0.1)
  - Pre-release checkbox
  - Create release checkbox

#### Build Only (no token needed)
- **File**: `.github/workflows/build-only.yml`
- **Purpose**: Just builds the app files
- **Requirements**: None
- **Usage**: Go to Actions → Build LunaGram (No Release) → Run workflow
- **Downloads**: Available as artifacts for 30 days

## Local Building

For local development and testing:

```bash
# Development mode
npm start

# Build locally (unsigned)
npm run build

# Files will be in dist/ folder
```

## Troubleshooting

### Error: "GitHub Personal Access Token is not set"
- This means the `GH_TOKEN` secret is missing
- Use the "Build Only" workflow instead, or set up the token as described above

### Build succeeds but release fails
- Check that `GH_TOKEN` has the correct permissions (`repo` scope)
- Verify the token hasn't expired
- Make sure you're running the "Build and Release" workflow with "Create release" enabled
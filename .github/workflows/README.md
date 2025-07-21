# GitHub Actions Workflows

This directory contains automated CI/CD workflows for the GNOME Shell Bitcoin Markets extension.

## Workflows

### 1. CI/CD Pipeline (`ci.yml`)
Runs on every push and pull request to master branch.

**Steps:**
- ✅ Run linter (`make lint`)
- ✅ Type checking (`make check`)
- ✅ Run tests (`make test`)
- ✅ Security scanning for secrets
- 📦 Build extension (`make build`)
- 📋 Generate SHA256 checksums
- 🚀 Upload release assets (on release)

### 2. Release Workflow (`release.yml`)
Manual workflow to create a new release.

**Features:**
- 🏷️ Version bumping in metadata.json and package.json
- 📝 Automatic changelog generation from commits
- 🎯 Semantic versioning support
- 📦 GitHub release creation with artifacts
- 🔄 AUR package update (if configured)

**Usage:**
1. Go to Actions → Release
2. Click "Run workflow"
3. Enter version number (e.g., 1.2.3)
4. Select release type (patch/minor/major)

### 3. Provider Health Check (`provider-health.yml`)
Runs daily to check if all exchange APIs are working.

**Features:**
- 🔍 Tests all provider APIs
- 📊 Creates summary of failing providers
- 🐛 Opens/updates GitHub issue for failures
- 📈 Tracks provider reliability over time

## Setup Requirements

### Secrets
- `GITHUB_TOKEN`: Automatically provided by GitHub
- `AUR_SSH_KEY`: (Optional) SSH key for AUR package updates

### Branch Protection
Recommended settings for `master` branch:
- Require pull request reviews
- Require status checks (CI/CD Pipeline)
- Require branches to be up to date

## Manual Release Process

After automated release:
1. Download the `.zip` file from GitHub release
2. Visit [extensions.gnome.org](https://extensions.gnome.org/upload/)
3. Upload the extension zip file
4. Add release notes
5. Submit for review

## Monitoring

- Check Actions tab for workflow runs
- Provider health issues labeled with `provider-health`
- Failed builds notify via GitHub notifications
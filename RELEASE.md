# Release Process

This document outlines the process for releasing a new version of the GNOME Shell Bitcoin Markets extension.

## Pre-Release Checklist

- [ ] All tests pass: `make test`
- [ ] No linting errors: `make lint`
- [ ] Extension builds successfully: `make build`
- [ ] Test the extension locally: `make install && make restart`
- [ ] Update CLAUDE.md if there are new development practices
- [ ] Commit all changes to master branch

## Automated Release Process

1. **Go to GitHub Actions**
   - Navigate to Actions → Release workflow
   - Click "Run workflow"
   - Enter the new version number (e.g., `1.2.3`)
   - Select release type: patch, minor, or major
   - Click "Run workflow"

2. **The workflow will automatically:**
   - Update version in `src/metadata.json` and `package.json`
   - Generate changelog from commit messages
   - Create and push git tag
   - Build the extension
   - Create GitHub release with:
     - Extension .zip file
     - SHA256 checksum
     - Changelog in release notes

## Manual Steps After Release

### 1. Upload to GNOME Extensions Portal

1. Download the `.zip` file from the GitHub release
2. Visit https://extensions.gnome.org/upload/
3. Log in with your GNOME account
4. Click "Upload new version"
5. Select the downloaded `.zip` file
6. Add release notes (copy from GitHub release)
7. Submit for review

**Review typically takes 1-7 days**

### 2. Update AUR Package (Optional)

If you maintain the AUR package:

```bash
# Clone AUR repository
git clone ssh://aur@aur.archlinux.org/gnome-shell-extension-bitcoin-markets.git
cd gnome-shell-extension-bitcoin-markets

# Update PKGBUILD
VERSION="1.2.3"  # Your new version
wget "https://github.com/OttoAllmendinger/gnome-shell-bitcoin-markets/releases/download/v${VERSION}/gnome-shell-bitcoin-markets.zip"
SHA256=$(sha256sum gnome-shell-bitcoin-markets.zip | cut -d' ' -f1)

# Edit PKGBUILD
# - Update pkgver=${VERSION}
# - Update sha256sums=('${SHA256}')

# Generate .SRCINFO
makepkg --printsrcinfo > .SRCINFO

# Commit and push
git add PKGBUILD .SRCINFO
git commit -m "Update to version ${VERSION}"
git push
```

### 3. Announce the Release (Optional)

- Post on project's issue tracker about major features
- Update any documentation wikis
- Notify package maintainers of breaking changes

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes, removed features
- **MINOR** (0.1.0): New features, backwards compatible
- **PATCH** (0.0.1): Bug fixes, small improvements

## Emergency Hotfix Process

For critical bugs:

1. Create hotfix branch: `git checkout -b hotfix/issue-description`
2. Fix the issue and test thoroughly
3. Create PR to master
4. After merge, immediately create new release
5. Mark as hotfix in release notes

## Rollback Process

If a release has critical issues:

1. Mark the release as "Pre-release" on GitHub
2. Create a new release from the previous stable tag
3. Notify users via GitHub issues
4. Upload previous version to extensions.gnome.org

## Monitoring After Release

- Check GitHub issues for new bug reports
- Monitor extension reviews on extensions.gnome.org
- Run provider health check: `make test`
- Check for JavaScript errors: `journalctl -f /usr/bin/gnome-shell`

## Common Issues

### Build fails with "git describe --dirty"
- Commit all changes before building
- The build includes git version in metadata

### Extension rejected by GNOME review
Common reasons:
- Missing or incorrect metadata
- Use of deprecated APIs
- Security concerns (hardcoded API keys)
- Poor error handling

### Tests fail after release
- Clear test cache: `rm -rf .cache/`
- Check if provider APIs have changed
- Run `make test` to identify failing providers
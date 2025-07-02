#!/bin/bash

echo "🧹 Removing large files from git history..."

# Create a backup branch
git branch backup-before-cleanup

# Remove the large files from history
echo "Removing Arc DMG file..."
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch attached_assets/Arc-1.101.0-64746.dmg" \
  --prune-empty --tag-name-filter cat -- --all

echo "Removing Zen DMG file..."
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch attached_assets/zen.macos-universal.dmg" \
  --prune-empty --tag-name-filter cat -- --all

# Clean up
echo "Cleaning up..."
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "✅ Large files removed from history!"
echo ""
echo "⚠️  WARNING: This rewrites history. You'll need to force push:"
echo "   git push --force origin main"
echo ""
echo "Backup branch created: backup-before-cleanup"
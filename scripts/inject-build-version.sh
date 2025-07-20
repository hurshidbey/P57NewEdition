#!/bin/bash
# Script to inject build version into HTML for cache busting

# Generate build version based on timestamp
BUILD_VERSION=$(date +%Y%m%d%H%M%S)

echo "🏷️  Injecting build version: $BUILD_VERSION"

# Find and replace BUILD_VERSION_PLACEHOLDER in the built HTML
if [ -f "dist/public/index.html" ]; then
    sed -i.bak "s/BUILD_VERSION_PLACEHOLDER/$BUILD_VERSION/g" dist/public/index.html
    rm dist/public/index.html.bak
    echo "✅ Build version injected into dist/public/index.html"
else
    echo "⚠️  Warning: dist/public/index.html not found"
fi

# Also create a version file for reference
echo $BUILD_VERSION > dist/public/version.txt
echo "📝 Version file created: dist/public/version.txt"

echo "✅ Build version injection complete!"
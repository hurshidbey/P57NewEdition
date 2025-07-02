#!/bin/bash

echo "🔧 Fixing ALL remaining rounded classes in the codebase..."

# Find all TypeScript/TSX files with rounded classes
echo "Finding files with rounded classes..."
files=$(find client/src -name "*.tsx" -o -name "*.ts" | xargs grep -l "rounded-\(xl\|lg\|md\|sm\|2xl\|3xl\)" 2>/dev/null)

count=0
for file in $files; do
    if [ -f "$file" ]; then
        echo "Fixing: $file"
        # Create backup
        cp "$file" "$file.bak"
        
        # Replace rounded classes with rounded-none
        # But preserve rounded-full for spinners/icons
        sed -i '' -E '
            s/rounded-xl/rounded-none/g
            s/rounded-lg/rounded-none/g
            s/rounded-md/rounded-none/g
            s/rounded-sm/rounded-none/g
            s/rounded-2xl/rounded-none/g
            s/rounded-3xl/rounded-none/g
        ' "$file"
        
        # Check if file was modified
        if ! cmp -s "$file" "$file.bak"; then
            ((count++))
            echo "  ✓ Fixed rounded classes"
            rm "$file.bak"
        else
            echo "  - No changes needed"
            rm "$file.bak"
        fi
    fi
done

echo ""
echo "✅ Fixed $count files"
echo ""
echo "Checking for any remaining rounded classes (excluding rounded-none and rounded-full)..."
remaining=$(find client/src -name "*.tsx" -o -name "*.ts" | xargs grep -E "rounded-(?!(none|full))" 2>/dev/null | grep -v "rounded-t-" | grep -v "rounded-b-" | wc -l)
echo "Found $remaining remaining instances"

if [ $remaining -gt 0 ]; then
    echo ""
    echo "Showing remaining instances:"
    find client/src -name "*.tsx" -o -name "*.ts" | xargs grep -E "rounded-(?!(none|full))" 2>/dev/null | grep -v "rounded-t-" | grep -v "rounded-b-" | head -10
fi
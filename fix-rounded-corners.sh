#!/bin/bash

# Script to fix rounded corners in all components to achieve brutal rectangular design

echo "🔧 Fixing rounded corners to brutal rectangular design..."

# Function to replace rounded classes with rounded-none
fix_rounded() {
    local file=$1
    echo "  Fixing: $file"
    
    # Replace common rounded classes with rounded-none
    # But preserve rounded-full for spinners and icons that need to be circular
    sed -i.bak -E 's/rounded-(sm|md|lg|xl|2xl|3xl)/rounded-none/g' "$file"
    
    # Replace custom rounded values like rounded-[12px]
    sed -i.bak -E 's/rounded-\[[0-9]+px\]/rounded-none/g' "$file"
    
    # Replace rounded-t-*, rounded-b-*, etc. with rounded-none
    sed -i.bak -E 's/rounded-(t|b|l|r|tl|tr|bl|br)-(sm|md|lg|xl|2xl|3xl|\[[0-9]+px\])/rounded-none/g' "$file"
    
    # Clean up backup files
    rm -f "${file}.bak"
}

# Find all TypeScript/TSX files with rounded classes (excluding rounded-none and rounded-full)
echo "🔍 Finding files with rounded corners..."

# UI Components - Priority 1
ui_files=(
    "client/src/components/ui/toast.tsx"
    "client/src/components/ui/toggle.tsx"
    "client/src/components/ui/command.tsx"
    "client/src/components/ui/menubar.tsx"
    "client/src/components/ui/input.tsx"
    "client/src/components/ui/textarea.tsx"
    "client/src/components/ui/select.tsx"
    "client/src/components/ui/dialog.tsx"
    "client/src/components/ui/dropdown-menu.tsx"
    "client/src/components/ui/context-menu.tsx"
    "client/src/components/ui/tooltip.tsx"
    "client/src/components/ui/popover.tsx"
    "client/src/components/ui/alert.tsx"
    "client/src/components/ui/alert-dialog.tsx"
    "client/src/components/ui/badge.tsx"
    "client/src/components/ui/skeleton.tsx"
    "client/src/components/ui/tabs.tsx"
)

# Feature Components - Priority 2
feature_files=(
    "client/src/components/prompt-comparison.tsx"
    "client/src/components/premium-prompt-lock.tsx"
    "client/src/components/progress-dashboard.tsx"
    "client/src/components/header.tsx"
    "client/src/components/hero-section.tsx"
    "client/src/components/login-form.tsx"
    "client/src/components/register-form.tsx"
    "client/src/components/protected-route.tsx"
)

echo ""
echo "📝 Processing UI Components..."
for file in "${ui_files[@]}"; do
    if [ -f "$file" ]; then
        fix_rounded "$file"
    else
        echo "  ⚠️  File not found: $file"
    fi
done

echo ""
echo "📝 Processing Feature Components..."
for file in "${feature_files[@]}"; do
    if [ -f "$file" ]; then
        fix_rounded "$file"
    else
        echo "  ⚠️  File not found: $file"
    fi
done

# Also fix any other files that might have been missed
echo ""
echo "📝 Processing remaining files..."
find client/src/components -name "*.tsx" -o -name "*.ts" | while read -r file; do
    # Check if file contains rounded- classes (excluding rounded-none and rounded-full)
    if grep -qE "rounded-(sm|md|lg|xl|2xl|3xl|\[[0-9]+px\])" "$file" 2>/dev/null; then
        # Skip if already processed
        if [[ ! " ${ui_files[@]} ${feature_files[@]} " =~ " ${file} " ]]; then
            fix_rounded "$file"
        fi
    fi
done

echo ""
echo "✅ Rounded corners fixed! All components now use brutal rectangular design."
echo ""
echo "Note: rounded-full classes were preserved for elements that need to be circular (spinners, dots, etc.)"
echo "If you need to make those rectangular too, run:"
echo "  find client/src/components -name '*.tsx' -exec sed -i 's/rounded-full/rounded-none/g' {} +"
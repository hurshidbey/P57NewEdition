#!/usr/bin/env python3
import json
import re

# Read the file
with open('server/data/prompts.json', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove any nested array brackets (fix the main issue)
# Replace patterns like "}\n    [\n      {" with "},\n    {"
content = re.sub(r'\}\s*\n\s*\[\s*\n\s*\{', '},\n  {', content)

# Remove extra closing brackets before the end
content = re.sub(r'\}\s*\n\s*\]\s*\n\s*\]$', '}\n]', content)

# Try to parse and validate
try:
    data = json.loads(content)
    print(f"JSON is valid! Found {len(data)} prompts")
    
    # Write back the properly formatted JSON
    with open('server/data/prompts.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Successfully fixed and formatted prompts.json")
    
except json.JSONDecodeError as e:
    print(f"JSON is still invalid: {e}")
    print(f"Error at position {e.pos}")
    # Save the partially fixed content for inspection
    with open('server/data/prompts-partial-fix.json', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Saved partially fixed content to prompts-partial-fix.json")
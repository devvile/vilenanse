import re

with open(r'f:\programowanie\Vilenanse\vilenanse\app\health\calories\page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

brace_balance = 0
func_scope_depth = 0
errors = []

for i, line in enumerate(lines):
    line_num = i + 1
    
    # Track function starts
    if re.search(r'(function\s+\w+|=>\s*{)', line):
        # This is a very rough heuristic
        pass

    for char in line:
        if char == '{':
            brace_balance += 1
        elif char == '}':
            brace_balance -= 1
            if brace_balance < 0:
                errors.append(f"Negative brace balance at line {line_num}")
    
    if 'return' in line:
        # Check if it's a return statement (not in a comment)
        clean_line = line.split('//')[0].strip()
        if clean_line.startswith('return'):
            if brace_balance == 0:
                errors.append(f"TOP-LEVEL RETURN at line {line_num}: {line.strip()}")
            # Special check for our component
            # If CaloriesPage starts at 81, brace_balance should be at least 1 for any return inside it.
            if line_num > 81 and brace_balance < 1:
                errors.append(f"RETURN OUTSIDE COMPONENT at line {line_num}: {line.strip()}")

print(f"Final brace balance: {brace_balance}")
for err in errors:
    print(err)

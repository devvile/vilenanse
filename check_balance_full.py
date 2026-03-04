with open(r'f:\programowanie\Vilenanse\vilenanse\app\health\calories\page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

brace_balance = 0
paren_balance = 0
line_num = 1
for i, char in enumerate(text):
    if char == '\n':
        line_num += 1
    elif char == '{':
        brace_balance += 1
    elif char == '}':
        brace_balance -= 1
        if brace_balance < 0:
             print(f"ERROR: Negative brace balance at line {line_num}")
    elif char == '(':
        paren_balance += 1
    elif char == ')':
        paren_balance -= 1
        if paren_balance < 0:
             print(f"ERROR: Negative paren balance at line {line_num}")

print(f"Total lines: {line_num}")
print(f"Final brace balance: {brace_balance}")
print(f"Final paren balance: {paren_balance}")

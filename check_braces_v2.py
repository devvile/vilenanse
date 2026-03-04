with open(r'f:\programowanie\Vilenanse\vilenanse\app\health\calories\page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

balance = 0
for i, line in enumerate(lines):
    line_num = i + 1
    # Check balance at start of line
    if balance == 0 and line_num > 81:
         if line.strip():
             print(f"ZERO BALANCE at line {line_num} START: {line.strip()}")
    
    for char in line:
        if char == '{':
            balance += 1
        elif char == '}':
            balance -= 1
            if balance == 0 and line_num > 81:
                print(f"BALANCE RETURNED TO ZERO at line {line_num} END: {line.strip()}")

print(f"Final balance: {balance}")

import os

path = r'f:\programowanie\Vilenanse\vilenanse\app\health\calories\page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open(path, 'w', encoding='utf-8', newline='\n') as f:
    for line in lines:
        # Strip trailing whitespace and ensure single newline
        f.write(line.rstrip() + '\n')

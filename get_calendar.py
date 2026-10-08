import re

html = open('index.html', encoding='utf-8').read()
match = re.search(r'(<div class="calendar[^>]*>.*?<div class="template-three">)', html, re.DOTALL)
if match:
    print(match.group(1))
else:
    print("Not found")

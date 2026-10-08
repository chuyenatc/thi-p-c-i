import re

html = open('index.html', encoding='utf-8').read()

new_calendar_inner = ""
# October 2026 starts on Thursday. Assuming Monday is the first column, we need 3 empty blocks.
new_calendar_inner += "<div></div>\n" * 3

for i in range(1, 32):
    if i == 25:
        new_calendar_inner += f'<div><img class="heart-date" src="images/calen_heart_1.png" alt="heart" />\n<div class="colorF">25</div>\n</div>\n'
    else:
        new_calendar_inner += f'<div><div>{i}</div></div>\n'

new_calendar_block = f'<div class="template-three">\n{new_calendar_inner}</div>'

new_html = re.sub(r'<div class="template-three">.*?</div>\s*</div>\s*</div>', new_calendar_block + '\n</div>\n</div>', html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print("Updated calendar successfully.")

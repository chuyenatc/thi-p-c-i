import re

html = open('index.html', encoding='utf-8').read()

m1 = re.search(r'data-node-id="vn8LzVP4iL".*?background-image:url\(images/([^)]+)\)', html, re.DOTALL)
if m1: print('Icon 1 (Rings):', m1.group(1))

m2 = re.search(r'data-node-id="cYR1ro10__".*?background-image:url\(images/([^)]+)\)', html, re.DOTALL)
if m2: print('Icon 2 (Camera):', m2.group(1))

m3 = re.search(r'data-node-id="o39-Fh23Xn".*?background-image:url\(images/([^)]+)\)', html, re.DOTALL)
if m3: print('Icon 3:', m3.group(1))

# Let's find the third icon by looking backwards from SJRSSa34BV
idx = html.find('data-node-id="SJRSSa34BV"')
if idx != -1:
    before = html[:idx]
    matches = re.findall(r'background-image:url\(images/([^)]+)\)', before)
    if matches:
        print('Last image before Text 3 (Plates):', matches[-1])

import re
html = open('index.html', encoding='utf-8').read()
idx = html.find('data-node-id="scGhyU0cqJ"')
if idx != -1:
    print(html[idx:idx+1500])

import re
html = open('index.html', encoding='utf-8').read()
idx = html.find('p9r9hqnxqhoep7qg3x6ytf.png')
if idx != -1:
    print(html[idx-1000:idx+100])

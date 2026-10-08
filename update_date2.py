import json, base64, re

html = open('index.html', encoding='utf-8').read()
next_data_str = html.split('id="__NEXT_DATA__"')[1].split('>')[1].split('</script>')[0]
m = re.search(r'"templateData":\s*"(eyJ[^"]+)"', next_data_str)
if m:
    b64_str = m.group(1)
    raw_bytes = base64.b64decode(b64_str + '====')
    dates = re.findall(b'202[4-6]-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}', raw_bytes)
    print(set(dates))

    new_bytes = re.sub(b'202[4-6]-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}', b'2026-10-24T00:00:00', raw_bytes)
    new_b64 = base64.b64encode(new_bytes).decode('utf-8')
    new_html = html.replace(b64_str, new_b64)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_html)
    print("Replaced dates with 2026-10-24T00:00:00 and wrote to index.html")
else:
    print("templateData not found")

import json, base64, re

html = open('index.html', encoding='utf-8').read()
next_data_str = html.split('id="__NEXT_DATA__"')[1].split('>')[1].split('</script>')[0]
m = re.search(r'"templateData":\s*"(eyJ[^"]+)"', next_data_str)
if m:
    b64_str = m.group(1)
    decoded = base64.b64decode(b64_str).decode('utf-8')
    print('Found date strings in decoded JSON:')
    dates = re.findall(r'202[4-6]-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z', decoded)
    print(set(dates))

    new_decoded = re.sub(r'202[4-6]-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z', '2026-10-24T00:00:00.000Z', decoded)
    new_b64_str = base64.b64encode(new_decoded.encode('utf-8')).decode('utf-8')
    
    new_html = html.replace(b64_str, new_b64_str)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_html)
    print("Replaced dates with 2026-10-24T00:00:00.000Z and wrote to index.html")
else:
    print("templateData not found")

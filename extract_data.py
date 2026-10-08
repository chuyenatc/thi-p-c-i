import json, base64, re

html = open('index.html', encoding='utf-8').read()
next_data_str = html.split('id="__NEXT_DATA__"')[1].split('>')[1].split('</script>')[0]
m = re.search(r'"templateData":\s*"(eyJ[^"]+)"', next_data_str)
if m:
    b64_str = m.group(1)
    raw_bytes = base64.b64decode(b64_str + '====')
    with open('decoded_template_data.json', 'wb') as f:
        f.write(raw_bytes)
    print("wrote decoded_template_data.json")

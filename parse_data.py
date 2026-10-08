import json, base64

with open('index.html', encoding='utf-8') as f:
    html = f.read()

next_data_str = html.split('id="__NEXT_DATA__"')[1].split('>')[1].split('</script>')[0]
d = json.loads(next_data_str)
t_data = d['props']['pageProps']['templateData']['templateData']

print(t_data[:100])

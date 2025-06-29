import subprocess
import json

TREE_SYMBOLS = {
    'branch': '├──',
    'last_branch': '└──',
    'vertical': '│',
    'space': '   '
}

parents = []

def generate_sitemap_from_json(tree_json, depth=0, is_last=False):
    global parents
    html_content = []

    for index, item in enumerate(tree_json):
        name = item['name']
        item_type = item['type']

        is_last_item = (index == len(tree_json) - 1)

        indent = '  ' * depth
        tree_symbol = TREE_SYMBOLS['last_branch'] if is_last_item else TREE_SYMBOLS['branch']
        
        if item_type == 'directory':
            parents.append(name)
            html_content.append(f'{indent}{tree_symbol}<details><summary class="sitemap-folder"><img width="16" src="images/dir.png" class>&nbsp;{name}</summary>')

            if 'contents' in item:
                content = generate_sitemap_from_json(item['contents'], depth + 1, is_last_item)
                if content:
                    html_content.append(content)
                else:
                    parents = parents[:-1]
            html_content.append('</details>')

        elif item_type == 'file':
            href = ('/'.join(parents) + '/' + name) if parents else name
            html_content.append(f'{indent}{tree_symbol} <a href="{href}" class="sitemap-anchor">{name}</a>')

            if parents: 
                if is_last or index == len(tree_json) - 1:
                    parents = parents[:-1]

    return '\n'.join(html_content)

def main():
    tree_output = subprocess.check_output(['tree', '-J', '--dirsfirst'], text=True)
    tree_json = json.loads(tree_output)
    sitemap_html = f'<pre><div class="navigation">\n{generate_sitemap_from_json(tree_json[0]["contents"])}\n</div></pre>'
    print(sitemap_html)

if __name__ == "__main__":
    main()

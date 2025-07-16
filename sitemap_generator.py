import subprocess
import json
import os
import re

def filter_items(items, exclude_patterns):
    filtered_items = []
    
    for item in items:
        if any(re.match(pattern, item) for pattern in exclude_patterns):
            # print(f"Ignoring item: {item}")
            continue
        filtered_items.append(item)
    
    return filtered_items

def read_file_to_list(filename):
    if not os.path.exists(filename):
        # print(f"Error: The file '{filename}' does not exist.")
        return []

    try:
        with open(filename, 'r') as file:
            lines = file.readlines()
            
            if not lines:
                # print(f"Warning: The file '{filename}' is empty.")
                return []
            
            lines = [line.strip() for line in lines]

            return lines

    except IOError as e:
        # print(f"Error: An I/O error occurred while reading the file '{filename}'. Details: {e}")
        return []

filename = 'sitemap.exclude'
exclude_patterns = read_file_to_list(filename)

# print('exclude_patterns:',exclude_patterns)

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

    name_list = [x['name'] for x in tree_json]
    # print('name list:',name_list)
    # print('tree json:',tree_json)

    filtered_items = filter_items(name_list, exclude_patterns)
    # print('filtered items:',filtered_items)

    for index, item in enumerate(tree_json):
        name = item['name']
        if name in filtered_items:
            item_type = item['type']

            is_last_item = filtered_items[-1] == name
            # print(name + " is last item") if is_last_item else ""

            indent = '  ' * depth
            tree_symbol = TREE_SYMBOLS['last_branch'] if is_last_item else TREE_SYMBOLS['branch']
            
            if item_type == 'directory':
                parents.append(name)
                details = f'{indent}{tree_symbol}<details><summary class="sitemap-folder"><img width="16" src="/images/dir.png" class>&nbsp;{name}</summary>'

                if 'contents' in item:
                    content = generate_sitemap_from_json(item['contents'], depth + 1, is_last_item)
                    if content:
                        details+=content
                    else:
                        parents = parents[:-1]
                details+='</details>'
                html_content.append(details)

            elif item_type == 'file':
                href = ('/'.join(parents) + '/' + name) if parents else name
                #root relative
                href = "/" + href
                html_content.append(f'{indent}{tree_symbol} <a href="{href}" class="sitemap-anchor">{name}</a>')

            if parents: 
                if is_last_item or index == len(filtered_items) - 1:
                    parents = parents[:-1]


    return '\n'.join(html_content)

def main():
    tree_output = subprocess.check_output(['tree', '-J', '--dirsfirst'], text=True)
    tree_json = json.loads(tree_output)
    sitemap_html = f'<pre><div class="navigation">\n{generate_sitemap_from_json(tree_json[0]["contents"])}\n</div></pre>'
    print(sitemap_html)

if __name__ == "__main__":
    main()

import os
import re

BASE_DIR = 'rendered'

import platform
import time

def get_creation_date(path_to_file):
    if platform.system() == 'Windows':
        return os.path.getctime(path_to_file)
    else:
        # On Unix, getctime is actually the *last metadata change* time
        stat = os.stat(path_to_file)
        try:
            return stat.st_birthtime  # macOS
        except AttributeError:
            # Linux does not provide creation time
            return stat.st_mtime  # fallback: last modified time


def extract_first_h1(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Warning: File not found — {file_path}")
        return None

    # Match <h1> that contains an <a> tag (adjust regex if needed)
    match = re.search(r'<h1[^>]*><a[^>]*>.*?</a>(.*?)</h1>', content, re.IGNORECASE | re.DOTALL)
    if match:
        return match.group(1).strip()
    else:
        # Try fallback: extract any <h1> text if no <a> inside
        fallback = re.search(r'<h1[^>]*>(.*?)</h1>', content, re.IGNORECASE | re.DOTALL)
        if fallback:
            return fallback.group(1).strip()
        return None

def main():
    print('<ul>')
    # List directories inside articles/rendered
    for folder in sorted(os.listdir(BASE_DIR)):
        folder_path = os.path.join(BASE_DIR, folder)
        if os.path.isdir(folder_path):
            html_file = os.path.join(folder_path, 'content.html')

            parent_dir = os.path.dirname(BASE_DIR)
            doc_file = os.path.join(parent_dir , folder.__str__().split('.')[0]+'.odt')

            h1_text = extract_first_h1(html_file)
            if not h1_text:
                h1_text = folder  # fallback to folder name if no <h1> found
                
            timestamp = get_creation_date(doc_file)
            creation_date =  time.strftime('%Y-%m-%d', time.localtime(timestamp))
            
            print(f'''<li>
                        <div class="article_list">
                            <article>
                                <a href="/articles/rendered/{folder}/content.html">{h1_text}</a>
                            </article>
                            <date>
                                {creation_date}
                            </date>
                        </div>
                    </li>
                    <br>''')
    print('</ul>')

if __name__ == '__main__':
    main()

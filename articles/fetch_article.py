import os
import re

BASE_DIR = 'rendered'

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
            h1_text = extract_first_h1(html_file)
            if not h1_text:
                h1_text = folder  # fallback to folder name if no <h1> found
            print(f'  <li><a href="/articles/rendered/{folder}/content.html">{h1_text}</a></li>')
    print('</ul>')

if __name__ == '__main__':
    main()

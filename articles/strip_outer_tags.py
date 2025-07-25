import sys
import re

def strip_html_body(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find start and end of <body>...</body>
    body_start = re.search(r"<body[^>]*>", content, re.IGNORECASE)
    body_end = re.search(r"</body\s*>", content, re.IGNORECASE)

    if not body_start or not body_end:
        print(f"Error: <body> tags not found in {filename}")
        return

    # Extract content between <body> and </body>
    stripped_content = content[body_start.end():body_end.start()]

    # Overwrite the original file (or you can write to another file)
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(R'<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Display&display=swap" rel="stylesheet">')
        f.write(stripped_content)

    print(f"Stripped HTML tags in {filename}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python strip_html_body.py <file.html>")
        sys.exit(1)

    strip_html_body(sys.argv[1])

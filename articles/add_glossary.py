import sys
import re

def split_html_by_headings(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        html = file.read()

    # Match first <h2> tag
    h2_match = re.search(r'<h2\b[^>]*>', html, flags=re.IGNORECASE)
    if not h2_match:
        return html, '', ''  # No <h2> found — return everything as part1

    start_h2 = h2_match.start()

    # Split before first <h2>
    part1 = html[:start_h2]

    # Look for the next <h2> or <h3> after the first <h2>
    next_heading_match = re.search(
        r'<h[23]\b[^>]*>', 
        html[h2_match.end():], 
        flags=re.IGNORECASE
    )

    if next_heading_match:
        start_next_heading = h2_match.end() + next_heading_match.start()
        part2 = html[start_h2:start_next_heading]
        part3 = html[start_next_heading:]
    else:
        # No second heading found
        part2 = html[start_h2:]
        part3 = ''

    return part1, part2, part3

def main():
    if len(sys.argv) < 2:
        print("Usage: python script.py <input_file.html>")
        sys.exit(1)

    input_file = sys.argv[1]
    p1, p2, p3 = split_html_by_headings(input_file)

    output_content = f'''
<div class="glossary">
    <div class="updates_box">
        <h2>Contents</h2>
        <div id="toc">
        </div>
    </div>
</div>
<div class="level1">{p1}</div>
<div class="level2">{p2}</div>
<div class="level3">{p3}</div>
    '''

    with open(input_file, "w", encoding="utf-8") as out_file:
        out_file.write(output_content)

if __name__ == "__main__":
    main()

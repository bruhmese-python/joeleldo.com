import sys
import re
import os

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

def process_snippets(file_path :str):
    code_highlighted_html =""
    
    with open(file_path, 'r', encoding='utf-8') as file:
        code_highlighted_html = file.read()

    # find p tags with content of the format .*\..*
    pattern = r'<p[^>]*>\s*[^\.]*[\w\-\.]+\.[\w]+\s*</p>'
    matches = list(re.findall(pattern, code_highlighted_html))

    # find span tags with content of the format .*\..*
    pattern = r'<span[^>]*>\s*[^\.]*[\w\-\.]+\.[\w]+\s*</span>'
    matches += list(re.findall(pattern, code_highlighted_html))

    snippet_files = list(map(lambda x: x.split('>')[1].split('<')[0] , matches))
 
    print('Snippets found:')
    [print(f"\t{x}") for x in snippet_files]

    #if files with their content's fielnames exist in the current directory, replace them with the content inside the span tag
    for match in matches:
        file_name = match.split('>')[1].split('<')[0]
        import subprocess

        try:
            print('Looking for file:', file_name)
            if not os.path.exists(file_name):
                print(f"File {file_name} does not exist, skipping.")
            else:
                # Run the script and capture its output
                print('Generating highlighted code for:', file_name)
                result = subprocess.run(
                    ['python3.9', 'highlight_code_snippets.py', file_name],
                    capture_output=True,
                    text=True,
                    check=True  # Raises CalledProcessError if the script fails
                )
                content = result.stdout
                code_highlighted_html = code_highlighted_html.replace(match, content)

        except subprocess.CalledProcessError as e:
            pass
        except Exception as e:
            pass

    with open(file_path, "w", encoding="utf-8") as file:
        file.write(code_highlighted_html)

def main():
    if len(sys.argv) < 2:
        print("Usage: python script.py <input_file.html>")
        sys.exit(1)

    input_file = sys.argv[1]

    process_snippets(input_file)
    
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

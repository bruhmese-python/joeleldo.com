import requests
from bs4 import BeautifulSoup
import sys

code_to_highlight = ""

with open(sys.argv[1], 'r', encoding='utf-8') as file:
	code_to_highlight = file.read()

# Step 1: Prepare the code and form data
data = {
    'code': code_to_highlight,
    'lexer': sys.argv[1].split('.')[-1] if len(sys.argv) > 1 else 'python',
}

headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'text/html',
    'User-Agent': 'Mozilla/5.0'
}

# Step 2: Send POST request to hilite.me
response = requests.post('https://hilite.me/', data=data, headers=headers)

# Step 3: Parse the returned HTML
soup = BeautifulSoup(response.text, 'html.parser')

# Step 4: Extract the inner <div> inside #preview
preview_div = soup.find('div', id='preview')

if preview_div:
    child_div = preview_div.find('div')
    if child_div:
        print("<div class=\"code-snippet\">")
        print(child_div.decode_contents())
        print("</div>")
else:
    print("#preview not found in the response.")
    print(response.text)

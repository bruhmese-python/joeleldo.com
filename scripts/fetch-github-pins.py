import requests
from bs4 import BeautifulSoup

# URL to scrape
url = "https://github.com/bruhmese-python"

# Send GET request to the URL
response = requests.get(url)

# Check if the request was successful
if response.status_code == 200:
    soup = BeautifulSoup(response.text, "html.parser")

    # Find all <span class="repo">
    spans = soup.find_all("span", class_="repo")

    if spans:
        for span in spans:
            anchor = span.find_parent("a")
            repo_name = span.get_text(strip=True)
            anchor_href = anchor['href'] if anchor and anchor.has_attr('href') else "No href found"
            print(f'''<div><svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-repo mr-1 color-fg-muted">
    <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
</svg>&nbsp;<a href=\"https://github.com{anchor_href}\" target=\"_blank\">{repo_name}</a></div>''')
    else:
        print("No <span class='repo'> elements found.")
else:
    print(f"Failed to fetch page. Status code: {response.status_code}")

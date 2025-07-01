import requests
from bs4 import BeautifulSoup

ignore = ['.gitignore', 'README.md']

def toHTML(entry):
	string = '''
<div class="container">
	<div class="item-name">
		• {}
	</div>
	<div class="download-links">
		<a href="#" class="disabled-anchor">
			<span class="icon midi-icon"></span>
			Download midi file
		</a>
		<a href="https://github.com/{}" class="">
			<span class="icon muse-icon"></span>
			Download MusE project
		</a>
	</div>
</div>'''
	redacted = entry[0][:min(20,len(entry[0]))] + '...'
	return string.format(redacted, entry[1])

# Function to scrape the table from the GitHub page
def scrape_table():
	# URL of the GitHub page
	url = "https://github.com/bruhmese-python/MusE-Projects/tree/master"

	# Send a GET request to fetch the page content
	response = requests.get(url)

	# Check if the request was successful
	if response.status_code != 200:
		print(f"Failed to retrieve the page. Status code: {response.status_code}")
		return

	# Parse the page content with BeautifulSoup
	soup = BeautifulSoup(response.content, 'html.parser')

	# print('printing soup')
	# print(soup)

	table = soup.findAll("table", {"aria-labelledby":"folders-and-files"})[0]

	# Find the table using the CSS selector
	# table = soup.select_one('#repo-content-pjax-container > div > div > div > div.Layout-main > react-partial > div > div > div.OverviewContent-module__Box_11--Tqhu2 > div:nth-child(1) > table')

	if table:
		# Extract table headers
		# headers = [header.text.strip() for header in table.find_all('th')]
		# print("Headers:", headers)

		# Extract rows from the table
		rows = []
		for row in table.find_all('tr')[1:]:  # Skip header row
			# columns = row.find_all('td')
			# row_data = [col.text.strip() for col in columns]
			# rows.append(row_data)
			anchor = row.find_all('a')
			if len(anchor) == 0:
				continue

			anchor = anchor[0]
			title = anchor.get('title')
			href = anchor.get('href')

			if href is None or title is None or title in ignore:
				continue
			rows.append([title, href])

		# Print the rows
		for row in rows:
			print(toHTML(row))
	else:
		print("Table not found!")

# Run the function
scrape_table()

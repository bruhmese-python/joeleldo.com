all:
	jinja2 _index.html > index.html
	jinja2 _downloads.html > downloads.html
	jinja2 _links.html > links.html

clean:
	rm index.html downloads.html links.html
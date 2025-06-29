all: sitemap.html
	jinja2 _index.html > index.html
	jinja2 _downloads.html > downloads.html
	jinja2 _links.html > links.html
	jinja2 _sitemap.html > sitemap.html

sitemap.html: 
	python3.9 sitemap_generator.py > sitemap.html.tmp

clean:
	rm index.html downloads.html links.html sitemap.html
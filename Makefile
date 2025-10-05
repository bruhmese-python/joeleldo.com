# Variables
JINJA_CMD = jinja2
PYTHON_CMD = python3.9

# Find all template files
TEMPLATES = $(wildcard _*.html)

# Generate target files by replacing _ with nothing in template filenames
TARGETS = $(patsubst _%.html,%.html,$(TEMPLATES))

# Default target
all: $(TARGETS) downloads.html sitemap.html apps

apps:
	@mkdir -p apps
	@while read path; do \
		if [ -d "$$path" ]; then \
			echo "Processing $$path"; \
			dest=./apps/$$(basename "$$path"); \
			rm -rf "$$dest"; \
			mkdir -p "$$dest"; \
			if [ -f "$$path/files_to_copy.txt" ]; then \
				while read item; do \
					if [ -e "$$path/$$item" ]; then \
						echo "  Copying $$item"; \
						cp -r "$$path/$$item" "$$dest/"; \
					else \
						echo "  Warning: '$$item' not found in $$path"; \
					fi \
				done < "$$path/files_to_copy.txt"; \
			else \
				echo "  Warning: files_to_copy.txt not found in $$path"; \
			fi \
		else \
			echo "Warning: '$$path' is not a directory or does not exist"; \
		fi \
	done < apps.path


# Rule to generate target files from templates
%.html: _%.html
	$(JINJA_CMD) $< > $@

# Special rule for sitemap.html
sitemap.html: _sitemap.html sitemap_generator.py
	$(PYTHON_CMD) sitemap_generator.py > sitemap.html.tmp
	# sleep 1	
	$(JINJA_CMD) _sitemap.html > sitemap.html

# Special rule for index.html
index.html: scripts/fetch-github-pins.py
	$(PYTHON_CMD) scripts/fetch-github-pins.py > github-pins_.html
	# sleep 2	
	$(JINJA_CMD) _index.html > index.html

# Special rule for downloads.html
downloads.html: scripts/fetch-midi-projects.py
	$(PYTHON_CMD) scripts/fetch-midi-projects.py > midi-projects_.html
	# sleep 2	
	$(JINJA_CMD) _downloads.html > downloads.html

# Special rule for articles.html
articles.html: 
	@echo "Making articles"
	cd articles && make
	$(JINJA_CMD) _articles.html > articles.html

# Clean target
clean:
	cd articles && make clean
	rm -f $(TARGETS)
	rm -rf apps

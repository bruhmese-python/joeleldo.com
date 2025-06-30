# Variables
JINJA_CMD = jinja2
PYTHON_CMD = python3.9

# Find all template files
TEMPLATES = $(wildcard _*.html)

# Generate target files by replacing _ with nothing in template filenames
TARGETS = $(patsubst _%.html,%.html,$(TEMPLATES))

# Default target
all: $(TARGETS) sitemap.html

# Rule to generate target files from templates
%.html: _%.html
	$(JINJA_CMD) $< > $@

# Special rule for sitemap.html
sitemap.html: _sitemap.html sitemap_generator.py
	$(JINJA_CMD) _sitemap.html > sitemap.html
	sleep 1	
	$(PYTHON_CMD) sitemap_generator.py > sitemap.html.tmp

# Clean target
clean:
	rm -f $(TARGETS)
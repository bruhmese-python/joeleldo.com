
JINJA_CMD = jinja2

ODT_FILES := $(wildcard *.odt)
TARGETS := $(patsubst %.odt,rendered/%,${ODT_FILES})
STRIP_SCRIPT := strip_outer_tags.py
GLOSSARY_SCRIPT := process_html.py

.PHONY: all clean

all: $(TARGETS) links

rendered/%: %.odt
	@mkdir -p $@
	@echo "Converting $< to HTML in $@..."
	@libreoffice25.2 --headless --convert-to "html:XHTML Writer File:UTF8" --convert-images-to "jpg" --outdir $@ $<
	@src_html="$@/$(basename $<).html"; \
	dst_html="$@/content.html"; \
	if [ -f "$$src_html" ]; then \
	    mv "$$src_html" "$$dst_html"; \
	    echo "Renamed $$src_html to $$dst_html"; \
	    python3 $(STRIP_SCRIPT) "$$dst_html"; \
	    echo "Processing $$dst_html.."; \
		processing_logs=`python3 $(GLOSSARY_SCRIPT) "$$dst_html"`; \
		echo "$$processing_logs"; \
		echo "$$processing_logs" > processing_logs.log; \
	else \
	    echo "Error: HTML file $$src_html not found."; \
	fi
	@echo "Copying temporary template"
	@cp $@/content.html ../content.html
	@echo "Rendering article"
	@if grep -q "Generating highlighted code" processing_logs.log; then \
	    cd $@ && $(JINJA_CMD) -D document="#" ../../../article_.html > content.html; \
	else \
	    cd $@ && $(JINJA_CMD) -D document="/articles/$<" ../../../article_.html > content.html; \
	fi
	@echo "Cleaning up temp template"
	@rm ../content.html

links:
	@echo "Rendering article links.."
	@python3 fetch_article.py > article_links.html


clean:
	rm -rf rendered
	rm article_links.html


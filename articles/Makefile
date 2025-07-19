
JINJA_CMD = jinja2

ODT_FILES := $(wildcard *.odt)
TARGETS := $(patsubst %.odt,rendered/%,${ODT_FILES})
STRIP_SCRIPT := strip_outer_tags.py

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
	else \
	    echo "Error: HTML file $$src_html not found."; \
	fi
	@echo "Copying temporary template"
	@cp $@/content.html ../content.html
	@echo "Rendering article"
	@cd $@ && $(JINJA_CMD)  ../../../article_.html > content.html
	@echo "Cleaning up temp template"
	@rm ../content.html

links:
	@echo "Rendering article links.."
	@python3 fetch_article.py > article_links.html


clean:
	rm -rf rendered
	rm article_links.html


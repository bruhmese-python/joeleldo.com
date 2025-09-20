# Path to the directory containing images to overlay
IMAGES_DIR = screenshots/youtube-thumbnails

# Path to the screenshots parent directory
SCREENSHOTS_DIR = screenshots/

# Path to the overlay image
OVERLAY = play-overlay.png

# Path to the temporary folder
TEMP_DIR = temp/

# Step 1: Copy images to a temporary folder
# Step 2: Apply overlay to each image in the temporary folder
# Step 3: Move the modified images to the screenshots folder
# Step 4: Clean up the temp folder
all:
	@echo "Creating temporary folder..."
	@mkdir -p $(TEMP_DIR) # Create temp directory if it doesn't exist
	@echo "Copying images to temp folder..."
	@cp $(IMAGES_DIR)/* $(TEMP_DIR) # Copy files to temp folder
	@echo "Generating video thumbnails in temp folder..."
	@find $(TEMP_DIR) -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) -exec bash -c ' \
		# Get the height of the base image and calculate 10% of it \
		height=$$(identify -format "%h" "$$1"); \
		overlay_height=$$(echo "$$height * 0.15" | bc); \
		# Resize the overlay image to 10% of the base image height \
		convert $(OVERLAY) -resize x$$overlay_height $(TEMP_DIR)overlay_resized.png; \
		# Apply the resized overlay to the base image \
		convert "$$1" $(TEMP_DIR)overlay_resized.png -gravity southeast -composite "$$1"; \
	' _ {} \;
	@echo "Moving modified images to screenshots folder..."
	@mv $(TEMP_DIR)* $(SCREENSHOTS_DIR) # Move modified images back to screenshots
	@echo "Cleaning up temporary folder..."
	@rm -rf $(TEMP_DIR) # Remove the temp folder after processing
	@echo "Generated video thumbnails"

# Clean: Removes all images from the screenshots folder (in case you need to clean manually)
clean:
	@echo "Restoring thumbnails..."
	@cp $(IMAGES_DIR)/*  ${SCREENSHOTS_DIR}

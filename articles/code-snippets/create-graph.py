import random

# Define the path to the file
file_path = './air-quality-data-in-india/all_cities.txt'

city_list = []

# Read the file and split contents by comma
try:
    with open(file_path, 'r') as file:
        content = file.read()
        city_list = [city.strip() for city in content.split(',') if city.strip()]
        print("Cities loaded:", city_list)
except FileNotFoundError:
    print(f"File not found at path: {file_path}")
except Exception as e:
    print(f"An error occurred: {e}")

import bpy

scene = bpy.context.scene

# Get the reference strips
bar_sample = bpy.data.objects["Plane"]
text_sample = bpy.data.objects["Text"]

# Strip duration and frame position
duration = 720
start_frame = 0
frame_gap = 0  # Optional spacing

displacement = 3

for idx, city in enumerate(city_list):
    # Step 2: Compute frame start
    frame_start = start_frame + idx * frame_gap

    # Duplicate the bar with linked data (same mesh)
    duplicate = bar_sample.copy()
    duplicate.data = bar_sample.data  # Link the same mesh datablock
    duplicate.animation_data_clear()  # Optional: clear animation data

    # Optionally offset the duplicate to avoid overlap
    duplicate.location.x += displacement * (idx + 1)

    # Link the new object to the same collection(s) as the original
    for collection in bar_sample.users_collection:
        collection.objects.link(duplicate)
        
    duplicate.name = f"{city}_bar"
    
    # Duplicate the text
    duplicate_text = text_sample.copy()
    duplicate_text.data = text_sample.data.copy()  # Duplicate mesh data (new mesh datablock)
    duplicate_text.animation_data_clear()       # Optional

    # Offset to see the duplicate
    duplicate_text.location.x += displacement * (idx + 1)

    # Link the duplicate to the same collection(s)
    for collection in text_sample.users_collection:
        collection.objects.link(duplicate_text)

    duplicate_text.data.body = city

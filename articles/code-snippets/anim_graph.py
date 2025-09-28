import csv
import bpy


def get_o3_naqi_category(o3_value):
    """
    Takes O₃ concentration in µg/m³ (8-hour average) and returns a category number:
    1 = Good, 2 = Satisfactory, 3 = Moderate, 4 = Poor, 5 = Very Poor, 6 = Severe
    """
    if o3_value <= 50:
        return 1  # Good
    elif o3_value <= 100:
        return 2  # Satisfactory
    elif o3_value <= 168:
        return 3  # Moderate
    elif o3_value <= 208:
        return 4  # Poor
    elif o3_value <= 748:
        return 5  # Very Poor
    else:
        return 6  # Severe


cur_frame = 0

# 109.26 max in camera (amravati as reference)
max_in_camera_value_scale = 0.276 

#(0:0.65) <=> 0:257.73 #max value
max_value = 257.73 
min_value =  0.65

length_ref = bpy.data.objects["length_reference"]

with open('./air-quality-data-in-india/city_day (cleaned-up).csv', newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        city = row['City']
        value = row['O3']

        bar = bpy.data.objects[city+'_bar']        
        flag = 0
        try:    
            float(value)
        except:
            flag = 1
            pass
        
        if(flag==0):
            value = float(value)
                
            bar.scale[1] = value * min_value / max_value
            
            if (bar.scale[1] >= max_in_camera_value_scale):
                delta_perc = 1 - max_in_camera_value_scale - bar.scale[1]
            else:
                delta_perc = 1
            length_ref.scale[1]=delta_perc
            length_ref.keyframe_insert(data_path='scale',frame=cur_frame)
            
            
            
            bar.keyframe_insert(data_path='scale', frame=cur_frame)
            
            color_start = (0.0, 0.0, get_o3_naqi_category(value)/6, 0.0)  # Red (RGBA)
            bar.color = color_start
            bar.keyframe_insert(data_path="color", frame=cur_frame)

        
        cur_frame += 2

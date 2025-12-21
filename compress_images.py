from PIL import Image
import os

# 设置图片目录
image_dir = 'images'

# 获取所有图片文件
image_files = [f for f in os.listdir(image_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]

# 压缩超过500KB的图片
for image_file in image_files:
    image_path = os.path.join(image_dir, image_file)
    size_kb = os.path.getsize(image_path) / 1024
    
    if size_kb > 500:
        print(f'Compressing {image_file} ({size_kb:.2f} KB)...')
        
        # 打开图片
        img = Image.open(image_path)
        
        # 调整尺寸（保持宽高比）
        max_dimension = 1200
        width, height = img.size
        if width > max_dimension or height > max_dimension:
            ratio = min(max_dimension / width, max_dimension / height)
            new_width = int(width * ratio)
            new_height = int(height * ratio)
            img = img.resize((new_width, new_height), Image.LANCZOS)
        
        # 保存压缩后的图片
        if image_file.lower().endswith('.png'):
            img.save(image_path, 'PNG', optimize=True, quality=85)
        else:
            # 处理RGBA模式的图片，转换为RGB
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            img.save(image_path, 'JPEG', optimize=True, quality=85)
        
        new_size_kb = os.path.getsize(image_path) / 1024
        print(f'Compressed {image_file} from {size_kb:.2f} KB to {new_size_kb:.2f} KB ({(1 - new_size_kb/size_kb)*100:.1f}% reduction)')

print('All images processed!')

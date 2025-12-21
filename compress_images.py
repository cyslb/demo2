from PIL import Image, UnidentifiedImageError
import os

# 设置图片目录
image_dir = 'images'

# 获取所有图片文件
image_files = [f for f in os.listdir(image_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]

# 创建WebP目录
webp_dir = os.path.join(image_dir, 'webp')
if not os.path.exists(webp_dir):
    os.makedirs(webp_dir)

# 压缩所有图片
for image_file in image_files:
    image_path = os.path.join(image_dir, image_file)
    size_kb = os.path.getsize(image_path) / 1024
    
    try:
        print(f'Compressing {image_file} ({size_kb:.2f} KB)...')
        
        # 打开图片
        img = Image.open(image_path)
        
        # 调整尺寸（保持宽高比）
        max_dimension = 800  # 减小最大尺寸
        width, height = img.size
        if width > max_dimension or height > max_dimension:
            ratio = min(max_dimension / width, max_dimension / height)
            new_width = int(width * ratio)
            new_height = int(height * ratio)
            img = img.resize((new_width, new_height), Image.LANCZOS)
        
        # 保存压缩后的图片（JPG/PNG）
        if image_file.lower().endswith('.png'):
            img.save(image_path, 'PNG', optimize=True, quality=75)  # 降低质量
        else:
            # 处理RGBA模式的图片，转换为RGB
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            img.save(image_path, 'JPEG', optimize=True, quality=75)  # 降低质量
        
        # 创建WebP版本
        webp_filename = os.path.splitext(image_file)[0] + '.webp'
        webp_path = os.path.join(webp_dir, webp_filename)
        if img.mode == 'RGBA':
            img.save(webp_path, 'WEBP', optimize=True, quality=70)
        else:
            img.save(webp_path, 'WEBP', optimize=True, quality=70)
        
        new_size_kb = os.path.getsize(image_path) / 1024
        webp_size_kb = os.path.getsize(webp_path) / 1024
        print(f'Compressed {image_file} from {size_kb:.2f} KB to {new_size_kb:.2f} KB ({(1 - new_size_kb/size_kb)*100:.1f}% reduction)')
        print(f'Created WebP version: {webp_filename} ({webp_size_kb:.2f} KB, {(1 - webp_size_kb/size_kb)*100:.1f}% reduction)')
        
    except UnidentifiedImageError:
        print(f'Skipping invalid image: {image_file}')
    except Exception as e:
        print(f'Error processing {image_file}: {str(e)}')
        continue

print('All images processed!')

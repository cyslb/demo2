import http.server
import socketserver
import time

PORT = 8087

# 自定义请求处理器，添加图片缓存策略
class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    
    # 图片文件扩展名
    IMAGE_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.gif', '.webp')
    
    def end_headers(self):
        # 检查是否是图片文件
        if self.path.endswith(self.IMAGE_EXTENSIONS):
            # 设置缓存控制头：缓存1年
            self.send_header('Cache-Control', 'public, max-age=31536000')
            # 设置过期时间：1年后
            one_year_later = time.time() + 31536000
            self.send_header('Expires', time.strftime('%a, %d %b %Y %H:%M:%S GMT', time.gmtime(one_year_later)))
        
        # 调用父类的end_headers方法
        super().end_headers()

Handler = CustomHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()
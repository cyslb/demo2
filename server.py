# -*- coding: utf-8 -*-
import sys

if sys.version_info[0] < 3:
    import BaseHTTPServer
    import SimpleHTTPServer
    
    PORT = 8002
    
    Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
    httpd = BaseHTTPServer.HTTPServer(('', PORT), Handler)
    print("Server started on port %d" % PORT)
    print("Please visit http://localhost:%d" % PORT)
    httpd.serve_forever()
else:
    import http.server
    import socketserver
    
    PORT = 8002
    
    Handler = http.server.SimpleHTTPRequestHandler
    
    with socketserver.TCPServer(('', PORT), Handler) as httpd:
        print("Server started on port %d" % PORT)
        print("Please visit http://localhost:%d" % PORT)
        httpd.serve_forever()
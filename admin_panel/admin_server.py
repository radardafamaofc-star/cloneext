from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os

class AdminHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/licenses':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            with open('admin_panel/api/licenses.json', 'r') as f:
                self.wfile.write(f.read().encode())
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/licenses':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            new_license = json.loads(post_data)
            
            with open('admin_panel/api/licenses.json', 'r+') as f:
                data = json.load(f)
                data.append(new_license)
                f.seek(0)
                json.dump(data, f)
                f.truncate()
            
            self.send_response(200)
            self.end_headers()
            self.wfile.write(json.dumps(new_license).encode())

os.chdir('admin_panel')
server = HTTPServer(('0.0.0.0', 8000), AdminHandler)
print("Admin Panel running on port 8000")
server.serve_forever()

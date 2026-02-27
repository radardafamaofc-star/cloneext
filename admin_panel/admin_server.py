from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os
import sys

# Ensure we are in the correct directory relative to the script
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class AdminHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/licenses':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            try:
                with open('api/licenses.json', 'r') as f:
                    self.wfile.write(f.read().encode())
            except FileNotFoundError:
                self.wfile.write(b'[]')
        elif self.path.startswith('/api/validate/'):
            license_key = self.path.split('/')[-1]
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            valid = False
            try:
                with open('api/licenses.json', 'r') as f:
                    licenses = json.load(f)
                    for lic in licenses:
                        if lic.get('key') == license_key:
                            valid = True
                            break
            except (FileNotFoundError, json.JSONDecodeError):
                pass
                
            response = {'valid': valid}
            if valid:
                response['status'] = 'success'
                response['sessionToken'] = f"mock_token_{license_key}"
            else:
                response['status'] = 'error'
                response['message'] = 'Invalid license key'
                
            self.wfile.write(json.dumps(response).encode())
        else:
            return super().do_GET()

    def do_POST(self):
        if self.path == '/api/licenses':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                new_license = json.loads(post_data)
                
                if not os.path.exists('api'):
                    os.makedirs('api')
                
                licenses = []
                if os.path.exists('api/licenses.json'):
                    with open('api/licenses.json', 'r') as f:
                        try:
                            licenses = json.load(f)
                        except json.JSONDecodeError:
                            licenses = []
                
                licenses.append(new_license)
                with open('api/licenses.json', 'w') as f:
                    json.dump(licenses, f)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(new_license).encode())
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(str(e).encode())

if __name__ == '__main__':
    port = 8000
    server = HTTPServer(('0.0.0.0', port), AdminHandler)
    print(f"Admin Panel running on port {port}")
    server.serve_forever()

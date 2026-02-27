from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os
import sys
import zipfile
import io

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
        elif self.path == '/api/download-extension':
            # Create a ZIP of the extension_v2 folder
            memory_file = io.BytesIO()
            try:
                with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zf:
                    # Use absolute path or ensure correct relative path from the script's directory
                    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                    extension_path = os.path.join(base_dir, 'extension_v2')
                    
                    if not os.path.exists(extension_path):
                        raise FileNotFoundError(f"Directory not found: {extension_path}")
                        
                    for root, dirs, files in os.walk(extension_path):
                        for file in files:
                            file_path = os.path.join(root, file)
                            arcname = os.path.relpath(file_path, extension_path)
                            zf.write(file_path, arcname)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/zip')
                self.send_header('Content-Disposition', 'attachment; filename=lovable_extension.zip')
                self.end_headers()
                self.wfile.write(memory_file.getvalue())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(f"Error creating zip: {str(e)}".encode())
        else:
            return super().do_GET()

    def do_POST(self):
        if self.path == '/api/licenses':
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b'Empty body')
                return

            post_data = self.rfile.read(content_length)
            try:
                new_license = json.loads(post_data)
                
                # Ensure the 'api' directory exists relative to this script
                api_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'api')
                if not os.path.exists(api_dir):
                    os.makedirs(api_dir)
                
                license_file = os.path.join(api_dir, 'licenses.json')
                licenses = []
                if os.path.exists(license_file):
                    with open(license_file, 'r') as f:
                        try:
                            licenses = json.load(f)
                        except json.JSONDecodeError:
                            licenses = []
                
                # Check if key already exists
                key_exists = any(l.get('key') == new_license.get('key') for l in licenses)
                if not key_exists:
                    licenses.append(new_license)
                    with open(license_file, 'w') as f:
                        json.dump(licenses, f)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(new_license).encode())
            except Exception as e:
                print(f"Error in do_POST: {e}")
                self.send_response(500)
                self.end_headers()
                self.wfile.write(str(e).encode())
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not Found')

if __name__ == '__main__':
    port = 8000
    server = HTTPServer(('0.0.0.0', port), AdminHandler)
    print(f"Admin Panel running on port {port}")
    server.serve_forever()

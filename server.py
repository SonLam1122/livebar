import http.server
import socketserver
import os
import mimetypes
import urllib.parse

PORT = int(os.environ.get("PORT", 3000))
DEFAULT_TOKEN = "SSsss9xEp6B5GGMf0e1xHyFl56Tj2fqI"

# Ensure custom MIME types
mimetypes.add_type("model/gltf-binary", ".glb")
mimetypes.add_type("model/gltf+json", ".gltf")
mimetypes.add_type("image/webp", ".webp")
mimetypes.add_type("audio/mpeg", ".mp3")
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT_DIR)

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        parsed = urllib.parse.urlparse(path)
        pathname = urllib.parse.unquote(parsed.path)

        if pathname == "/dashboard" or pathname.startswith("/dashboard/"):
            pathname = "/dashboard.html"
        elif pathname == "/" or pathname == "":
            query = urllib.parse.parse_qs(parsed.query)
            if "token" in query:
                pathname = "/index.html"
            else:
                pathname = "/dashboard.html"

        if pathname == "/api/screens/cmta2zkpq00aokx08uyc7iys2" or pathname == "/api/screen":
            pathname = "/screen_data.json"
        elif pathname == "/api/screens":
            pathname = "/screens_data.json"
        elif pathname == "/api/gifts":
            pathname = "/gifts_data.json"

        return os.path.join(ROOT_DIR, pathname.lstrip("/"))

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
    print("=" * 52)
    print(f"🚀 TaoLiveTuongTac Local Python Server đang chạy tại:")
    print(f"👉 Bảng điều khiển Dashboard:")
    print(f"   http://localhost:{PORT}/dashboard")
    print(f"👉 Link Overlay OBS:")
    print(f"   http://localhost:{PORT}/?token={DEFAULT_TOKEN}")
    print("=" * 52)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nĐã dừng server.")

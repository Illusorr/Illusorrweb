"""Static server for site/. Reads PORT from the environment so the harness can
assign one, falling back to 8099 for manual use."""
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "site"
PORT = int(os.environ.get("PORT", "8099"))

class H(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(ROOT), **k)
    def log_message(self, *a):
        pass
    def end_headers(self):
        # correct types for the assets this site serves, and no caching while developing
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

H.extensions_map.update({
    ".webp": "image/webp", ".webm": "video/webm", ".glb": "model/gltf-binary",
    ".gltf": "model/gltf+json", ".wasm": "application/wasm",
    ".woff2": "font/woff2", ".woff": "font/woff", ".otf": "font/otf", ".ttf": "font/ttf",
})

print(f"serving {ROOT} on http://127.0.0.1:{PORT}", flush=True)
ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()

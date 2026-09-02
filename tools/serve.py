"""Static server for site/. Reads PORT from the environment so the harness can
assign one, falling back to 8099 for manual use."""
import gzip
import io
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "site"
PORT = int(os.environ.get("PORT", "8099"))

COMPRESS = (".html", ".css", ".js", ".json", ".svg", ".xml", ".txt")


class H(SimpleHTTPRequestHandler):
    """Compresses text like a real host does, so local timings mean something.
    Without this the browser pulls main.css at 181KB instead of ~38KB."""

    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(ROOT), **k)

    def send_head(self):
        path = self.translate_path(self.path)
        accepts = "gzip" in (self.headers.get("Accept-Encoding") or "")
        if accepts and os.path.isfile(path) and path.lower().endswith(COMPRESS):
            try:
                raw = open(path, "rb").read()
            except OSError:
                return super().send_head()
            body = gzip.compress(raw, 6)
            ctype = self.guess_type(path)
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Encoding", "gzip")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            return io.BytesIO(body)
        return super().send_head()
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

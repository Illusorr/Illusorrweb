"""Static server for site/ that also accumulates measurement results.

POST /_collect      merge a batch of measurements into tools/_slots.json
GET  /_done-pages   which pages are already measured, so a restarted sweep skips them

Merging on the server is what makes the sweep resumable: a crash costs only the
page in flight, not the run.
"""
import json
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
SLOTS = ROOT/"tools"/"_slots.json"
DONE  = ROOT/"tools"/"_slots-done.json"

def load(p, d):
    try: return json.loads(p.read_text(encoding="utf-8"))
    except Exception: return d

class H(SimpleHTTPRequestHandler):
    def __init__(self,*a,**k): super().__init__(*a, directory=str(ROOT/"site"), **k)
    def log_message(self,*a): pass

    def do_GET(self):
        if self.path == "/_done-pages":
            body = json.dumps(load(DONE, [])).encode()
            self.send_response(200); self.send_header("Content-Type","application/json")
            self.send_header("Content-Length",str(len(body))); self.end_headers()
            self.wfile.write(body); return
        return super().do_GET()

    def do_POST(self):
        if self.path != "/_collect": return self.send_error(404)
        n = int(self.headers.get("Content-Length",0))
        batch = json.loads(self.rfile.read(n) or b'{"assets":[],"pages":[]}')

        cur = {f'{a["kind"]}|{a["src"]}': a for a in load(SLOTS, [])}
        for a in batch.get("assets", []):
            k = f'{a["kind"]}|{a["src"]}'
            if k not in cur: cur[k] = a; continue
            c = cur[k]
            c["natW"] = max(c.get("natW",0), a.get("natW",0))
            c["natH"] = max(c.get("natH",0), a.get("natH",0))
            for w, dims in a.get("byWidth",{}).items():
                p = c["byWidth"].get(w, [0,0])
                c["byWidth"][w] = [max(p[0],dims[0]), max(p[1],dims[1])]
            c["pages"] = sorted(set(c.get("pages",[])) | set(a.get("pages",[])))
        SLOTS.write_text(json.dumps(list(cur.values()), indent=1), encoding="utf-8")

        done = set(load(DONE, [])) | set(batch.get("pages", []))
        DONE.write_text(json.dumps(sorted(done)), encoding="utf-8")

        self.send_response(200); self.send_header("Content-Length","2"); self.end_headers()
        self.wfile.write(b"ok")

ThreadingHTTPServer(("127.0.0.1",8099), H).serve_forever()

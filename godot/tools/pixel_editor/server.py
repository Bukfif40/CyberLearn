#!/usr/bin/env python3
"""Local dev server for the CyberLearn Pixel Forge editor.

Serves the editor's static files (index.html/style.css/editor.js) plus two
endpoints the frontend calls:

  POST /api/save     Writes a PNG (sent as a data URL) into
                      ../../assets/<category>/<filename>.
  POST /api/generate Calls an AI image provider for a starting "seed" image,
                      downsamples/quantizes it down to the requested pixel
                      grid, and returns it as base64 PNG for the editor to
                      load — you then refine it pixel by pixel.

No API key is bundled or committed. Configure a provider via environment
variables before starting:

  AI_PROVIDER=replicate REPLICATE_API_TOKEN=r8_... REPLICATE_MODEL_VERSION=<version-hash> python3 server.py
  AI_PROVIDER=openai    OPENAI_API_KEY=sk-...                                            python3 server.py

REPLICATE_MODEL_VERSION must be a version hash you copy from the model's
page on replicate.com (e.g. a pixel-art-tuned SDXL model) - there is
deliberately no hardcoded default, since pinned versions change over time
and a stale guess would just fail confusingly.

Run: python3 server.py [port]   (defaults to 8642)
"""
import base64
import io
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.abspath(os.path.join(ROOT, "..", "..", "assets"))
ALLOWED_CATEGORIES = {"sprites", "tiles"}
FILENAME_RE = re.compile(r"^[a-zA-Z0-9_\-]+\.png$")


def read_json(handler):
    length = int(handler.headers.get("Content-Length", 0))
    raw = handler.rfile.read(length)
    return json.loads(raw)


def send_json(handler, status, payload):
    body = json.dumps(payload).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def generate_replicate(prompt, api_key):
    model_version = os.environ.get("REPLICATE_MODEL_VERSION")
    if not model_version:
        raise RuntimeError(
            "REPLICATE_MODEL_VERSION is not set. Copy a version hash from the "
            "model's page on replicate.com (pick a pixel-art-tuned model) and "
            "set it as an environment variable."
        )
    req = urllib.request.Request(
        "https://api.replicate.com/v1/predictions",
        data=json.dumps({
            "version": model_version,
            "input": {
                "prompt": f"pixel art, {prompt}, transparent background, game asset, flat colors",
                "width": 512,
                "height": 512,
            },
        }).encode("utf-8"),
        headers={"Authorization": f"Token {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        prediction = json.loads(resp.read())

    poll_url = prediction["urls"]["get"]
    for _ in range(120):
        time.sleep(1)
        poll_req = urllib.request.Request(poll_url, headers={"Authorization": f"Token {api_key}"})
        with urllib.request.urlopen(poll_req, timeout=30) as resp:
            prediction = json.loads(resp.read())
        status = prediction["status"]
        if status == "succeeded":
            output = prediction["output"]
            image_url = output[0] if isinstance(output, list) else output
            with urllib.request.urlopen(image_url, timeout=30) as img_resp:
                return img_resp.read()
        if status in ("failed", "canceled"):
            raise RuntimeError(f"Replicate generation {status}: {prediction.get('error')}")
    raise RuntimeError("Replicate generation timed out")


def generate_openai(prompt, api_key):
    req = urllib.request.Request(
        "https://api.openai.com/v1/images/generations",
        data=json.dumps({
            "model": "gpt-image-1",
            "prompt": f"pixel art, {prompt}, flat colors, transparent background, game asset, no anti-aliasing, no gradients",
            "size": "1024x1024",
            "n": 1,
        }).encode("utf-8"),
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        body = json.loads(resp.read())
    b64 = body["data"][0]["b64_json"]
    return base64.b64decode(b64)


def generate_raw_image(prompt):
    provider = os.environ.get("AI_PROVIDER", "").lower()
    if provider == "replicate":
        api_key = os.environ.get("REPLICATE_API_TOKEN")
        if not api_key:
            raise RuntimeError("REPLICATE_API_TOKEN is not set")
        return generate_replicate(prompt, api_key)
    if provider == "openai":
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY is not set")
        return generate_openai(prompt, api_key)
    raise RuntimeError(
        "No AI provider configured. Set AI_PROVIDER=replicate|openai and the "
        "matching API key env var before starting the server."
    )


def pixelate_to_grid(raw_bytes, size):
    """Box-downsample then lightly quantize so the seed already reads as
    flat-color pixel art instead of a blurry photo-miniature."""
    img = Image.open(io.BytesIO(raw_bytes)).convert("RGBA")
    alpha = img.resize((size, size), Image.NEAREST).split()[3]

    rgb = img.convert("RGB").resize((size, size), Image.BOX)
    quant = rgb.quantize(colors=24, method=Image.MEDIANCUT).convert("RGBA")
    quant.putalpha(alpha)

    out = io.BytesIO()
    quant.save(out, format="PNG")
    return out.getvalue()


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print("[pixel-forge]", fmt % args)

    def do_GET(self):
        path = self.path.split("?")[0]
        if path == "/":
            path = "/index.html"
        safe_path = os.path.normpath(path).lstrip("/")
        full_path = os.path.join(ROOT, safe_path)
        if not full_path.startswith(ROOT) or not os.path.isfile(full_path):
            self.send_response(404)
            self.end_headers()
            return
        ctype = "text/html"
        if full_path.endswith(".js"):
            ctype = "application/javascript"
        elif full_path.endswith(".css"):
            ctype = "text/css"
        with open(full_path, "rb") as f:
            data = f.read()
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        if self.path == "/api/save":
            return self.handle_save()
        if self.path == "/api/generate":
            return self.handle_generate()
        send_json(self, 404, {"error": "not found"})

    def handle_save(self):
        try:
            payload = read_json(self)
            category = payload.get("category")
            filename = payload.get("filename", "")
            data_url = payload.get("dataUrl", "")
            if category not in ALLOWED_CATEGORIES:
                raise ValueError("invalid category")
            if not FILENAME_RE.match(filename):
                raise ValueError("filename must be alphanumeric/underscore/hyphen and end in .png")
            if not data_url.startswith("data:image/png;base64,"):
                raise ValueError("expected a PNG data URL")
            raw = base64.b64decode(data_url.split(",", 1)[1])

            out_dir = os.path.join(ASSETS_DIR, category)
            os.makedirs(out_dir, exist_ok=True)
            out_path = os.path.join(out_dir, filename)
            with open(out_path, "wb") as f:
                f.write(raw)

            send_json(self, 200, {"path": os.path.relpath(out_path, os.path.join(ROOT, "..", ".."))})
        except Exception as e:
            send_json(self, 400, {"error": str(e)})

    def handle_generate(self):
        try:
            payload = read_json(self)
            prompt = payload.get("prompt", "")
            size = int(payload.get("size", 32))
            if not prompt:
                raise ValueError("prompt is required")
            raw = generate_raw_image(prompt)
            png_bytes = pixelate_to_grid(raw, size)
            send_json(self, 200, {"image_base64": base64.b64encode(png_bytes).decode("ascii")})
        except urllib.error.HTTPError as e:
            send_json(self, 400, {"error": f"provider HTTP {e.code}: {e.read().decode(errors='replace')[:300]}"})
        except Exception as e:
            send_json(self, 400, {"error": str(e)})


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8642
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"Pixel Forge running at http://127.0.0.1:{port}")
    provider = os.environ.get("AI_PROVIDER", "")
    print(f"AI provider: {provider or 'none configured (AI Seed button will error until set)'}")
    server.serve_forever()


if __name__ == "__main__":
    main()

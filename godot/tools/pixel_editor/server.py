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

No API key is bundled or committed. Provider defaults to openai; configure
via environment variables before starting:

  OPENAI_API_KEY=sk-...                                                                  python3 server.py
  AI_PROVIDER=replicate REPLICATE_API_TOKEN=r8_... REPLICATE_MODEL_VERSION=<version-hash> python3 server.py
  AI_PROVIDER=comfyui python3 server.py
  AI_PROVIDER=huggingface HF_TOKEN=hf_...                                                python3 server.py

REPLICATE_MODEL_VERSION must be a version hash you copy from the model's
page on replicate.com (e.g. a pixel-art-tuned SDXL model) - there is
deliberately no hardcoded default, since pinned versions change over time
and a stale guess would just fail confusingly.

comfyui calls a local ComfyUI instance (default http://127.0.0.1:8188,
override with COMFYUI_URL) running an SDXL checkpoint + a pixel-art LoRA
(e.g. pixel-art-xl) - free, unlimited, no API key, runs on your own GPU.
Configure which checkpoint/LoRA to use if the defaults below don't match
what you've installed:

  AI_PROVIDER=comfyui COMFYUI_CHECKPOINT=sd_xl_base_1.0.safetensors COMFYUI_LORA=pixel-art-xl.safetensors python3 server.py

NOTE: the comfyui workflow graph below is written against ComfyUI's
documented API shape but has not been tested against a live instance in
this environment (no GPU available here) - if node names/inputs have
shifted in your ComfyUI version, or your checkpoint's file/LoRA are
named differently, expect to need one round of debugging against the
actual error message ComfyUI returns.

huggingface uses HuggingFace's hosted "Inference Providers" routing (not
your own GPU) to call the nerijs/pixel-art-xl model - needs `pip install
huggingface_hub` and a token from huggingface.co/settings/tokens. Pick
which underlying provider HF routes the call to with HF_PROVIDER
(default fal-ai, matching the model's own usage snippet on its HF page):

  AI_PROVIDER=huggingface HF_TOKEN=hf_... HF_PROVIDER=fal-ai python3 server.py

NOTE: in practice, fal-ai's hosted catalog may silently route to its own
generic base SDXL model instead of genuinely applying the requested
pixel-art-xl LoRA (observed: requests landing on
router.huggingface.co/fal-ai/fal-ai/fast-sdxl rather than the LoRA) -
treat huggingface's output as a rougher starting point than comfyui/
diffusers, which load the actual LoRA file themselves. Free-tier
monthly credits are also small and are shared across all Inference
Providers usage on your HF account.

diffusers runs SDXL + an LCM-LoRA (for fast ~8-step inference) + the
pixel-art-xl LoRA entirely in-process on your own GPU via HuggingFace's
`diffusers` library - no separate server (unlike comfyui), no API key,
no network calls after the models are first downloaded/cached. The
pipeline is loaded once, lazily, on the first "Generate seed" request
(this takes a minute or two), then stays resident in memory for every
request after that:

  AI_PROVIDER=diffusers python3 server.py

On a GPU with limited VRAM (e.g. 4-6GB laptop cards), the pipeline
defaults to diffusers' enable_model_cpu_offload(), which streams model
weights between CPU RAM and GPU VRAM as needed instead of loading the
full ~7GB pipeline onto the GPU at once - slower per-image, but fits
where a naive .to("cuda") would OOM. Set DIFFUSERS_CPU_OFFLOAD=0 to
disable this and force a full GPU load if you have plenty of VRAM.

By default this downloads SDXL's multi-file diffusers-format snapshot
from the Hub on first run (several GB, separate from any single-file
.safetensors checkpoint you may already have for e.g. ComfyUI). If
you'd rather reuse an already-downloaded single-file checkpoint and
skip that redundant download entirely, point DIFFUSERS_CHECKPOINT_FILE
at it:

  DIFFUSERS_CHECKPOINT_FILE=C:\path\to\sd_xl_base_1.0.safetensors AI_PROVIDER=diffusers python3 server.py

Needs `pip install diffusers transformers accelerate torch` (a CUDA
build of torch matching your GPU/driver) and the pixel-art-xl LoRA
weights file downloaded locally - see README.md for the full setup.
Override DIFFUSERS_MODEL_ID / DIFFUSERS_LCM_LORA / DIFFUSERS_PIXEL_LORA
/ DIFFUSERS_DEVICE / DIFFUSERS_STEPS / DIFFUSERS_GUIDANCE if your setup
differs from the defaults below.

Run: python3 server.py [port]   (defaults to 8642)
"""
import base64
import json
import os
import sys
import urllib.error
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ai_providers import generate_raw_image, pixelate_to_grid, save_generated_image  # noqa: E402

ROOT = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.abspath(os.path.join(ROOT, "..", "..", "assets"))
ALLOWED_CATEGORIES = {"sprites", "tiles"}


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


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print("[pixel-forge]", fmt % args)

    def do_GET(self):
        path = self.path.split("?")[0]
        if path == "/":
            path = "/index.html"
        # Strip the URL's leading forward slash before any OS-specific path
        # handling. On Windows, os.path.normpath("/index.html") produces
        # "\index.html", and .lstrip("/") doesn't touch that leading
        # backslash - then os.path.join(ROOT, "\index.html") resets to the
        # drive root ("C:\index.html") per Windows join semantics, giving a
        # 404 for every request. Stripping "/" from the raw URL first avoids
        # ever handing a leading-separator string to os.path.join.
        rel_path = path.lstrip("/")
        full_path = os.path.normpath(os.path.join(ROOT, rel_path))
        if not full_path.startswith(os.path.normpath(ROOT)) or not os.path.isfile(full_path):
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
            if not data_url.startswith("data:image/png;base64,"):
                raise ValueError("expected a PNG data URL")
            raw = base64.b64decode(data_url.split(",", 1)[1])

            out_path = save_generated_image(category, filename, raw, ASSETS_DIR, ALLOWED_CATEGORIES)

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
    provider = os.environ.get("AI_PROVIDER", "openai")
    print(f"AI provider: {provider}")
    server.serve_forever()


if __name__ == "__main__":
    main()

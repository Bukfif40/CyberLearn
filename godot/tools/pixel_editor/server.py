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

diffusers runs SDXL + an LCM-LoRA (for fast ~8-step inference) + the
pixel-art-xl LoRA entirely in-process on your own GPU via HuggingFace's
`diffusers` library - no separate server (unlike comfyui), no API key,
no network calls after the models are first downloaded/cached. The
pipeline is loaded once, lazily, on the first "Generate seed" request
(this takes a minute or two), then stays resident in GPU memory for
every request after that:

  AI_PROVIDER=diffusers python3 server.py

Needs `pip install diffusers transformers accelerate torch` (a CUDA
build of torch matching your GPU/driver) and the pixel-art-xl LoRA
weights file downloaded locally - see README.md for the full setup.
Override DIFFUSERS_MODEL_ID / DIFFUSERS_LCM_LORA / DIFFUSERS_PIXEL_LORA
/ DIFFUSERS_DEVICE / DIFFUSERS_STEPS / DIFFUSERS_GUIDANCE if your setup
differs from the defaults below.

Run: python3 server.py [port]   (defaults to 8642)
"""
import base64
import io
import json
import os
import random
import re
import sys
import time
import urllib.error
import urllib.parse
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
    # gpt-image-1 always returns b64_json and needs no response_format param;
    # older models (dall-e-3/dall-e-2) default to a "url" response and need
    # it set explicitly. gpt-image-1 also requires org verification on some
    # accounts - set OPENAI_IMAGE_MODEL=dall-e-3 as a fallback if it 403s.
    model = os.environ.get("OPENAI_IMAGE_MODEL", "gpt-image-1")
    payload = {
        "model": model,
        "prompt": f"pixel art, {prompt}, flat colors, transparent background, game asset, no anti-aliasing, no gradients",
        "size": "1024x1024",
        "n": 1,
    }
    if model != "gpt-image-1":
        payload["response_format"] = "b64_json"

    req = urllib.request.Request(
        "https://api.openai.com/v1/images/generations",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        body = json.loads(resp.read())
    b64 = body["data"][0]["b64_json"]
    return base64.b64decode(b64)


def _comfyui_workflow(prompt, checkpoint, lora, lora_strength):
    """A minimal SDXL + LoRA txt2img graph in ComfyUI's node-graph API
    format. Node numbering/wiring follows ComfyUI's standard default
    workflow shape (as exported via its "Save (API Format)" option)."""
    return {
        "4": {
            "class_type": "CheckpointLoaderSimple",
            "inputs": {"ckpt_name": checkpoint},
        },
        "10": {
            "class_type": "LoraLoader",
            "inputs": {
                "lora_name": lora,
                "strength_model": lora_strength,
                "strength_clip": lora_strength,
                "model": ["4", 0],
                "clip": ["4", 1],
            },
        },
        "5": {
            "class_type": "EmptyLatentImage",
            "inputs": {"width": 1024, "height": 1024, "batch_size": 1},
        },
        "6": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": f"pixel art, {prompt}, game asset, flat colors, no anti-aliasing",
                "clip": ["10", 1],
            },
        },
        "7": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": "blurry, photographic, 3d render, smooth gradient, anti-aliased",
                "clip": ["10", 1],
            },
        },
        "3": {
            "class_type": "KSampler",
            "inputs": {
                "seed": random.randint(0, 2 ** 32 - 1),
                "steps": 30,
                "cfg": 7.0,
                "sampler_name": "euler",
                "scheduler": "normal",
                "denoise": 1.0,
                "model": ["10", 0],
                "positive": ["6", 0],
                "negative": ["7", 0],
                "latent_image": ["5", 0],
            },
        },
        "8": {
            "class_type": "VAEDecode",
            "inputs": {"samples": ["3", 0], "vae": ["4", 2]},
        },
        "9": {
            "class_type": "SaveImage",
            "inputs": {"filename_prefix": "pixel_forge", "images": ["8", 0]},
        },
    }


def generate_comfyui(prompt):
    base_url = os.environ.get("COMFYUI_URL", "http://127.0.0.1:8188").rstrip("/")
    checkpoint = os.environ.get("COMFYUI_CHECKPOINT", "sd_xl_base_1.0.safetensors")
    lora = os.environ.get("COMFYUI_LORA", "pixel-art-xl.safetensors")
    lora_strength = float(os.environ.get("COMFYUI_LORA_STRENGTH", "1.0"))

    workflow = _comfyui_workflow(prompt, checkpoint, lora, lora_strength)
    req = urllib.request.Request(
        f"{base_url}/prompt",
        data=json.dumps({"prompt": workflow}).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            queued = json.loads(resp.read())
    except urllib.error.URLError as e:
        raise RuntimeError(
            f"Could not reach ComfyUI at {base_url} - is it running? ({e})"
        )
    prompt_id = queued["prompt_id"]

    for _ in range(180):
        time.sleep(1)
        with urllib.request.urlopen(f"{base_url}/history/{prompt_id}", timeout=30) as resp:
            history = json.loads(resp.read())
        entry = history.get(prompt_id)
        if not entry:
            continue
        outputs = entry.get("outputs", {})
        image_info = None
        for node_output in outputs.values():
            images = node_output.get("images")
            if images:
                image_info = images[0]
                break
        if image_info:
            params = urllib.parse.urlencode({
                "filename": image_info["filename"],
                "subfolder": image_info.get("subfolder", ""),
                "type": image_info.get("type", "output"),
            })
            with urllib.request.urlopen(f"{base_url}/view?{params}", timeout=30) as img_resp:
                return img_resp.read()
    raise RuntimeError("ComfyUI generation timed out")


def generate_huggingface(prompt, api_key):
    # Imported lazily so the other three providers don't require this
    # dependency to be installed.
    try:
        from huggingface_hub import InferenceClient
    except ImportError:
        raise RuntimeError(
            "huggingface_hub is not installed. Run: pip install huggingface_hub"
        )

    provider = os.environ.get("HF_PROVIDER", "fal-ai")
    client = InferenceClient(provider=provider, api_key=api_key)
    image = client.text_to_image(
        f"pixel art, {prompt}, game asset, flat colors, no anti-aliasing, transparent background",
        model="nerijs/pixel-art-xl",
    )
    out = io.BytesIO()
    image.save(out, format="PNG")
    return out.getvalue()


_diffusers_pipe = None


def _get_diffusers_pipeline():
    """Loads the SDXL + LCM-LoRA + pixel-art-xl pipeline once and caches it
    at module scope, since loading SDXL onto a GPU takes real time - we
    don't want to redo that on every single "Generate seed" click."""
    global _diffusers_pipe
    if _diffusers_pipe is not None:
        return _diffusers_pipe

    try:
        import torch
        from diffusers import DiffusionPipeline, LCMScheduler
    except ImportError:
        raise RuntimeError(
            "diffusers/torch are not installed. Run: pip install diffusers "
            "transformers accelerate torch (a CUDA build matching your GPU)"
        )

    model_id = os.environ.get("DIFFUSERS_MODEL_ID", "stabilityai/stable-diffusion-xl-base-1.0")
    lcm_lora_id = os.environ.get("DIFFUSERS_LCM_LORA", "latent-consistency/lcm-lora-sdxl")
    pixel_lora_path = os.environ.get(
        "DIFFUSERS_PIXEL_LORA", os.path.join(ROOT, "pixel-art-xl.safetensors")
    )
    device = os.environ.get("DIFFUSERS_DEVICE", "cuda")
    dtype = torch.float16 if device == "cuda" else torch.float32

    if device == "cuda" and not torch.cuda.is_available():
        raise RuntimeError(
            "DIFFUSERS_DEVICE=cuda but torch reports no CUDA GPU available. "
            "Set DIFFUSERS_DEVICE=cpu to run (much slower) or check your "
            "torch/driver install."
        )
    if not os.path.isfile(pixel_lora_path):
        raise RuntimeError(
            f"pixel-art-xl LoRA not found at {pixel_lora_path}. Download it "
            "and set DIFFUSERS_PIXEL_LORA to its path, or drop the file at "
            "that default location."
        )

    print(f"[pixel-forge] loading {model_id} on {device} (this can take a minute)...")
    load_kwargs = {"variant": "fp16"} if device == "cuda" else {}
    pipe = DiffusionPipeline.from_pretrained(model_id, **load_kwargs)
    pipe.scheduler = LCMScheduler.from_config(pipe.scheduler.config)

    pipe.load_lora_weights(lcm_lora_id, adapter_name="lora")
    pipe.load_lora_weights(pixel_lora_path, adapter_name="pixel")
    lcm_weight = float(os.environ.get("DIFFUSERS_LCM_WEIGHT", "1.0"))
    pixel_weight = float(os.environ.get("DIFFUSERS_PIXEL_WEIGHT", "1.2"))
    pipe.set_adapters(["lora", "pixel"], adapter_weights=[lcm_weight, pixel_weight])
    pipe.to(device=device, dtype=dtype)

    print("[pixel-forge] diffusers pipeline ready")
    _diffusers_pipe = pipe
    return pipe


def generate_diffusers(prompt):
    pipe = _get_diffusers_pipeline()
    steps = int(os.environ.get("DIFFUSERS_STEPS", "8"))
    guidance = float(os.environ.get("DIFFUSERS_GUIDANCE", "1.5"))
    image = pipe(
        prompt=f"pixel art, {prompt}, game asset, flat colors",
        negative_prompt="3d render, realistic, photographic, blurry, anti-aliased, smooth gradient",
        num_inference_steps=steps,
        guidance_scale=guidance,
    ).images[0]
    out = io.BytesIO()
    image.save(out, format="PNG")
    return out.getvalue()


def generate_raw_image(prompt):
    provider = os.environ.get("AI_PROVIDER", "openai").lower()
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
    if provider == "comfyui":
        return generate_comfyui(prompt)
    if provider == "huggingface":
        api_key = os.environ.get("HF_TOKEN")
        if not api_key:
            raise RuntimeError("HF_TOKEN is not set")
        return generate_huggingface(prompt, api_key)
    if provider == "diffusers":
        return generate_diffusers(prompt)
    raise RuntimeError(
        "No AI provider configured. Set AI_PROVIDER=replicate|openai|comfyui|huggingface|diffusers "
        "and the matching config before starting the server."
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
    provider = os.environ.get("AI_PROVIDER", "openai")
    print(f"AI provider: {provider}")
    server.serve_forever()


if __name__ == "__main__":
    main()

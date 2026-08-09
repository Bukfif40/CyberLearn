"""Shared AI image-generation providers, used by both Pixel Forge
(godot/tools/pixel_editor/) and Sheet Forge (godot/tools/sheet_forge/).

Extracted from pixel_editor/server.py so both tools share one copy of this
code instead of duplicating the ComfyUI workflow graph, the diffusers
CPU-offload setup, etc. See pixel_editor/server.py's module docstring (or
sheet_forge/backend/README.md) for full per-provider setup instructions and
environment variables - this module only holds the generation logic itself.
"""
import base64
import io
import json
import os
import random
import re
import time
import urllib.error
import urllib.parse
import urllib.request

from PIL import Image

FILENAME_RE = re.compile(r"^[a-zA-Z0-9_\-]+\.png$")


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
    don't want to redo that on every single generation request."""
    global _diffusers_pipe
    if _diffusers_pipe is not None:
        return _diffusers_pipe

    try:
        import torch
        from diffusers import DiffusionPipeline, StableDiffusionXLPipeline, LCMScheduler
    except ImportError:
        raise RuntimeError(
            "diffusers/torch are not installed. Run: pip install diffusers "
            "transformers accelerate torch (a CUDA build matching your GPU)"
        )

    model_id = os.environ.get("DIFFUSERS_MODEL_ID", "stabilityai/stable-diffusion-xl-base-1.0")
    checkpoint_file = os.environ.get("DIFFUSERS_CHECKPOINT_FILE")
    lcm_lora_id = os.environ.get("DIFFUSERS_LCM_LORA", "latent-consistency/lcm-lora-sdxl")
    pixel_lora_path = os.environ.get(
        "DIFFUSERS_PIXEL_LORA", os.path.join(os.path.dirname(os.path.abspath(__file__)), "pixel_editor", "pixel-art-xl.safetensors")
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

    if checkpoint_file:
        # Load the base model from an already-downloaded single-file
        # checkpoint (e.g. the same sd_xl_base_1.0.safetensors used by
        # ComfyUI) instead of re-downloading the multi-file diffusers-format
        # snapshot from the Hub - avoids a second multi-GB download.
        if not os.path.isfile(checkpoint_file):
            raise RuntimeError(f"DIFFUSERS_CHECKPOINT_FILE not found at {checkpoint_file}")
        print(f"[ai-providers] loading local checkpoint {checkpoint_file} on {device} (this can take a minute)...")
        pipe = StableDiffusionXLPipeline.from_single_file(checkpoint_file, torch_dtype=dtype)
    else:
        print(f"[ai-providers] loading {model_id} on {device} (this can take a minute)...")
        load_kwargs = {"torch_dtype": dtype}
        if device == "cuda":
            load_kwargs["variant"] = "fp16"
        pipe = DiffusionPipeline.from_pretrained(model_id, **load_kwargs)
    pipe.scheduler = LCMScheduler.from_config(pipe.scheduler.config)

    pipe.load_lora_weights(lcm_lora_id, adapter_name="lora")
    pipe.load_lora_weights(pixel_lora_path, adapter_name="pixel")
    lcm_weight = float(os.environ.get("DIFFUSERS_LCM_WEIGHT", "1.0"))
    pixel_weight = float(os.environ.get("DIFFUSERS_PIXEL_WEIGHT", "1.2"))
    pipe.set_adapters(["lora", "pixel"], adapter_weights=[lcm_weight, pixel_weight])

    # On a GPU with limited VRAM, loading the whole ~7GB pipeline onto it at
    # once (pipe.to(device)) will OOM. enable_model_cpu_offload() keeps
    # weights in CPU RAM and streams each submodule onto the GPU only while
    # it's actively running - diffusers' own well-established answer to
    # this, unlike ComfyUI's newer experimental disk-streaming path.
    default_offload = "1" if device == "cuda" else "0"
    cpu_offload = os.environ.get("DIFFUSERS_CPU_OFFLOAD", default_offload) == "1"
    if cpu_offload:
        pipe.enable_model_cpu_offload()
    else:
        pipe.to(device=device, dtype=dtype)

    print("[ai-providers] diffusers pipeline ready")
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
    """Box-downsample then lightly quantize so the result already reads as
    flat-color pixel art instead of a blurry photo-miniature."""
    img = Image.open(io.BytesIO(raw_bytes)).convert("RGBA")
    alpha = img.resize((size, size), Image.NEAREST).split()[3]

    rgb = img.convert("RGB").resize((size, size), Image.BOX)
    quant = rgb.quantize(colors=24, method=Image.MEDIANCUT).convert("RGBA")
    quant.putalpha(alpha)

    out = io.BytesIO()
    quant.save(out, format="PNG")
    return out.getvalue()


def save_generated_image(category, filename, raw_png_bytes, assets_dir, allowed_categories=("sprites", "tiles")):
    """Validates and writes a PNG into assets_dir/<category>/<filename>.
    Shared save-path validation (filename charset, category allow-list) used
    by both Pixel Forge and Sheet Forge, so the two tools can't drift apart
    on what's safe to write to disk."""
    if category not in allowed_categories:
        raise ValueError("invalid category")
    if not FILENAME_RE.match(filename):
        raise ValueError("filename must be alphanumeric/underscore/hyphen and end in .png")

    out_dir = os.path.join(assets_dir, category)
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, filename)
    with open(out_path, "wb") as f:
        f.write(raw_png_bytes)
    return out_path

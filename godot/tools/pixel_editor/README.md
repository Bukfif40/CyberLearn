# Pixel Forge

A from-scratch pixel-by-pixel sprite/tileset editor for CyberLearn Quest, with
an optional AI-generated starting seed. Runs entirely locally — no build step,
no npm dependencies.

## Run it

```
cd godot/tools/pixel_editor
python3 server.py
```

Then open http://127.0.0.1:8642/ in a browser. Requires Pillow (`pip install
Pillow`), which the rest of `godot/tools/` already depends on.

## Editing

- **Pencil / Eraser / Bucket Fill / Eyedropper / Line** — toolbar on the left,
  or press `P` `E` `F` `I` `L`.
- **Mirror X** — draw symmetric characters in half the strokes.
- **Undo/Redo** — `Ctrl+Z` / `Ctrl+Y`.
- **Import PNG** — load any existing sprite/tile (or an AI-generated seed) and
  it's resampled onto the current grid so you can keep refining it.
- **Save to project** — writes straight into `godot/assets/sprites/` or
  `godot/assets/tiles/` at your chosen export scale (1x/2x/4x nearest-neighbor
  upscale from the logical grid).

## AI-generated seed (optional)

The "AI Seed" panel asks the local server to call an image-generation
provider, then box-downsamples and lightly quantizes the result down to your
canvas's grid size so it starts out looking like flat-color pixel art instead
of a blurry miniature. You then refine it by hand, pixel by pixel — this is a
starting point, not a finished sprite.

No API key is bundled or committed. Set environment variables before starting
the server:

```
# Replicate (recommended - hosts models actually fine-tuned on pixel art)
AI_PROVIDER=replicate \
REPLICATE_API_TOKEN=r8_... \
REPLICATE_MODEL_VERSION=<version-hash-from-the-model's-replicate.com-page> \
python3 server.py

# OpenAI
AI_PROVIDER=openai OPENAI_API_KEY=sk-... python3 server.py

# OpenAI, if gpt-image-1 403s with an org-verification error on your account
AI_PROVIDER=openai OPENAI_API_KEY=sk-... OPENAI_IMAGE_MODEL=dall-e-3 python3 server.py

# ComfyUI (local, free, unlimited - needs a real GPU)
AI_PROVIDER=comfyui python3 server.py

# HuggingFace Inference Providers (hosted, needs a token, no local GPU)
AI_PROVIDER=huggingface HF_TOKEN=hf_... python3 server.py
```

`REPLICATE_MODEL_VERSION` has no default on purpose — pinned model versions
change over time, so copy the current one from the model's page on
replicate.com rather than trusting a hardcoded guess. Without a provider
configured, everything except the "Generate seed" button works normally.

### ComfyUI (local generation, no API key, no cost)

If you have a capable GPU, you can run pixel-art generation entirely on your
own machine instead of calling a paid API:

1. Download the ComfyUI portable Windows build from the official ComfyUI
   GitHub releases and run it — it starts a local server at
   `http://127.0.0.1:8188` by default.
2. Install a pixel-art-tuned SDXL model — e.g. `pixel-art-xl` (a LoRA by
   nerijs, available on HuggingFace/Civitai) plus a base SDXL checkpoint —
   into ComfyUI's `models/checkpoints` and `models/loras` folders.
3. Start Pixel Forge with `AI_PROVIDER=comfyui`. If your checkpoint/LoRA
   filenames differ from the defaults (`sd_xl_base_1.0.safetensors` /
   `pixel-art-xl.safetensors`), override them:
   ```
   AI_PROVIDER=comfyui COMFYUI_CHECKPOINT=<your-checkpoint> COMFYUI_LORA=<your-lora> python3 server.py
   ```

Note: the ComfyUI integration was written against ComfyUI's documented API
shape but hasn't been exercised against a live instance (no GPU available in
the environment that built it) — if it errors on your machine, the error
message from ComfyUI itself should point at what needs adjusting (a node
name, an input, a missing model file).

### HuggingFace (hosted, no GPU needed, needs a token)

If you don't have a GPU for ComfyUI, HuggingFace's "Inference Providers"
system will run the same `nerijs/pixel-art-xl` model on hosted hardware for
you:

1. `pip install huggingface_hub`.
2. Create a token at https://huggingface.co/settings/tokens (read access is
   enough) — do not commit it, pass it as an environment variable.
3. Start Pixel Forge with `AI_PROVIDER=huggingface HF_TOKEN=hf_...`. By
   default this routes through the `fal-ai` inference provider (matching the
   usage snippet on the model's own HuggingFace page); override with
   `HF_PROVIDER=<name>` if you'd rather route through a different provider
   HuggingFace supports for this model.

Note: like the ComfyUI integration, this was written against
`huggingface_hub`'s documented `InferenceClient.text_to_image()` API but
hasn't been exercised against a live call in the environment that built it
(no outbound access to huggingface.co from there) — a missing/invalid token
or an unsupported provider name should surface as a clear error from the
API itself.

### diffusers (local generation, no separate server, needs a real GPU)

If you have a capable GPU, this runs SDXL + an LCM-LoRA (for fast ~8-step
inference instead of the usual ~30) + the pixel-art-xl LoRA directly inside
`server.py` itself — no ComfyUI app to install and keep running separately:

1. `pip install diffusers transformers accelerate torch` — get a CUDA build
   of `torch` matching your GPU/driver from https://pytorch.org (the plain
   `pip install torch` may give you a CPU-only build).
2. Download the `pixel-art-xl.safetensors` LoRA weights file (nerijs'
   pixel-art-xl, available on HuggingFace/Civitai) and place it at
   `godot/tools/pixel_editor/pixel-art-xl.safetensors`, or point
   `DIFFUSERS_PIXEL_LORA` at wherever you saved it.
3. Start Pixel Forge with `AI_PROVIDER=diffusers`. The first "Generate seed"
   click loads the whole pipeline onto your GPU (a minute or two, one-time
   per server run) and every request after that is fast. Override
   `DIFFUSERS_MODEL_ID` / `DIFFUSERS_LCM_LORA` / `DIFFUSERS_DEVICE` /
   `DIFFUSERS_STEPS` / `DIFFUSERS_GUIDANCE` / `DIFFUSERS_LCM_WEIGHT` /
   `DIFFUSERS_PIXEL_WEIGHT` if you need something other than the defaults.

Note: this was written against `diffusers`' documented `DiffusionPipeline` +
`LCMScheduler` + multi-LoRA `set_adapters()` API but hasn't been exercised
against a live GPU in the environment that built it (no GPU available
there) — if it errors on your machine, the error from `diffusers`/`torch`
itself should point at what needs adjusting (a missing package, a CUDA
mismatch, a wrong LoRA path).

## Notes

- Filenames must be alphanumeric/underscore/hyphen and end in `.png` (enforced
  server-side before anything is written to disk).
- The server only serves files from this folder and only writes into
  `godot/assets/sprites/` or `godot/assets/tiles/` — it's a local dev tool,
  not something to expose beyond `127.0.0.1`.

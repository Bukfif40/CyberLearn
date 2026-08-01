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
```

`REPLICATE_MODEL_VERSION` has no default on purpose — pinned model versions
change over time, so copy the current one from the model's page on
replicate.com rather than trusting a hardcoded guess. Without a provider
configured, everything except the "Generate seed" button works normally.

## Notes

- Filenames must be alphanumeric/underscore/hyphen and end in `.png` (enforced
  server-side before anything is written to disk).
- The server only serves files from this folder and only writes into
  `godot/assets/sprites/` or `godot/assets/tiles/` — it's a local dev tool,
  not something to expose beyond `127.0.0.1`.

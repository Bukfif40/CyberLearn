# Sheet Forge

A batch AI generator for sprite sheets and tilesets — one prompt produces a
whole walk-cycle sheet or a matching set of tile variants in one go, instead
of Pixel Forge's one-image-per-click "AI Seed" workflow. Use **Pixel Forge**
(`godot/tools/pixel_editor/`) for single-image generation and manual
pixel-level editing; use **Sheet Forge** when you want a whole set at once.

## Why one generation call per sheet, not one per frame

Independently generating each frame of a walk cycle and hoping the character
looks the same across all of them doesn't work reliably with today's models
(the "character consistency" problem). Instead, Sheet Forge asks for the
**whole grid in a single image** — one prompt describing all rows/columns at
once — then slices it deterministically afterward. This is the same
technique that produced the real sheets already sitting in
`godot/assets/generated/` (`player_walk_v2.png` etc.) before the tool that
made them was lost; Sheet Forge is a proper rebuild of that capability,
matching the exact metadata schema those files already established.

## Run it

**Backend** (FastAPI):
```
cd godot/tools/sheet_forge/backend
pip install -r requirements.txt
AI_PROVIDER=openai OPENAI_API_KEY=sk-... uvicorn main:app --port 8643
```
Same 5 providers as Pixel Forge (`openai` / `replicate` / `comfyui` /
`huggingface` / `diffusers`), configured the same way via environment
variables at startup — see `godot/tools/ai_providers.py` and
`godot/tools/pixel_editor/README.md` for full per-provider setup and the
honest caveats already learned about each one:
- **comfyui**: free/local but needs a real GPU; its low-VRAM disk-streaming
  path has hit a genuine bug on at least one 4GB-VRAM laptop card.
- **huggingface**: hosted, but the free tier's monthly credits are small,
  and in practice the `fal-ai` routing has been observed silently
  substituting its own generic base model instead of applying the
  requested `pixel-art-xl` LoRA.
- **diffusers**: free/local, needs a CUDA build of `torch` (not the default
  CPU-only `pip install torch`) and defaults to CPU-offloading for GPUs
  under ~8GB VRAM — slower, but avoids OOMing.
- **openai** / **replicate**: reliable, but cost real money per generation
  and scale with how many tiles/sheets you generate in a batch.

Run the backend's own test suite (offline, no real API/GPU calls — the
provider call is mocked):
```
python3 -m unittest test_main
```

**Frontend** (React + Vite, separate from the unrelated Expo/React Native
app at the repo root — this has its own `package.json`):
```
cd godot/tools/sheet_forge/frontend
npm install
npm run dev
```
Open the URL Vite prints (default `http://localhost:5173`).

Known limitation: this frontend pins Vite 5.x, which has a known dev-server
CORS advisory (a malicious website open in your browser could in principle
query the Vite dev server while it's running) — the real fix requires a
breaking major-version jump to Vite 6+. Same posture as the rest of this
project's local dev tools: not meant to be exposed beyond your own machine,
only run it while you're actively using it, close it when you're done.

## What each mode does

- **Walk-Cycle Sheet**: character name + description → one generation call
  produces the full grid (default 4 columns × 4 rows, 48×48px frames,
  matching `player_walk_v2`'s proven dimensions) → sliced into
  `frame_regions` → saved as `godot/assets/generated/<name>.png` +
  `<name>.metadata.json`, matching the existing schema exactly.
- **Tileset Batch**: a style prompt + a list of variants (e.g. "grass",
  "water", "dirt path") → one generation call per variant (a failure in one
  doesn't abort the rest), palette-locked together afterward so the set
  reads as one cohesive tileset → saved as standalone files in
  `godot/assets/tiles/`, matching that folder's existing convention.

## Explicitly out of scope (for now)

- LibreSprite/Aseprite export formats
- Deeper Godot editor integration beyond writing files into `godot/assets/`
- True multi-generation character-consistency techniques (ControlNet,
  IP-Adapter) — the single-shot full-sheet-prompt approach above is the
  proven, tractable technique for this project; revisit only if it turns
  out not to be good enough in practice.

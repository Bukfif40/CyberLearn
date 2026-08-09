"""Sheet Forge backend: batch AI sprite-sheet / tileset generation.

Separate from Pixel Forge (godot/tools/pixel_editor/), which does
single-image generation + manual pixel editing. Sheet Forge does ONE
generation call per whole sheet/tile instead of one image per click -
see this repo's plan history for why (character-consistency across
independently-generated frames is unreliable; a single prompt describing
the whole grid, sliced afterward, is what's already worked for the real
assets sitting in godot/assets/generated/).

Run:
  cd godot/tools/sheet_forge/backend
  pip install -r requirements.txt
  AI_PROVIDER=openai OPENAI_API_KEY=sk-... uvicorn main:app --port 8643

Same AI_PROVIDER options as Pixel Forge (openai/replicate/comfyui/
huggingface/diffusers) - see godot/tools/ai_providers.py and
godot/tools/pixel_editor/README.md for full per-provider setup and the
honest caveats already learned about each (comfyui's low-VRAM streaming
bug, huggingface's small free tier and LoRA-substitution behavior,
diffusers needing a CUDA torch build). Provider config is read from
environment variables at server startup, same as Pixel Forge - not
passed per-request, so no API key ever needs to touch the frontend.
"""
import base64
import io
import json
import os
import sys

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
from pydantic import BaseModel

_TOOLS_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, _TOOLS_DIR)
from ai_providers import generate_raw_image, save_generated_image  # noqa: E402

GODOT_DIR = os.path.dirname(_TOOLS_DIR)
ASSETS_DIR = os.path.join(GODOT_DIR, "assets")
ALLOWED_CATEGORIES = {"generated", "sprites", "tiles"}

app = FastAPI(title="Sheet Forge")

# Local dev tool only - restrict to the Vite dev server's origin, not a
# wildcard, matching Pixel Forge's "not for exposing beyond 127.0.0.1" stance.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["POST"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_error_handler(request: Request, exc: HTTPException):
    # FastAPI's default HTTPException body is {"detail": ...} - override to
    # {"error": ...} so the response shape matches Pixel Forge's
    # server.py convention and the frontend's error-reading code.
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})


@app.exception_handler(Exception)
async def generation_error_handler(request: Request, exc: Exception):
    # Belt-and-suspenders fallback for anything that isn't already caught
    # and re-raised as an HTTPException below (the endpoints' own
    # try/except is the primary path - HTTPException has guaranteed,
    # well-tested interaction with CORSMiddleware, unlike relying solely
    # on a handler for the bare Exception class, which was observed NOT
    # reliably producing a CORS-safe response when a provider call raised
    # from inside FastAPI's threadpool).
    return JSONResponse(status_code=400, content={"error": str(exc)})


class WalkCycleRequest(BaseModel):
    character_name: str
    prompt: str
    columns: int = 4
    rows: int = 4
    frame_width: int = 48
    frame_height: int = 48


class TilesetRequest(BaseModel):
    style_prompt: str
    variants: list[str]
    tile_size: int = 32


class SaveRequest(BaseModel):
    category: str
    filename: str
    image_base64: str
    metadata: dict | None = None


def _quantize_with_alpha(img: Image.Image, size: tuple[int, int], colors: int, palette_source: Image.Image | None = None) -> Image.Image:
    """Box-resize to `size`, quantize RGB to a flat palette, and preserve
    alpha via a separately (nearest-neighbor) resized mask - same technique
    as ai_providers.pixelate_to_grid, generalized to a non-square target
    size and an optional shared palette for batch consistency."""
    img = img.convert("RGBA")
    alpha = img.resize(size, Image.NEAREST).split()[3]
    rgb = img.convert("RGB").resize(size, Image.BOX)
    if palette_source is not None:
        quant = rgb.quantize(palette=palette_source, dither=Image.NONE).convert("RGBA")
    else:
        quant = rgb.quantize(colors=colors, method=Image.MEDIANCUT).convert("RGBA")
    quant.putalpha(alpha)
    return quant


def _png_b64(img: Image.Image) -> str:
    out = io.BytesIO()
    img.save(out, format="PNG")
    return base64.b64encode(out.getvalue()).decode("ascii")


@app.post("/api/walkcycle/generate")
def generate_walkcycle(req: WalkCycleRequest):
    try:
        sheet_w, sheet_h = req.columns * req.frame_width, req.rows * req.frame_height

        full_prompt = (
            f"top-down RPG character sprite sheet, {req.prompt}. "
            f"Grid of {req.rows} rows x {req.columns} columns, one direction per "
            f"row, each row showing {req.columns} distinct walk-cycle frames "
            f"with actual leg and arm movement (not the same pose repeated). "
            f"Clean pixel art, flat colors, 1-pixel black outlines, transparent "
            f"background, uniform frame size, frames aligned to an exact grid."
        )

        raw = generate_raw_image(full_prompt)
        sheet = _quantize_with_alpha(Image.open(io.BytesIO(raw)), (sheet_w, sheet_h), colors=32)

        frame_regions = []
        for row in range(req.rows):
            for col in range(req.columns):
                frame_regions.append({
                    "x": col * req.frame_width,
                    "y": row * req.frame_height,
                    "w": req.frame_width,
                    "h": req.frame_height,
                })

        metadata = {
            "animation_name": "four_angle_walking" if req.rows == 4 else "walking",
            "animation_style": "four_angle_walking" if req.rows == 4 else "walking",
            "animation_type": "",
            "columns": req.columns,
            "directions": [f"row_{i + 1}" for i in range(req.rows)],
            "frame_count": req.columns * req.rows,
            "frame_height": req.frame_height,
            "frame_paths": [],
            "frame_regions": frame_regions,
            "frame_width": req.frame_width,
            "name": req.character_name,
            "prompt": full_prompt,
            "rows": req.rows,
            "source_image": "",
            "source_tool": "sheet_forge",
            "spritesheet_height": sheet_h,
            "spritesheet_path": f"res://assets/generated/{req.character_name}.png",
            "spritesheet_width": sheet_w,
            "type": "animation",
        }

        return {"image_base64": _png_b64(sheet), "metadata": metadata}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/tileset/generate")
def generate_tileset(req: TilesetRequest):
    try:
        results = []
        raw_images = {}
        for variant in req.variants:
            try:
                raw = generate_raw_image(f"{req.style_prompt}, {variant} texture, seamless tileable")
                raw_images[variant] = Image.open(io.BytesIO(raw)).convert("RGBA")
            except Exception as e:
                results.append({"variant": variant, "image_base64": None, "error": str(e)})

        palette_source = None
        if raw_images:
            # Composite every successful tile side-by-side and quantize once,
            # so all tiles in the batch share one palette instead of each
            # picking its own colors independently - keeps the set visually
            # cohesive the way a hand-drawn tileset would be.
            strip = Image.new("RGB", (128 * len(raw_images), 128), "white")
            for i, img in enumerate(raw_images.values()):
                strip.paste(img.convert("RGB").resize((128, 128), Image.BOX), (i * 128, 0))
            palette_source = strip.quantize(colors=48, method=Image.MEDIANCUT)

        for variant, img in raw_images.items():
            try:
                tile = _quantize_with_alpha(img, (req.tile_size, req.tile_size), colors=24, palette_source=palette_source)
                results.append({"variant": variant, "image_base64": _png_b64(tile), "error": None})
            except Exception as e:
                results.append({"variant": variant, "image_base64": None, "error": str(e)})

        return {"tiles": results}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/save")
def save(req: SaveRequest):
    try:
        raw = base64.b64decode(req.image_base64)
        out_path = save_generated_image(req.category, req.filename, raw, ASSETS_DIR, ALLOWED_CATEGORIES)

        if req.metadata is not None:
            meta_path = os.path.splitext(out_path)[0] + ".metadata.json"
            with open(meta_path, "w") as f:
                json.dump(req.metadata, f, indent=1)

        return {"path": os.path.relpath(out_path, GODOT_DIR)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

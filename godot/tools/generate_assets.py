#!/usr/bin/env python3
"""Generates the pixel-art tile and sprite PNGs for CyberLearn Quest.

Draws each asset on a 32x32 logical canvas with multi-tone shading (light/
base/dark per material, plus an outline), then upscales with nearest-
neighbor to 64x64 so the pixels stay crisp. Colors match the badge colors
already defined in autoload/GameManager.gd.
"""

from PIL import Image, ImageDraw
import os

LOGICAL = 32
SCALE = 2
FINAL = LOGICAL * SCALE

TILES_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "tiles")
SPRITES_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "sprites")

OUTLINE = (9, 9, 13, 255)
SKIN = (222, 180, 135, 255)


def canvas():
    return Image.new("RGBA", (LOGICAL, LOGICAL), (0, 0, 0, 0))


def save(img: Image.Image, path: str) -> None:
    upscaled = img.resize((FINAL, FINAL), Image.NEAREST)
    upscaled.save(path)
    print(f"wrote {path} ({FINAL}x{FINAL})")


def adjust(color, factor):
    r, g, b, a = color
    if factor >= 1:
        t = factor - 1
        r = r + (255 - r) * t
        g = g + (255 - g) * t
        b = b + (255 - b) * t
    else:
        r *= factor
        g *= factor
        b *= factor
    return (
        max(0, min(255, int(r))),
        max(0, min(255, int(g))),
        max(0, min(255, int(b))),
        a,
    )


# ---------------------------------------------------------------------------
# Tiles
# ---------------------------------------------------------------------------

def make_floor_tile() -> Image.Image:
    img = canvas()
    d = ImageDraw.Draw(img)
    base = (29, 35, 47, 255)
    light = adjust(base, 1.35)
    dark = adjust(base, 0.6)
    d.rectangle([0, 0, 31, 31], fill=base)

    # four bevelled deck panels, each with a light top/left edge and a
    # dark bottom/right edge to read as slightly recessed metal plating
    for px, py in [(1, 1), (17, 1), (1, 17), (17, 17)]:
        d.rectangle([px, py, px + 13, py + 13], outline=dark)
        d.line([(px, py), (px + 13, py)], fill=light)
        d.line([(px, py), (px, py + 13)], fill=light)
        # rivet
        d.point((px + 2, py + 2), fill=light)
        d.point((px + 11, py + 11), fill=dark)

    # tread-diamond speckle across the surface
    for cx, cy in [(8, 8), (24, 8), (8, 24), (24, 24), (16, 16)]:
        d.point((cx, cy), fill=light)
        d.point((cx + 1, cy + 1), fill=dark)

    return img


def make_wall_tile() -> Image.Image:
    img = canvas()
    d = ImageDraw.Draw(img)
    base = (17, 20, 27, 255)
    mortar = (10, 12, 16, 255)
    brick = (24, 28, 37, 255)
    brick_light = adjust(brick, 1.3)
    brick_dark = adjust(brick, 0.65)
    weathered = (34, 30, 28, 255)
    d.rectangle([0, 0, 31, 31], fill=base)

    brick_h = 7
    row = 0
    y = -1
    while y < 32:
        d.line([(0, y), (31, y)], fill=mortar)
        offset = 8 if row % 2 == 0 else 0
        x = -8 + offset
        while x < 32:
            x0, x1 = x + 1, x + 7
            if x1 >= 0 and x0 <= 31:
                cx0, cx1 = max(x0, 0), min(x1, 31)
                fill = weathered if (row, x) in [(1, 8), (3, -8)] else brick
                d.rectangle([cx0, y + 1, cx1, y + brick_h - 1], fill=fill)
                d.line([(cx0, y + 1), (cx1, y + 1)], fill=brick_light)
                d.line([(cx0, y + brick_h - 1), (cx1, y + brick_h - 1)], fill=brick_dark)
            x += 16
        y += brick_h
        row += 1

    return img


def make_road_tile() -> Image.Image:
    img = canvas()
    d = ImageDraw.Draw(img)
    base = (19, 22, 30, 255)
    speckle_light = (28, 32, 42, 255)
    speckle_dark = (13, 15, 20, 255)
    lane = (216, 180, 62, 255)
    lane_dark = adjust(lane, 0.7)
    d.rectangle([0, 0, 31, 31], fill=base)

    for px, py in [(3, 3), (26, 5), (6, 22), (24, 27), (14, 12), (5, 14), (22, 18), (10, 28)]:
        d.point((px, py), fill=speckle_light)
    for px, py in [(9, 6), (20, 9), (2, 18), (28, 14), (16, 25), (12, 2)]:
        d.point((px, py), fill=speckle_dark)

    # hairline crack for texture
    d.line([(4, 27), (7, 22), (6, 17)], fill=speckle_dark)

    # dashed centerline, worn two-tone paint; sized so tiles chain into a
    # continuous dash-gap-dash pattern along the road
    d.rectangle([3, 14, 18, 17], fill=lane)
    d.line([(3, 14), (18, 14)], fill=adjust(lane, 1.25))
    d.line([(3, 17), (18, 17)], fill=lane_dark)

    return img


# ---------------------------------------------------------------------------
# Characters (top-down chibi humanoid) and vehicle
# ---------------------------------------------------------------------------

def make_character(main_color, accessory="none") -> Image.Image:
    img = canvas()
    d = ImageDraw.Draw(img)

    base = main_color
    light = adjust(main_color, 1.4)
    dark = adjust(main_color, 0.6)
    hair = adjust(main_color, 0.45)
    hair_light = adjust(hair, 1.3)
    skin = SKIN
    skin_shadow = adjust(SKIN, 0.82)
    shoe = (26, 28, 35, 255)

    # ground shadow
    d.ellipse([6, 25, 25, 30], fill=(0, 0, 0, 70))

    # legs + shoes
    d.rectangle([11, 21, 14, 27], fill=dark, outline=OUTLINE)
    d.rectangle([17, 21, 20, 27], fill=dark, outline=OUTLINE)
    d.rounded_rectangle([9, 25, 15, 29], radius=1, fill=shoe, outline=OUTLINE)
    d.rounded_rectangle([16, 25, 22, 29], radius=1, fill=shoe, outline=OUTLINE)

    # arms + hands
    d.rounded_rectangle([3, 14, 8, 22], radius=2, fill=dark, outline=OUTLINE)
    d.rounded_rectangle([23, 14, 28, 22], radius=2, fill=dark, outline=OUTLINE)
    d.ellipse([3, 19, 8, 24], fill=skin, outline=OUTLINE)
    d.ellipse([23, 19, 28, 24], fill=skin, outline=OUTLINE)

    # torso garment with a highlight strip (left) and shadow strip (right)
    d.rounded_rectangle([8, 12, 23, 25], radius=3, fill=base, outline=OUTLINE)
    d.rectangle([9, 14, 11, 23], fill=light)
    d.rectangle([20, 14, 22, 23], fill=dark)

    if accessory == "collar":  # Kessler - mentor's blazer + badge pin
        d.polygon([(12, 12), (15, 17), (11, 17)], fill=dark)
        d.polygon([(19, 12), (16, 17), (20, 17)], fill=dark)
        d.ellipse([14, 18, 17, 21], fill=(255, 213, 110, 255), outline=OUTLINE)
    elif accessory == "apron":  # Mira - vendor's apron with a pocket
        d.rectangle([11, 15, 20, 24], fill=light, outline=OUTLINE)
        d.rectangle([13, 19, 18, 22], fill=dark)
    elif accessory == "hood":  # Player - hoodie drawstrings
        d.line([(13, 13), (12, 18)], fill=dark, width=1)
        d.line([(18, 13), (19, 18)], fill=dark, width=1)
        d.ellipse([11, 17, 13, 19], fill=hair_light, outline=OUTLINE)
        d.ellipse([18, 17, 20, 19], fill=hair_light, outline=OUTLINE)

    # head with a soft jaw shadow
    d.ellipse([9, 2, 22, 15], fill=skin, outline=OUTLINE)
    d.pieslice([9, 8, 22, 15], 0, 180, fill=skin_shadow)
    d.line([(9, 8), (22, 8)], fill=skin)

    # hair / cap
    d.pieslice([8, -1, 23, 11], 180, 360, fill=hair, outline=OUTLINE)
    d.line([(9, 4), (14, 2)], fill=hair_light)

    # eyes
    d.point((13, 9), fill=OUTLINE)
    d.point((18, 9), fill=OUTLINE)

    return img


def make_vehicle(main_color) -> Image.Image:
    img = canvas()
    d = ImageDraw.Draw(img)

    base = main_color
    light = adjust(main_color, 1.35)
    dark = adjust(main_color, 0.6)
    cab = adjust(main_color, 0.85)
    cab_light = adjust(cab, 1.3)
    glass = (150, 210, 230, 255)
    glass_light = adjust(glass, 1.2)
    wheel = (14, 15, 19, 255)
    hub = (70, 74, 84, 255)

    # ground shadow
    d.ellipse([2, 24, 30, 30], fill=(0, 0, 0, 60))

    # cargo body with shading
    d.rounded_rectangle([2, 7, 25, 23], radius=2, fill=base, outline=OUTLINE)
    d.rectangle([3, 8, 24, 10], fill=light)
    d.rectangle([3, 19, 24, 22], fill=dark)
    d.line([(3, 15), (24, 15)], fill=dark)

    # cab
    d.rounded_rectangle([22, 9, 29, 21], radius=2, fill=cab, outline=OUTLINE)
    d.rectangle([24, 11, 28, 16], fill=glass)
    d.line([(24, 11), (28, 11)], fill=glass_light)
    d.rectangle([22, 9, 29, 10], fill=cab_light)

    # wheels with hubcaps
    for wx, wy in [(5, 4), (5, 24), (16, 4), (16, 24)]:
        d.rectangle([wx, wy, wx + 5, wy + 3], fill=wheel, outline=OUTLINE)
        d.point((wx + 2, wy + 1), fill=hub)

    # lights
    d.point((29, 12), fill=(255, 232, 150, 255))
    d.point((29, 18), fill=(255, 232, 150, 255))
    d.point((2, 12), fill=(220, 60, 60, 255))
    d.point((2, 18), fill=(220, 60, 60, 255))

    return img


def main() -> None:
    os.makedirs(TILES_DIR, exist_ok=True)
    os.makedirs(SPRITES_DIR, exist_ok=True)

    save(make_floor_tile(), os.path.join(TILES_DIR, "floor_tile.png"))
    save(make_wall_tile(), os.path.join(TILES_DIR, "wall_tile.png"))
    save(make_road_tile(), os.path.join(TILES_DIR, "road_tile.png"))

    save(make_character((108, 92, 231, 255), "hood"), os.path.join(SPRITES_DIR, "player_sprite.png"))
    save(make_character((245, 158, 11, 255), "collar"), os.path.join(SPRITES_DIR, "kessler_sprite.png"))
    save(make_character((16, 185, 129, 255), "apron"), os.path.join(SPRITES_DIR, "mira_sprite.png"))
    save(make_vehicle((146, 152, 168, 255)), os.path.join(SPRITES_DIR, "vehicle_sprite.png"))


if __name__ == "__main__":
    main()

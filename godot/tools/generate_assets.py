#!/usr/bin/env python3
"""Generates the pixel-art tile and sprite PNGs for CyberLearn Quest.

Uses two techniques borrowed from the LPC (Liberated Pixel Cup) pixel-art
convention, without using any LPC assets themselves:

  1. Hue-shifted outlines: each shape is outlined with a darkened version
     of its own fill color rather than flat black, which is what gives
     hand-drawn pixel art its "painted" look instead of a sticker/clip-art
     look.
  2. Supersample + box-downsample anti-aliasing: everything is drawn at
     4x the logical resolution with hard (aliased) edges, then averaged
     down with a true box filter (via numpy, alpha-premultiplied to avoid
     dark fringing on transparent edges). This smooths curved silhouettes
     — heads, shoulders, wheels — while interior fills stay perfectly flat,
     which is the actual technique behind clean SNES/LPC-era sprite edges.

The final logical image is then upscaled with nearest-neighbor so the
result stays crisp, chunky pixel art rather than a blurry photo-resize.
"""

from PIL import Image, ImageDraw
import numpy as np
import os

LOGICAL = 32       # final logical pixel-art resolution
SUPER = 4          # supersampling factor while drawing
WORK = LOGICAL * SUPER
SCALE = 2          # final nearest-neighbor upscale
FINAL = LOGICAL * SCALE

TILES_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "tiles")
SPRITES_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "sprites")

SKIN = (222, 180, 135, 255)


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


def outline_of(color):
    """A darkened, hue-matched outline instead of flat black."""
    return adjust(color, 0.32)


class Canvas:
    """Draws at WORK resolution using LOGICAL-unit coordinates."""

    def __init__(self):
        self.img = Image.new("RGBA", (WORK, WORK), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.img)

    def _scale_xy(self, xy):
        return [c * SUPER for c in xy]

    def rectangle(self, box, fill=None, outline=None):
        self.d.rectangle(self._scale_xy(box), fill=fill, outline=outline, width=SUPER)

    def rounded_rectangle(self, box, radius, fill=None, outline=None):
        self.d.rounded_rectangle(self._scale_xy(box), radius=radius * SUPER, fill=fill, outline=outline, width=SUPER)

    def ellipse(self, box, fill=None, outline=None):
        self.d.ellipse(self._scale_xy(box), fill=fill, outline=outline, width=SUPER)

    def pieslice(self, box, start, end, fill=None, outline=None):
        self.d.pieslice(self._scale_xy(box), start, end, fill=fill, outline=outline, width=SUPER)

    def polygon(self, points, fill=None, outline=None):
        pts = [(x * SUPER, y * SUPER) for x, y in points]
        self.d.polygon(pts, fill=fill, outline=outline)

    def line(self, points, fill=None, width=1):
        pts = [(x * SUPER, y * SUPER) for x, y in points]
        self.d.line(pts, fill=fill, width=max(1, width * SUPER))

    def dot(self, x, y, color):
        self.d.rectangle([x * SUPER, y * SUPER, x * SUPER + SUPER - 1, y * SUPER + SUPER - 1], fill=color)


def downsample(canvas: Canvas) -> Image.Image:
    """Alpha-premultiplied box downsample from WORK to LOGICAL resolution."""
    arr = np.asarray(canvas.img, dtype=np.float32)
    alpha = arr[:, :, 3:4] / 255.0
    premult = arr.copy()
    premult[:, :, :3] *= alpha

    blocks = premult.reshape(LOGICAL, SUPER, LOGICAL, SUPER, 4).mean(axis=(1, 3))
    out_alpha_255 = blocks[:, :, 3:4]
    alpha_frac = out_alpha_255 / 255.0
    safe_alpha_frac = np.where(alpha_frac > 0.001, alpha_frac, 1.0)
    out_rgb = blocks[:, :, :3] / safe_alpha_frac
    out = np.concatenate([out_rgb, out_alpha_255], axis=2)
    out = np.clip(out, 0, 255).astype(np.uint8)
    return Image.fromarray(out, mode="RGBA")


def save(canvas: Canvas, path: str) -> None:
    logical_img = downsample(canvas)
    upscaled = logical_img.resize((FINAL, FINAL), Image.NEAREST)
    upscaled.save(path)
    print(f"wrote {path} ({FINAL}x{FINAL})")


# ---------------------------------------------------------------------------
# Tiles
# ---------------------------------------------------------------------------

def make_floor_tile() -> Canvas:
    c = Canvas()
    base = (29, 35, 47, 255)
    light = adjust(base, 1.35)
    dark = adjust(base, 0.6)
    c.rectangle([0, 0, 31, 31], fill=base)

    for px, py in [(1, 1), (17, 1), (1, 17), (17, 17)]:
        c.rectangle([px, py, px + 13, py + 13], outline=dark)
        c.line([(px, py), (px + 13, py)], fill=light)
        c.line([(px, py), (px, py + 13)], fill=light)
        c.dot(px + 2, py + 2, light)
        c.dot(px + 11, py + 11, dark)

    for cx, cy in [(8, 8), (24, 8), (8, 24), (24, 24), (16, 16)]:
        c.dot(cx, cy, light)
        c.dot(cx + 1, cy + 1, dark)

    return c


def make_wall_tile() -> Canvas:
    c = Canvas()
    base = (17, 20, 27, 255)
    mortar = (10, 12, 16, 255)
    brick = (24, 28, 37, 255)
    brick_light = adjust(brick, 1.3)
    brick_dark = adjust(brick, 0.65)
    weathered = (34, 30, 28, 255)
    c.rectangle([0, 0, 31, 31], fill=base)

    brick_h = 7
    row = 0
    y = -1
    while y < 32:
        c.line([(0, y), (31, y)], fill=mortar)
        offset = 8 if row % 2 == 0 else 0
        x = -8 + offset
        while x < 32:
            x0, x1 = x + 1, x + 7
            if x1 >= 0 and x0 <= 31:
                cx0, cx1 = max(x0, 0), min(x1, 31)
                fill = weathered if (row, x) in [(1, 8), (3, -8)] else brick
                c.rectangle([cx0, y + 1, cx1, y + brick_h - 1], fill=fill)
                c.line([(cx0, y + 1), (cx1, y + 1)], fill=brick_light)
                c.line([(cx0, y + brick_h - 1), (cx1, y + brick_h - 1)], fill=brick_dark)
            x += 16
        y += brick_h
        row += 1

    return c


def make_road_tile() -> Canvas:
    c = Canvas()
    base = (19, 22, 30, 255)
    speckle_light = (28, 32, 42, 255)
    speckle_dark = (13, 15, 20, 255)
    lane = (216, 180, 62, 255)
    lane_dark = adjust(lane, 0.7)
    c.rectangle([0, 0, 31, 31], fill=base)

    for px, py in [(3, 3), (26, 5), (6, 22), (24, 27), (14, 12), (5, 14), (22, 18), (10, 28)]:
        c.dot(px, py, speckle_light)
    for px, py in [(9, 6), (20, 9), (2, 18), (28, 14), (16, 25), (12, 2)]:
        c.dot(px, py, speckle_dark)

    c.line([(4, 27), (7, 22), (6, 17)], fill=speckle_dark)

    c.rectangle([3, 14, 18, 17], fill=lane)
    c.line([(3, 14), (18, 14)], fill=adjust(lane, 1.25))
    c.line([(3, 17), (18, 17)], fill=lane_dark)

    return c


# ---------------------------------------------------------------------------
# Characters (top-down chibi humanoid) and vehicle
# ---------------------------------------------------------------------------

def make_character(main_color, accessory="none") -> Canvas:
    c = Canvas()

    base = main_color
    light = adjust(main_color, 1.4)
    dark = adjust(main_color, 0.6)
    garment_outline = outline_of(main_color)
    hair = adjust(main_color, 0.45)
    hair_light = adjust(hair, 1.3)
    hair_outline = outline_of(hair)
    skin = SKIN
    skin_shadow = adjust(SKIN, 0.82)
    skin_outline = outline_of(SKIN)
    shoe = (26, 28, 35, 255)
    shoe_outline = outline_of(shoe)

    # ground shadow
    c.ellipse([6, 25, 25, 30], fill=(0, 0, 0, 70))

    # legs + shoes
    c.rectangle([11, 21, 14, 27], fill=dark, outline=garment_outline)
    c.rectangle([17, 21, 20, 27], fill=dark, outline=garment_outline)
    c.rounded_rectangle([9, 25, 15, 29], radius=1, fill=shoe, outline=shoe_outline)
    c.rounded_rectangle([16, 25, 22, 29], radius=1, fill=shoe, outline=shoe_outline)

    # arms + hands
    c.rounded_rectangle([3, 14, 8, 22], radius=2, fill=dark, outline=garment_outline)
    c.rounded_rectangle([23, 14, 28, 22], radius=2, fill=dark, outline=garment_outline)
    c.ellipse([3, 19, 8, 24], fill=skin, outline=skin_outline)
    c.ellipse([23, 19, 28, 24], fill=skin, outline=skin_outline)

    # torso garment with a highlight strip (left) and shadow strip (right)
    c.rounded_rectangle([8, 12, 23, 25], radius=3, fill=base, outline=garment_outline)
    c.rectangle([9, 14, 11, 23], fill=light)
    c.rectangle([20, 14, 22, 23], fill=dark)

    if accessory == "collar":  # Kessler - mentor's blazer + badge pin
        c.polygon([(12, 12), (15, 17), (11, 17)], fill=dark)
        c.polygon([(19, 12), (16, 17), (20, 17)], fill=dark)
        badge = (255, 213, 110, 255)
        c.ellipse([14, 18, 17, 21], fill=badge, outline=outline_of(badge))
    elif accessory == "apron":  # Mira - vendor's apron with a pocket
        c.rectangle([11, 15, 20, 24], fill=light, outline=garment_outline)
        c.rectangle([13, 19, 18, 22], fill=dark)
    elif accessory == "hood":  # Player - hoodie drawstrings
        c.line([(13, 13), (12, 18)], fill=dark, width=1)
        c.line([(18, 13), (19, 18)], fill=dark, width=1)
        c.ellipse([11, 17, 13, 19], fill=hair_light, outline=garment_outline)
        c.ellipse([18, 17, 20, 19], fill=hair_light, outline=garment_outline)

    # head with a soft jaw shadow
    c.ellipse([9, 2, 22, 15], fill=skin, outline=skin_outline)
    c.pieslice([9, 8, 22, 15], 0, 180, fill=skin_shadow)
    c.line([(9, 8), (22, 8)], fill=skin)

    # hair / cap
    c.pieslice([8, -1, 23, 11], 180, 360, fill=hair, outline=hair_outline)
    c.line([(9, 4), (14, 2)], fill=hair_light)

    # eyes
    c.dot(13, 9, garment_outline)
    c.dot(18, 9, garment_outline)

    return c


def make_vehicle(main_color) -> Canvas:
    c = Canvas()

    base = main_color
    light = adjust(main_color, 1.35)
    dark = adjust(main_color, 0.6)
    body_outline = outline_of(main_color)
    cab = adjust(main_color, 0.85)
    cab_light = adjust(cab, 1.3)
    cab_outline = outline_of(cab)
    glass = (150, 210, 230, 255)
    glass_light = adjust(glass, 1.2)
    wheel = (14, 15, 19, 255)
    wheel_outline = outline_of(wheel)
    hub = (70, 74, 84, 255)

    # ground shadow
    c.ellipse([2, 24, 30, 30], fill=(0, 0, 0, 60))

    # cargo body with shading
    c.rounded_rectangle([2, 7, 25, 23], radius=2, fill=base, outline=body_outline)
    c.rectangle([3, 8, 24, 10], fill=light)
    c.rectangle([3, 19, 24, 22], fill=dark)
    c.line([(3, 15), (24, 15)], fill=dark)

    # cab
    c.rounded_rectangle([22, 9, 29, 21], radius=2, fill=cab, outline=cab_outline)
    c.rectangle([24, 11, 28, 16], fill=glass)
    c.line([(24, 11), (28, 11)], fill=glass_light)
    c.rectangle([22, 9, 29, 10], fill=cab_light)

    # wheels with hubcaps
    for wx, wy in [(5, 4), (5, 24), (16, 4), (16, 24)]:
        c.rectangle([wx, wy, wx + 5, wy + 3], fill=wheel, outline=wheel_outline)
        c.dot(wx + 2, wy + 1, hub)

    # lights
    c.dot(29, 12, (255, 232, 150, 255))
    c.dot(29, 18, (255, 232, 150, 255))
    c.dot(2, 12, (220, 60, 60, 255))
    c.dot(2, 18, (220, 60, 60, 255))

    return c


# ---------------------------------------------------------------------------
# Player walk-cycle sheet
#
# Matches autoload/GameManager.gd's PLAYER_SPRITE config exactly: a 128x128
# sheet, 4 columns of 32x32 walk frames per row, row 0/1/2/3 = down/left/
# right/up. UIHelpers.try_make_player_sprite() slices it with
# Rect2(col*32, row*32, 32, 32) and builds walk_<dir>/idle_<dir>
# AnimatedSprite2D animations from it - idle reuses column 0 of each row.
# ---------------------------------------------------------------------------

# Per-phase vertical offset (logical px) for the "near" and "far" leg/arm in
# a front/back view walk cycle: contact-left, passing, contact-right, passing.
_WALK_PHASES_FRONT = {0: (0, 0), 1: (-1, 1), 2: (0, 0), 3: (1, -1)}
# Per-phase horizontal offset for the leading leg/arm in a side-profile view.
_WALK_PHASES_SIDE = {0: 0, 1: -2, 2: 0, 3: 2}


def make_player_front(main_color, phase, facing_up=False) -> Canvas:
    c = Canvas()
    base = main_color
    light = adjust(main_color, 1.4)
    dark = adjust(main_color, 0.6)
    garment_outline = outline_of(main_color)
    hair = adjust(main_color, 0.45)
    hair_light = adjust(hair, 1.3)
    hair_outline = outline_of(hair)
    skin = SKIN
    skin_shadow = adjust(SKIN, 0.82)
    skin_outline = outline_of(SKIN)
    shoe = (26, 28, 35, 255)
    shoe_outline = outline_of(shoe)

    leg_l_dy, leg_r_dy = _WALK_PHASES_FRONT[phase]
    arm_l_dy, arm_r_dy = -leg_l_dy, -leg_r_dy

    c.ellipse([6, 25, 25, 30], fill=(0, 0, 0, 70))

    c.rectangle([11, 21 + leg_l_dy, 14, 27 + leg_l_dy], fill=dark, outline=garment_outline)
    c.rectangle([17, 21 + leg_r_dy, 20, 27 + leg_r_dy], fill=dark, outline=garment_outline)
    c.rounded_rectangle([9, 25 + leg_l_dy, 15, 29 + leg_l_dy], radius=1, fill=shoe, outline=shoe_outline)
    c.rounded_rectangle([16, 25 + leg_r_dy, 22, 29 + leg_r_dy], radius=1, fill=shoe, outline=shoe_outline)

    c.rounded_rectangle([3, 14 + arm_l_dy, 8, 22 + arm_l_dy], radius=2, fill=dark, outline=garment_outline)
    c.rounded_rectangle([23, 14 + arm_r_dy, 28, 22 + arm_r_dy], radius=2, fill=dark, outline=garment_outline)
    c.ellipse([3, 19 + arm_l_dy, 8, 24 + arm_l_dy], fill=skin, outline=skin_outline)
    c.ellipse([23, 19 + arm_r_dy, 28, 24 + arm_r_dy], fill=skin, outline=skin_outline)

    c.rounded_rectangle([8, 12, 23, 25], radius=3, fill=base, outline=garment_outline)
    c.rectangle([9, 14, 11, 23], fill=light)
    c.rectangle([20, 14, 22, 23], fill=dark)

    if facing_up:
        # back of the hood, no face
        c.ellipse([9, 2, 22, 15], fill=hair, outline=hair_outline)
        c.line([(9, 6), (22, 6)], fill=hair_light)
    else:
        c.line([(13, 13), (12, 18)], fill=dark, width=1)
        c.line([(18, 13), (19, 18)], fill=dark, width=1)
        c.ellipse([11, 17, 13, 19], fill=hair_light, outline=garment_outline)
        c.ellipse([18, 17, 20, 19], fill=hair_light, outline=garment_outline)

        c.ellipse([9, 2, 22, 15], fill=skin, outline=skin_outline)
        c.pieslice([9, 8, 22, 15], 0, 180, fill=skin_shadow)
        c.line([(9, 8), (22, 8)], fill=skin)

        c.pieslice([8, -1, 23, 11], 180, 360, fill=hair, outline=hair_outline)
        c.line([(9, 4), (14, 2)], fill=hair_light)

        c.dot(13, 9, garment_outline)
        c.dot(18, 9, garment_outline)

    return c


def make_player_side(main_color, phase) -> Canvas:
    """Profile view facing left; the right row is this frame mirrored."""
    c = Canvas()
    base = main_color
    light = adjust(main_color, 1.4)
    dark = adjust(main_color, 0.6)
    garment_outline = outline_of(main_color)
    hair = adjust(main_color, 0.45)
    hair_outline = outline_of(hair)
    skin = SKIN
    skin_outline = outline_of(SKIN)
    shoe = (26, 28, 35, 255)
    shoe_outline = outline_of(shoe)

    step_dx = _WALK_PHASES_SIDE[phase]

    c.ellipse([9, 25, 24, 30], fill=(0, 0, 0, 70))

    # back (near-side) leg stays put
    c.rectangle([15, 21, 18, 27], fill=dark, outline=garment_outline)
    c.rounded_rectangle([14, 25, 19, 29], radius=1, fill=shoe, outline=shoe_outline)

    # trailing arm, swings opposite the front leg
    c.rounded_rectangle([18 - step_dx, 15, 22 - step_dx, 22], radius=2, fill=dark, outline=garment_outline)
    c.ellipse([18 - step_dx, 20, 23 - step_dx, 24], fill=skin, outline=skin_outline)

    c.rounded_rectangle([10, 12, 21, 25], radius=3, fill=base, outline=garment_outline)
    c.rectangle([11, 14, 13, 23], fill=light)
    c.rectangle([18, 14, 20, 23], fill=dark)

    # front leg, swings with the step
    c.rectangle([13 + step_dx, 21, 16 + step_dx, 27], fill=dark, outline=garment_outline)
    c.rounded_rectangle([11 + step_dx, 25, 17 + step_dx, 29], radius=1, fill=shoe, outline=shoe_outline)

    # leading arm, swings with the front leg
    c.rounded_rectangle([9 + step_dx, 15, 13 + step_dx, 22], radius=2, fill=dark, outline=garment_outline)
    c.ellipse([8 + step_dx, 20, 13 + step_dx, 24], fill=skin, outline=skin_outline)

    # profile head with a small nose bump toward the facing side
    c.ellipse([9, 2, 21, 15], fill=skin, outline=skin_outline)
    c.polygon([(8, 8), (5, 9), (8, 10)], fill=skin, outline=skin_outline)

    # hood covering the back of the head
    c.pieslice([9, -1, 22, 11], 200, 380, fill=hair, outline=hair_outline)
    c.rectangle([18, 4, 22, 9], fill=hair)

    c.dot(9, 9, garment_outline)

    return c


def make_player_sheet(main_color) -> Image.Image:
    frame = LOGICAL  # 32px per frame, matching PLAYER_SPRITE frame_width/height
    sheet = Image.new("RGBA", (frame * 4, frame * 4), (0, 0, 0, 0))

    for col in range(4):
        down_img = downsample(make_player_front(main_color, col, facing_up=False))
        sheet.paste(down_img, (col * frame, 0 * frame), down_img)

        left_img = downsample(make_player_side(main_color, col))
        sheet.paste(left_img, (col * frame, 1 * frame), left_img)

        right_img = left_img.transpose(Image.FLIP_LEFT_RIGHT)
        sheet.paste(right_img, (col * frame, 2 * frame), right_img)

        up_img = downsample(make_player_front(main_color, col, facing_up=True))
        sheet.paste(up_img, (col * frame, 3 * frame), up_img)

    return sheet


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

    player_sheet = make_player_sheet((108, 92, 231, 255))
    player_sheet_path = os.path.join(SPRITES_DIR, "player.png")
    player_sheet.save(player_sheet_path)
    print(f"wrote {player_sheet_path} ({player_sheet.width}x{player_sheet.height})")


if __name__ == "__main__":
    main()

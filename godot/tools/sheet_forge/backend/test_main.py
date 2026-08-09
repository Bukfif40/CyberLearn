"""Tests for the Sheet Forge backend. Run with: python3 -m unittest test_main

Monkeypatches ai_providers.generate_raw_image so these run offline, with no
real network/GPU calls - same spirit as the fixture-based approach used
elsewhere in this repo for provider-dependent code.
"""
import base64
import io
import os
import sys
import tempfile
import unittest
from unittest.mock import patch

from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import main as sheet_forge_main  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402


def _fake_png_bytes(size=(256, 256), color=(200, 50, 50, 255)):
    img = Image.new("RGBA", size, color)
    out = io.BytesIO()
    img.save(out, format="PNG")
    return out.getvalue()


class WalkCycleTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(sheet_forge_main.app, raise_server_exceptions=False)

    @patch("main.generate_raw_image")
    def test_generates_correct_grid_and_metadata(self, mock_gen):
        mock_gen.return_value = _fake_png_bytes()
        resp = self.client.post("/api/walkcycle/generate", json={
            "character_name": "test_hero",
            "prompt": "a chibi hero in a blue tunic",
            "columns": 4,
            "rows": 4,
            "frame_width": 48,
            "frame_height": 48,
        })
        self.assertEqual(resp.status_code, 200, resp.text)
        body = resp.json()

        # One generation call for the whole sheet, not one per frame.
        mock_gen.assert_called_once()

        meta = body["metadata"]
        self.assertEqual(meta["columns"], 4)
        self.assertEqual(meta["rows"], 4)
        self.assertEqual(meta["frame_count"], 16)
        self.assertEqual(meta["frame_width"], 48)
        self.assertEqual(meta["frame_height"], 48)
        self.assertEqual(meta["spritesheet_width"], 192)
        self.assertEqual(meta["spritesheet_height"], 192)
        self.assertEqual(meta["source_tool"], "sheet_forge")
        self.assertEqual(meta["type"], "animation")
        self.assertEqual(len(meta["frame_regions"]), 16)
        self.assertEqual(meta["frame_regions"][0], {"x": 0, "y": 0, "w": 48, "h": 48})
        self.assertEqual(meta["frame_regions"][1], {"x": 48, "y": 0, "w": 48, "h": 48})
        self.assertEqual(meta["frame_regions"][4], {"x": 0, "y": 48, "w": 48, "h": 48})
        self.assertEqual(meta["frame_regions"][-1], {"x": 144, "y": 144, "w": 48, "h": 48})
        self.assertEqual(meta["directions"], ["row_1", "row_2", "row_3", "row_4"])

        # Returned image actually decodes to the expected sheet dimensions.
        img_bytes = base64.b64decode(body["image_base64"])
        img = Image.open(io.BytesIO(img_bytes))
        self.assertEqual(img.size, (192, 192))

    @patch("main.generate_raw_image")
    def test_custom_grid_dimensions(self, mock_gen):
        mock_gen.return_value = _fake_png_bytes()
        resp = self.client.post("/api/walkcycle/generate", json={
            "character_name": "test_enemy",
            "prompt": "a glitchy trojan enemy",
            "columns": 3,
            "rows": 2,
            "frame_width": 32,
            "frame_height": 32,
        })
        self.assertEqual(resp.status_code, 200, resp.text)
        meta = resp.json()["metadata"]
        self.assertEqual(meta["frame_count"], 6)
        self.assertEqual(meta["spritesheet_width"], 96)
        self.assertEqual(meta["spritesheet_height"], 64)
        self.assertEqual(len(meta["frame_regions"]), 6)


class TilesetTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(sheet_forge_main.app, raise_server_exceptions=False)

    @patch("main.generate_raw_image")
    def test_generates_all_variants(self, mock_gen):
        mock_gen.side_effect = lambda prompt: _fake_png_bytes()
        resp = self.client.post("/api/tileset/generate", json={
            "style_prompt": "industrial dockyard floor tile",
            "variants": ["concrete", "rusty metal grate", "wet asphalt"],
            "tile_size": 32,
        })
        self.assertEqual(resp.status_code, 200, resp.text)
        tiles = resp.json()["tiles"]
        self.assertEqual(len(tiles), 3)
        for tile in tiles:
            self.assertIsNone(tile["error"])
            self.assertIsNotNone(tile["image_base64"])
            img = Image.open(io.BytesIO(base64.b64decode(tile["image_base64"])))
            self.assertEqual(img.size, (32, 32))

    @patch("main.generate_raw_image")
    def test_one_failure_does_not_abort_the_batch(self, mock_gen):
        def side_effect(prompt):
            if "water" in prompt:
                raise RuntimeError("provider exploded on this one")
            return _fake_png_bytes()

        mock_gen.side_effect = side_effect
        resp = self.client.post("/api/tileset/generate", json={
            "style_prompt": "terrain tile",
            "variants": ["grass", "water", "dirt path"],
            "tile_size": 32,
        })
        self.assertEqual(resp.status_code, 200, resp.text)
        tiles = {t["variant"]: t for t in resp.json()["tiles"]}
        self.assertIsNone(tiles["grass"]["error"])
        self.assertIsNotNone(tiles["grass"]["image_base64"])
        self.assertIsNotNone(tiles["water"]["error"])
        self.assertIsNone(tiles["water"]["image_base64"])
        self.assertIsNone(tiles["dirt path"]["error"])
        self.assertIsNotNone(tiles["dirt path"]["image_base64"])


class SaveTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(sheet_forge_main.app, raise_server_exceptions=False)
        self._tmpdir = tempfile.TemporaryDirectory()
        self._orig_assets_dir = sheet_forge_main.ASSETS_DIR
        sheet_forge_main.ASSETS_DIR = self._tmpdir.name

    def tearDown(self):
        sheet_forge_main.ASSETS_DIR = self._orig_assets_dir
        self._tmpdir.cleanup()

    def test_save_sheet_writes_png_and_metadata_sidecar(self):
        png_b64 = base64.b64encode(_fake_png_bytes()).decode("ascii")
        resp = self.client.post("/api/save", json={
            "category": "generated",
            "filename": "test_hero.png",
            "image_base64": png_b64,
            "metadata": {"name": "test_hero", "source_tool": "sheet_forge"},
        })
        self.assertEqual(resp.status_code, 200, resp.text)
        png_path = os.path.join(self._tmpdir.name, "generated", "test_hero.png")
        meta_path = os.path.join(self._tmpdir.name, "generated", "test_hero.metadata.json")
        self.assertTrue(os.path.isfile(png_path))
        self.assertTrue(os.path.isfile(meta_path))

    def test_save_tile_without_metadata(self):
        png_b64 = base64.b64encode(_fake_png_bytes()).decode("ascii")
        resp = self.client.post("/api/save", json={
            "category": "tiles",
            "filename": "grass.png",
            "image_base64": png_b64,
        })
        self.assertEqual(resp.status_code, 200, resp.text)
        self.assertTrue(os.path.isfile(os.path.join(self._tmpdir.name, "tiles", "grass.png")))
        self.assertFalse(os.path.isfile(os.path.join(self._tmpdir.name, "tiles", "grass.metadata.json")))

    def test_rejects_invalid_category(self):
        png_b64 = base64.b64encode(_fake_png_bytes()).decode("ascii")
        resp = self.client.post("/api/save", json={
            "category": "not_a_real_category",
            "filename": "x.png",
            "image_base64": png_b64,
        })
        self.assertEqual(resp.status_code, 400)


if __name__ == "__main__":
    unittest.main()

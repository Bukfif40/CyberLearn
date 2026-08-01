# Player sprite sheet

Drop the player sprite sheet here as `player.png`. The loader
(`UIHelpers.try_make_player_sprite`, config in `GameManager.PLAYER_SPRITE`)
expects a grid: **one row per facing direction**, with the same number of
walk-cycle frames (columns) in every row.

Default assumption (edit `GameManager.PLAYER_SPRITE` if your sheet differs):

| key           | default | meaning                              |
|---------------|---------|---------------------------------------|
| `frame_width`  | 32      | pixel width of one frame              |
| `frame_height` | 32      | pixel height of one frame             |
| `columns`      | 4       | walk frames per row                   |
| `row_down`     | 0       | row index facing the camera (down)    |
| `row_left`     | 1       | row index facing left                 |
| `row_right`    | 2       | row index facing right                |
| `row_up`       | 3       | row index facing away (up)            |
| `fps`          | 8.0     | walk animation playback speed         |

Column 0 of each row doubles as that direction's idle frame.

If `player.png` isn't present, `Main.gd` automatically falls back to the
placeholder purple "P" badge — nothing else breaks.

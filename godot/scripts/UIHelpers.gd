extends RefCounted


## A small colored circular badge with a letter label — same placeholder
## "sprite" language used in the earlier React Native prototype, now drawn
## with real 2D nodes instead of emoji/text.
static func make_badge(label_text: String, color: Color, size: float = 28.0) -> Panel:
	var panel := Panel.new()
	panel.custom_minimum_size = Vector2(size, size)
	panel.size = Vector2(size, size)
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE

	var style := StyleBoxFlat.new()
	style.bg_color = color
	style.corner_radius_top_left = int(size / 2)
	style.corner_radius_top_right = int(size / 2)
	style.corner_radius_bottom_left = int(size / 2)
	style.corner_radius_bottom_right = int(size / 2)
	panel.add_theme_stylebox_override("panel", style)

	var label := Label.new()
	label.text = label_text
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	label.set_anchors_preset(Control.PRESET_FULL_RECT)
	label.add_theme_color_override("font_color", Color(0.04, 0.05, 0.07))
	label.add_theme_font_size_override("font_size", int(size * 0.42))
	panel.add_child(label)

	panel.set_meta("label", label)
	panel.set_meta("style", style)
	return panel


## Builds a directional AnimatedSprite2D from a sheet described by `config`
## (see GameManager.PLAYER_SPRITE). Returns null if the sheet file doesn't
## exist yet, so callers can fall back to a placeholder badge.
static func try_make_player_sprite(config: Dictionary) -> AnimatedSprite2D:
	var path: String = config.get("sheet_path", "")
	if path == "" or not ResourceLoader.exists(path):
		return null

	var texture: Texture2D = load(path)
	var fw: int = int(config["frame_width"])
	var fh: int = int(config["frame_height"])
	var cols: int = int(config["columns"])
	var fps: float = float(config.get("fps", 8.0))
	var rows := {
		"down": int(config["row_down"]),
		"left": int(config["row_left"]),
		"right": int(config["row_right"]),
		"up": int(config["row_up"]),
	}

	var frames := SpriteFrames.new()
	for dir_name in rows:
		var row: int = rows[dir_name]
		var walk_anim := "walk_%s" % dir_name
		var idle_anim := "idle_%s" % dir_name
		frames.add_animation(walk_anim)
		frames.set_animation_loop(walk_anim, true)
		frames.set_animation_speed(walk_anim, fps)
		frames.add_animation(idle_anim)
		frames.set_animation_loop(idle_anim, false)
		frames.set_animation_speed(idle_anim, fps)
		for col in range(cols):
			var atlas := AtlasTexture.new()
			atlas.atlas = texture
			atlas.region = Rect2(col * fw, row * fh, fw, fh)
			frames.add_frame(walk_anim, atlas)
			if col == 0:
				frames.add_frame(idle_anim, atlas)
	frames.remove_animation("default")

	var sprite := AnimatedSprite2D.new()
	sprite.sprite_frames = frames
	sprite.animation = "idle_down"
	sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	sprite.play("idle_down")
	return sprite


static func make_button(text: String, on_press: Callable, bg_color: Color = Color(0.11, 0.11, 0.15)) -> Button:
	var btn := Button.new()
	btn.text = text
	var style := StyleBoxFlat.new()
	style.bg_color = bg_color
	style.corner_radius_top_left = 8
	style.corner_radius_top_right = 8
	style.corner_radius_bottom_left = 8
	style.corner_radius_bottom_right = 8
	style.content_margin_left = 14
	style.content_margin_right = 14
	style.content_margin_top = 10
	style.content_margin_bottom = 10
	btn.add_theme_stylebox_override("normal", style)
	btn.add_theme_color_override("font_color", Color(0.9, 0.91, 0.94))
	btn.pressed.connect(on_press)
	return btn

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

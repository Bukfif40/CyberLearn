extends Control

var prompt_label: Label


func _ready() -> void:
	var bg := ColorRect.new()
	bg.color = Color8(6, 7, 10)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg)

	var title := Label.new()
	title.text = "MERIDIAN"
	title.position = Vector2(0, 300)
	title.size = Vector2(480, 60)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_color_override("font_color", Color8(108, 92, 231))
	title.add_theme_font_size_override("font_size", 40)
	add_child(title)

	var subtitle := Label.new()
	subtitle.text = "E C H O   P R O T O C O L"
	subtitle.position = Vector2(0, 366)
	subtitle.size = Vector2(480, 30)
	subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	subtitle.add_theme_color_override("font_color", Color8(146, 152, 168))
	subtitle.add_theme_font_size_override("font_size", 14)
	add_child(subtitle)

	prompt_label = Label.new()
	prompt_label.text = "Tap to Begin"
	prompt_label.position = Vector2(0, 560)
	prompt_label.size = Vector2(480, 30)
	prompt_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	prompt_label.add_theme_color_override("font_color", Color8(230, 232, 239))
	prompt_label.add_theme_font_size_override("font_size", 15)
	add_child(prompt_label)

	var tween := create_tween()
	tween.set_loops()
	tween.tween_property(prompt_label, "modulate:a", 0.2, 0.9)
	tween.tween_property(prompt_label, "modulate:a", 1.0, 0.9)

	var start_btn := Button.new()
	start_btn.flat = true
	start_btn.set_anchors_preset(Control.PRESET_FULL_RECT)
	start_btn.pressed.connect(Callable(self, "_start"))
	add_child(start_btn)


func _start() -> void:
	GameManager.pending_cutscene_beats = GameManager.INTRO_CUTSCENE
	GameManager.pending_cutscene_next_scene = "res://scenes/Main.tscn"
	get_tree().change_scene_to_file("res://scenes/Cutscene.tscn")

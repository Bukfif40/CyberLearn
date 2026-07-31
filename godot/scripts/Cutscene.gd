extends Control
const UIHelpers = preload("res://scripts/UIHelpers.gd")

var beats: Array = []
var index := 0
var next_scene: String = "res://scenes/Main.tscn"

var text_label: Label
var hint_label: Label


func _ready() -> void:
	beats = GameManager.pending_cutscene_beats
	next_scene = GameManager.pending_cutscene_next_scene
	if beats.is_empty():
		_finish()
		return
	_build_ui()
	_show_beat()


func _build_ui() -> void:
	var bg := ColorRect.new()
	bg.color = Color8(6, 7, 10)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg)

	text_label = Label.new()
	text_label.position = Vector2(36, 320)
	text_label.size = Vector2(408, 380)
	text_label.autowrap_mode = TextServer.AUTOWRAP_WORD
	text_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	text_label.vertical_alignment = VERTICAL_ALIGNMENT_TOP
	text_label.add_theme_color_override("font_color", Color8(230, 232, 239))
	text_label.add_theme_font_size_override("font_size", 17)
	add_child(text_label)

	hint_label = Label.new()
	hint_label.position = Vector2(320, 800)
	hint_label.add_theme_color_override("font_color", Color8(107, 114, 128))
	hint_label.add_theme_font_size_override("font_size", 12)
	add_child(hint_label)

	# Full-rect click-catcher added first, so it sits *below* the skip
	# button in input priority (Godot dispatches input to the most
	# recently added sibling first) — otherwise the skip button would be
	# visually present but unclickable, permanently shadowed by this.
	var advance_btn := Button.new()
	advance_btn.flat = true
	advance_btn.set_anchors_preset(Control.PRESET_FULL_RECT)
	advance_btn.pressed.connect(Callable(self, "_advance"))
	add_child(advance_btn)

	var skip_btn := UIHelpers.make_button("Skip ▶▶", Callable(self, "_finish"), Color8(18, 21, 28))
	skip_btn.position = Vector2(20, 780)
	add_child(skip_btn)


func _show_beat() -> void:
	text_label.text = String(beats[index])
	text_label.modulate.a = 0.0
	var tween := create_tween()
	tween.tween_property(text_label, "modulate:a", 1.0, 0.5)
	hint_label.text = "Tap to continue ▶" if index < beats.size() - 1 else "Tap to begin ▶"


func _advance() -> void:
	if index < beats.size() - 1:
		index += 1
		_show_beat()
	else:
		_finish()


func _finish() -> void:
	get_tree().change_scene_to_file(next_scene)

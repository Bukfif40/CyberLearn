extends Control
const UIHelpers = preload("res://scripts/UIHelpers.gd")

const MAX_HP := 100
const DAMAGE_PER_WRONG := 25

var encounter: Dictionary
var stage := "intro"  # intro | question | result
var question_index := 0
var hp := MAX_HP
var selected := -1
var cleared := false

var content: VBoxContainer
var hp_bar: ProgressBar
var hp_label: Label


func _ready() -> void:
	encounter = GameManager.get_encounter(GameManager.pending_encounter_id)
	hp = MAX_HP
	_build_shell()
	_render()


func _build_shell() -> void:
	var bg := ColorRect.new()
	bg.color = Color8(11, 13, 18)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg)

	var header := Panel.new()
	header.position = Vector2(0, 0)
	header.size = Vector2(480, 130)
	var hstyle := StyleBoxFlat.new()
	hstyle.bg_color = Color8(18, 21, 28)
	hstyle.border_width_bottom = 2
	hstyle.border_color = Color8(58, 63, 75)
	header.add_theme_stylebox_override("panel", hstyle)
	add_child(header)

	var title := Label.new()
	title.text = String(encounter.get("name", ""))
	title.position = Vector2(20, 40)
	title.add_theme_color_override("font_color", Color8(245, 246, 250))
	title.add_theme_font_size_override("font_size", 18)
	header.add_child(title)

	hp_bar = ProgressBar.new()
	hp_bar.position = Vector2(20, 80)
	hp_bar.size = Vector2(440, 10)
	hp_bar.max_value = MAX_HP
	hp_bar.value = hp
	hp_bar.show_percentage = false
	var fill := StyleBoxFlat.new()
	fill.bg_color = Color8(239, 68, 68)
	fill.corner_radius_top_left = 5
	fill.corner_radius_top_right = 5
	fill.corner_radius_bottom_left = 5
	fill.corner_radius_bottom_right = 5
	hp_bar.add_theme_stylebox_override("fill", fill)
	var bg_style := StyleBoxFlat.new()
	bg_style.bg_color = Color8(42, 46, 58)
	bg_style.corner_radius_top_left = 5
	bg_style.corner_radius_top_right = 5
	bg_style.corner_radius_bottom_left = 5
	bg_style.corner_radius_bottom_right = 5
	hp_bar.add_theme_stylebox_override("background", bg_style)
	header.add_child(hp_bar)

	hp_label = Label.new()
	hp_label.position = Vector2(20, 96)
	hp_label.add_theme_color_override("font_color", Color8(146, 152, 168))
	hp_label.add_theme_font_size_override("font_size", 12)
	header.add_child(hp_label)

	var scroll := ScrollContainer.new()
	scroll.position = Vector2(0, 150)
	scroll.size = Vector2(480, 704)
	add_child(scroll)

	content = VBoxContainer.new()
	content.position = Vector2(20, 0)
	content.custom_minimum_size = Vector2(440, 0)
	content.add_theme_constant_override("separation", 12)
	scroll.add_child(content)


func _clear_content() -> void:
	for child in content.get_children():
		child.queue_free()


func _add_text(text: String, color: Color, font_size: int, bold: bool = false) -> Label:
	var lbl := Label.new()
	lbl.text = text
	lbl.custom_minimum_size = Vector2(440, 0)
	lbl.autowrap_mode = TextServer.AUTOWRAP_WORD
	lbl.add_theme_color_override("font_color", color)
	lbl.add_theme_font_size_override("font_size", font_size)
	content.add_child(lbl)
	return lbl


func _render() -> void:
	hp_bar.value = hp
	hp_label.text = "HP %d/%d" % [hp, MAX_HP]
	_clear_content()

	if stage == "intro":
		_add_text(String(encounter.get("intro", "")), Color8(230, 232, 239), 15)
		var btn := UIHelpers.make_button("Investigate ⚔️", Callable(self, "_begin_battle"), Color8(108, 92, 231))
		content.add_child(btn)

	elif stage == "question":
		var questions: Array = encounter["questions"]
		var q: Dictionary = questions[question_index]
		_add_text(String(q["prompt"]), Color8(245, 246, 250), 16)

		var options: Array = q["options"]
		for i in range(options.size()):
			var is_correct: bool = i == int(q["correct_index"])
			var is_selected: bool = i == selected
			var color := Color8(230, 232, 239)
			if selected != -1:
				if is_correct:
					color = Color8(16, 185, 129)
				elif is_selected:
					color = Color8(239, 68, 68)
			var opt_btn := UIHelpers.make_button(String(options[i]), Callable(self, "_select_answer").bind(i), Color8(26, 29, 39))
			opt_btn.add_theme_color_override("font_color", color)
			content.add_child(opt_btn)

		if selected != -1:
			var feedback: String = q["correct_feedback"] if selected == int(q["correct_index"]) else q["incorrect_feedback"]
			_add_text(feedback, Color8(146, 152, 168), 13)
			var next_label := "Continue" if hp <= 0 else ("Next" if question_index < questions.size() - 1 else "Finish")
			var next_btn := UIHelpers.make_button(next_label, Callable(self, "_continue_after_feedback"), Color8(108, 92, 231))
			content.add_child(next_btn)

	elif stage == "result":
		cleared = hp > 0
		var result_title := "✅ Threat Neutralized!" if cleared else "💀 You Need Backup"
		_add_text(result_title, Color8(245, 246, 250), 20)
		var subtitle := "Nice catch — that's exactly the kind of vigilance a real analyst needs." if cleared else "Review the feedback above and try again."
		_add_text(subtitle, Color8(146, 152, 168), 14)
		var btn := UIHelpers.make_button("Return to Map", Callable(self, "_return_to_map"), Color8(108, 92, 231))
		content.add_child(btn)


func _begin_battle() -> void:
	stage = "question"
	_render()


func _select_answer(index: int) -> void:
	if selected != -1:
		return
	selected = index
	var q: Dictionary = encounter["questions"][question_index]
	if index != int(q["correct_index"]):
		hp = max(0, hp - DAMAGE_PER_WRONG)
	_render()


func _continue_after_feedback() -> void:
	if hp <= 0:
		stage = "result"
		_render()
		return
	var questions: Array = encounter["questions"]
	if question_index < questions.size() - 1:
		question_index += 1
		selected = -1
	else:
		stage = "result"
	_render()


func _return_to_map() -> void:
	if cleared:
		GameManager.clear_encounter(encounter)
	get_tree().change_scene_to_file("res://scenes/Main.tscn")

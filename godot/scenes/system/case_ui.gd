extends CanvasLayer
## Simple linear 5-step case-flow UI: Evidence -> Deduction/Determination
## (multiple choice) -> Consequence (failure-forward retry) -> Debrief.
## A fast-first-pass UI - a connect-the-clues board is a later polish pass.

signal case_completed

const BG_COLOR := Color8(11, 13, 18, 235)
const PANEL_COLOR := Color8(18, 21, 28)
const BORDER_COLOR := Color8(58, 63, 75)
const TEXT_COLOR := Color8(230, 232, 239)
const ACCENT_COLOR := Color8(139, 147, 255)
const CORRECT_COLOR := Color8(16, 185, 129)
const INCORRECT_COLOR := Color8(239, 68, 68)

var case_data: Dictionary
var question_index := 0

var root: Control
var title_label: Label
var body_label: RichTextLabel
var options_box: VBoxContainer
var continue_button: Button


func open(data: Dictionary) -> void:
	case_data = data
	question_index = 0
	_build_ui()
	_show_evidence()


func _build_ui() -> void:
	layer = 100
	root = Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(root)

	var bg := ColorRect.new()
	bg.color = BG_COLOR
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.add_child(bg)

	var panel := Panel.new()
	panel.set_anchors_preset(Control.PRESET_CENTER)
	panel.position = Vector2(-260, -160)
	panel.size = Vector2(520, 320)
	var style := StyleBoxFlat.new()
	style.bg_color = PANEL_COLOR
	style.border_color = BORDER_COLOR
	style.border_width_left = 2
	style.border_width_right = 2
	style.border_width_top = 2
	style.border_width_bottom = 2
	style.corner_radius_top_left = 10
	style.corner_radius_top_right = 10
	style.corner_radius_bottom_left = 10
	style.corner_radius_bottom_right = 10
	style.content_margin_left = 20
	style.content_margin_right = 20
	style.content_margin_top = 16
	style.content_margin_bottom = 16
	panel.add_theme_stylebox_override("panel", style)
	root.add_child(panel)

	var vbox := VBoxContainer.new()
	vbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	vbox.add_theme_constant_override("separation", 12)
	panel.add_child(vbox)

	title_label = Label.new()
	title_label.add_theme_color_override("font_color", ACCENT_COLOR)
	title_label.add_theme_font_size_override("font_size", 16)
	vbox.add_child(title_label)

	body_label = RichTextLabel.new()
	body_label.bbcode_enabled = false
	body_label.fit_content = true
	body_label.custom_minimum_size = Vector2(480, 140)
	body_label.add_theme_color_override("default_color", TEXT_COLOR)
	body_label.add_theme_font_size_override("normal_font_size", 14)
	vbox.add_child(body_label)

	options_box = VBoxContainer.new()
	options_box.add_theme_constant_override("separation", 8)
	vbox.add_child(options_box)

	continue_button = Button.new()
	continue_button.text = "Continue"
	continue_button.visible = false
	vbox.add_child(continue_button)


func _clear_options() -> void:
	for c in options_box.get_children():
		c.queue_free()


func _show_evidence() -> void:
	title_label.text = "EVIDENCE — %s" % String(case_data.get("name", "Case"))
	body_label.text = String(case_data.get("intro", ""))
	_clear_options()
	continue_button.text = "Continue"
	continue_button.visible = true
	if not continue_button.pressed.is_connected(_show_question):
		continue_button.pressed.connect(_show_question)


func _show_question() -> void:
	if continue_button.pressed.is_connected(_show_question):
		continue_button.pressed.disconnect(_show_question)
	continue_button.visible = false

	var questions: Array = case_data.get("questions", [])
	if question_index >= questions.size():
		_show_debrief()
		return

	var q: Dictionary = questions[question_index]
	title_label.text = "DEDUCTION — Question %d of %d" % [question_index + 1, questions.size()]
	body_label.text = String(q.get("prompt", ""))
	_clear_options()

	var options: Array = q.get("options", [])
	for i in options.size():
		var btn := Button.new()
		btn.text = String(options[i])
		btn.pressed.connect(_on_option_selected.bind(i))
		options_box.add_child(btn)


func _on_option_selected(chosen_index: int) -> void:
	var questions: Array = case_data.get("questions", [])
	var q: Dictionary = questions[question_index]
	_clear_options()
	var correct: bool = chosen_index == int(q.get("correct_index", -1))
	if correct:
		title_label.text = "DETERMINATION — Correct"
		body_label.text = String(q.get("correct_feedback", ""))
		body_label.add_theme_color_override("default_color", CORRECT_COLOR)
		question_index += 1
	else:
		title_label.text = "CONSEQUENCE — Not quite"
		body_label.text = String(q.get("incorrect_feedback", "")) + "\n\nThe case reopens — take another look at the evidence."
		body_label.add_theme_color_override("default_color", INCORRECT_COLOR)
		# failure-forward: does not end the session, just retries this question
	continue_button.text = "Continue"
	continue_button.visible = true
	if not continue_button.pressed.is_connected(_after_answer_feedback):
		continue_button.pressed.connect(_after_answer_feedback)


func _after_answer_feedback() -> void:
	if continue_button.pressed.is_connected(_after_answer_feedback):
		continue_button.pressed.disconnect(_after_answer_feedback)
	body_label.add_theme_color_override("default_color", TEXT_COLOR)
	_show_question()


func _show_debrief() -> void:
	title_label.text = "DEBRIEF"
	body_label.text = String(case_data.get("debrief", ""))
	_clear_options()
	continue_button.text = "Close case"
	continue_button.visible = true
	if not continue_button.pressed.is_connected(_on_continue_pressed):
		continue_button.pressed.connect(_on_continue_pressed)


func _on_continue_pressed() -> void:
	case_completed.emit()
	queue_free()

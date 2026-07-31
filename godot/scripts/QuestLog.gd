extends Control
const UIHelpers = preload("res://scripts/UIHelpers.gd")

var content: VBoxContainer


func _ready() -> void:
	_build_shell()
	_render()


func _build_shell() -> void:
	var bg := ColorRect.new()
	bg.color = Color8(11, 13, 18)
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg)

	var header := Panel.new()
	header.size = Vector2(480, 100)
	var hstyle := StyleBoxFlat.new()
	hstyle.bg_color = Color8(18, 21, 28)
	hstyle.border_width_bottom = 2
	hstyle.border_color = Color8(58, 63, 75)
	header.add_theme_stylebox_override("panel", hstyle)
	add_child(header)

	var title := Label.new()
	title.text = "Quest Log"
	title.position = Vector2(20, 40)
	title.add_theme_color_override("font_color", Color8(245, 246, 250))
	title.add_theme_font_size_override("font_size", 18)
	header.add_child(title)

	var scroll := ScrollContainer.new()
	scroll.position = Vector2(0, 100)
	scroll.size = Vector2(480, 690)
	add_child(scroll)

	content = VBoxContainer.new()
	content.position = Vector2(20, 12)
	content.custom_minimum_size = Vector2(440, 0)
	content.add_theme_constant_override("separation", 14)
	scroll.add_child(content)

	var close_btn := UIHelpers.make_button("Close", Callable(self, "_close"), Color8(18, 21, 28))
	close_btn.position = Vector2(180, 800)
	add_child(close_btn)


func _add_section_label(text: String) -> void:
	var lbl := Label.new()
	lbl.text = text
	lbl.add_theme_color_override("font_color", Color8(146, 152, 168))
	lbl.add_theme_font_size_override("font_size", 12)
	content.add_child(lbl)


func _render() -> void:
	for child in content.get_children():
		child.queue_free()

	_add_section_label("ACTIVE")
	var any_active := false
	for quest in GameManager.QUESTS:
		if not GameManager.active_quest_ids.has(quest["id"]):
			continue
		any_active = true
		content.add_child(_build_quest_card(quest, false))
	if not any_active:
		var empty := Label.new()
		empty.text = "No active quests yet."
		empty.add_theme_color_override("font_color", Color8(107, 114, 128))
		empty.add_theme_font_size_override("font_size", 13)
		content.add_child(empty)

	var any_completed := false
	for quest in GameManager.QUESTS:
		if GameManager.completed_quest_ids.has(quest["id"]):
			any_completed = true
			break
	if any_completed:
		_add_section_label("COMPLETED")
		for quest in GameManager.QUESTS:
			if GameManager.completed_quest_ids.has(quest["id"]):
				content.add_child(_build_quest_card(quest, true))


func _build_quest_card(quest: Dictionary, is_completed: bool) -> PanelContainer:
	var card := PanelContainer.new()
	var cstyle := StyleBoxFlat.new()
	cstyle.bg_color = Color8(26, 29, 39)
	cstyle.border_color = Color8(42, 46, 58)
	cstyle.border_width_top = 1
	cstyle.border_width_bottom = 1
	cstyle.border_width_left = 1
	cstyle.border_width_right = 1
	cstyle.corner_radius_top_left = 10
	cstyle.corner_radius_top_right = 10
	cstyle.corner_radius_bottom_left = 10
	cstyle.corner_radius_bottom_right = 10
	cstyle.content_margin_left = 14
	cstyle.content_margin_right = 14
	cstyle.content_margin_top = 12
	cstyle.content_margin_bottom = 12
	card.add_theme_stylebox_override("panel", cstyle)
	card.modulate.a = 0.6 if is_completed else 1.0

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 6)
	card.add_child(vbox)

	var title := Label.new()
	title.text = ("✓ " if is_completed else "") + String(quest["title"])
	title.add_theme_color_override("font_color", Color8(245, 246, 250))
	title.add_theme_font_size_override("font_size", 15)
	vbox.add_child(title)

	if not is_completed:
		var desc := Label.new()
		desc.text = String(quest["description"])
		desc.custom_minimum_size = Vector2(400, 0)
		desc.autowrap_mode = TextServer.AUTOWRAP_WORD
		desc.add_theme_color_override("font_color", Color8(146, 152, 168))
		desc.add_theme_font_size_override("font_size", 13)
		vbox.add_child(desc)

		for obj in quest["objectives"]:
			var key := "%s:%s" % [quest["id"], obj["id"]]
			var done: bool = GameManager.completed_objective_ids.has(key)
			var obj_label := Label.new()
			obj_label.text = ("☑ " if done else "☐ ") + String(obj["description"])
			obj_label.add_theme_color_override("font_color", Color8(16, 185, 129) if done else Color8(230, 232, 239))
			obj_label.add_theme_font_size_override("font_size", 14)
			vbox.add_child(obj_label)

		var reward := Label.new()
		reward.text = "Reward: ◈ %d" % int(quest["credit_reward"])
		reward.add_theme_color_override("font_color", Color8(245, 158, 11))
		reward.add_theme_font_size_override("font_size", 13)
		vbox.add_child(reward)

	return card


func _close() -> void:
	get_tree().change_scene_to_file("res://scenes/Main.tscn")

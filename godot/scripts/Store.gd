extends Control
const UIHelpers = preload("res://scripts/UIHelpers.gd")

var vendor: Dictionary
var content: VBoxContainer
var credits_label: Label


func _ready() -> void:
	vendor = GameManager.get_npc(GameManager.pending_vendor_npc_id)
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
	title.text = "%s's Stall" % String(vendor.get("name", "Vendor"))
	title.position = Vector2(20, 40)
	title.add_theme_color_override("font_color", Color8(245, 246, 250))
	title.add_theme_font_size_override("font_size", 18)
	header.add_child(title)

	credits_label = Label.new()
	credits_label.position = Vector2(360, 40)
	credits_label.add_theme_color_override("font_color", Color8(245, 158, 11))
	credits_label.add_theme_font_size_override("font_size", 16)
	header.add_child(credits_label)

	var scroll := ScrollContainer.new()
	scroll.position = Vector2(0, 100)
	scroll.size = Vector2(480, 690)
	add_child(scroll)

	content = VBoxContainer.new()
	content.position = Vector2(20, 12)
	content.custom_minimum_size = Vector2(440, 0)
	content.add_theme_constant_override("separation", 12)
	scroll.add_child(content)

	var leave_btn := UIHelpers.make_button("Leave", Callable(self, "_leave"), Color8(18, 21, 28))
	leave_btn.position = Vector2(180, 800)
	add_child(leave_btn)


func _render() -> void:
	credits_label.text = "◈ %d" % GameManager.credits
	for child in content.get_children():
		child.queue_free()

	for item in GameManager.ITEMS:
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

		var vbox := VBoxContainer.new()
		vbox.add_theme_constant_override("separation", 6)
		card.add_child(vbox)

		var name_label := Label.new()
		name_label.text = String(item["name"])
		name_label.add_theme_color_override("font_color", Color8(245, 246, 250))
		name_label.add_theme_font_size_override("font_size", 15)
		vbox.add_child(name_label)

		var desc_label := Label.new()
		desc_label.text = String(item["description"])
		desc_label.custom_minimum_size = Vector2(400, 0)
		desc_label.autowrap_mode = TextServer.AUTOWRAP_WORD
		desc_label.add_theme_color_override("font_color", Color8(146, 152, 168))
		desc_label.add_theme_font_size_override("font_size", 13)
		vbox.add_child(desc_label)

		var owned: bool = GameManager.owned_item_ids.has(item["id"])
		var can_afford: bool = GameManager.credits >= int(item["price"])
		var label_text: String
		if owned:
			label_text = "Owned"
		elif can_afford:
			label_text = "Buy — ◈ %d" % int(item["price"])
		else:
			label_text = "◈ %d (not enough)" % int(item["price"])

		var buy_btn := UIHelpers.make_button(label_text, Callable(self, "_buy").bind(item), Color8(108, 92, 231) if (not owned and can_afford) else Color8(42, 46, 58))
		buy_btn.disabled = owned or not can_afford
		vbox.add_child(buy_btn)

		content.add_child(card)


func _buy(item: Dictionary) -> void:
	GameManager.buy_item(item)
	_render()


func _leave() -> void:
	get_tree().change_scene_to_file("res://scenes/Main.tscn")

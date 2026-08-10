extends CanvasLayer
## In-world "computer" UI opened by interacting with a PC prop (e.g. Cipher's
## apartment terminal). Sidebar app switcher (MESSAGES/EMAIL/FILES/TERMINAL/
## NETWORK/NOTES) + a content panel that swaps per app. Built entirely in
## code, same convention as case_ui.gd (no separate .tscn), same color
## palette for visual consistency across the game's UI.
##
## Caller is responsible for pausing the tree / disabling player input
## around this UI, same pattern npc_talker.gd already uses around
## DialogueManager.show_dialogue_balloon().

signal computer_closed

const BG_COLOR := Color8(11, 13, 18, 235)
const PANEL_COLOR := Color8(18, 21, 28)
const SIDEBAR_COLOR := Color8(15, 17, 23)
const BORDER_COLOR := Color8(58, 63, 75)
const TEXT_COLOR := Color8(230, 232, 239)
const DIM_TEXT_COLOR := Color8(150, 155, 168)
const ACCENT_COLOR := Color8(139, 147, 255)

const PANEL_SIZE := Vector2(640, 400)
const SIDEBAR_WIDTH := 140.0

## Each entry: { id, label, kind: "list" | "terminal", entries (for "list") }
## `entries` items: { title, body }. Content is data, not hardcoded UI, so
## a new district's computer can reuse this with its own app_data.
var app_data: Array[Dictionary] = [
	{
		"id": "messages", "label": "MESSAGES", "kind": "list",
		"entries": [
			{"title": "Unknown", "body": "You keep asking about the blackout. Meet me at Fringeport Docks. Come alone."},
		],
	},
	{
		"id": "email", "label": "EMAIL", "kind": "list",
		"entries": [
			{"title": "CITYNET NEWS — Digest", "body": "Network disruptions continue across several city districts. Officials describe the issues as \"routine maintenance.\" No further comment."},
			{"title": "Building Management", "body": "Reminder: unit inspections scheduled next week. Please ensure smoke detectors are accessible."},
		],
	},
	{
		"id": "files", "label": "FILES", "kind": "list",
		"entries": [
			{"title": "resume_draft.txt", "body": "(Empty draft.)"},
			{"title": "old_photos/", "body": "(3 items)"},
		],
	},
	{
		"id": "network", "label": "NETWORK", "kind": "list",
		"entries": [
			{"title": "Status", "body": "CITYNET — Connected\nLatency: nominal\nLast incident report on file: unavailable"},
		],
	},
	{
		"id": "notes", "label": "NOTES", "kind": "list",
		"entries": [
			{"title": "untitled", "body": "why does every \"outage\" story sound the same"},
		],
	},
	{"id": "terminal", "label": "TERMINAL", "kind": "terminal"},
]

## Terminal commands: command -> output string, or a Callable(args) -> String.
var terminal_commands: Dictionary = {
	"help": "Commands: help, whoami, ls, cat <file>, netstat, clear",
	"whoami": "guest",
	"ls": "resume_draft.txt  old_photos/  notes.txt",
	"netstat": "Active connections: 1\ncitynet.gov ......... ESTABLISHED\n(no anomalies reported)",
}

var root: Control
var content_container: VBoxContainer
var terminal_output: RichTextLabel
var terminal_input: LineEdit
var active_app_id: String = ""


func open() -> void:
	_build_ui()
	_select_app(app_data[0].id)


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
	panel.position = -PANEL_SIZE / 2
	panel.size = PANEL_SIZE
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
	panel.add_theme_stylebox_override("panel", style)
	root.add_child(panel)

	var hbox := HBoxContainer.new()
	hbox.set_anchors_preset(Control.PRESET_FULL_RECT)
	panel.add_child(hbox)

	_build_sidebar(hbox)

	var content_margin := MarginContainer.new()
	content_margin.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	content_margin.add_theme_constant_override("margin_left", 18)
	content_margin.add_theme_constant_override("margin_right", 18)
	content_margin.add_theme_constant_override("margin_top", 16)
	content_margin.add_theme_constant_override("margin_bottom", 16)
	hbox.add_child(content_margin)

	content_container = VBoxContainer.new()
	content_container.add_theme_constant_override("separation", 10)
	content_margin.add_child(content_container)


func _build_sidebar(parent: HBoxContainer) -> void:
	var sidebar := VBoxContainer.new()
	sidebar.custom_minimum_size = Vector2(SIDEBAR_WIDTH, 0)
	sidebar.add_theme_constant_override("separation", 4)
	var sidebar_bg := StyleBoxFlat.new()
	sidebar_bg.bg_color = SIDEBAR_COLOR
	sidebar_bg.content_margin_left = 10
	sidebar_bg.content_margin_top = 12
	sidebar_bg.content_margin_right = 10

	var sidebar_panel := PanelContainer.new()
	sidebar_panel.custom_minimum_size = Vector2(SIDEBAR_WIDTH, 0)
	sidebar_panel.add_theme_stylebox_override("panel", sidebar_bg)
	parent.add_child(sidebar_panel)
	sidebar_panel.add_child(sidebar)

	for app in app_data:
		var btn := Button.new()
		btn.text = String(app.label)
		btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
		btn.pressed.connect(_select_app.bind(app.id))
		sidebar.add_child(btn)

	var spacer := Control.new()
	spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
	sidebar.add_child(spacer)

	var close_btn := Button.new()
	close_btn.text = "CLOSE"
	close_btn.pressed.connect(_on_close_pressed)
	sidebar.add_child(close_btn)


func _select_app(app_id: String) -> void:
	active_app_id = app_id
	for c in content_container.get_children():
		c.queue_free()

	var app: Dictionary = app_data.filter(func(a): return a.id == app_id)[0]
	var title := Label.new()
	title.text = String(app.label)
	title.add_theme_color_override("font_color", ACCENT_COLOR)
	title.add_theme_font_size_override("font_size", 16)
	content_container.add_child(title)

	if app.kind == "terminal":
		_build_terminal_view()
	else:
		_build_list_view(app.entries)


func _build_list_view(entries: Array) -> void:
	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	content_container.add_child(scroll)

	var list := VBoxContainer.new()
	list.add_theme_constant_override("separation", 10)
	list.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.add_child(list)

	if entries.is_empty():
		var empty := Label.new()
		empty.text = "(nothing here)"
		empty.add_theme_color_override("font_color", DIM_TEXT_COLOR)
		list.add_child(empty)
		return

	for entry in entries:
		var item_title := Label.new()
		item_title.text = String(entry.title)
		item_title.add_theme_color_override("font_color", TEXT_COLOR)
		list.add_child(item_title)

		var item_body := RichTextLabel.new()
		item_body.bbcode_enabled = false
		item_body.fit_content = true
		item_body.text = String(entry.body)
		item_body.add_theme_color_override("default_color", DIM_TEXT_COLOR)
		item_body.add_theme_font_size_override("normal_font_size", 13)
		list.add_child(item_body)


func _build_terminal_view() -> void:
	terminal_output = RichTextLabel.new()
	terminal_output.bbcode_enabled = false
	terminal_output.scroll_following = true
	terminal_output.size_flags_vertical = Control.SIZE_EXPAND_FILL
	terminal_output.add_theme_color_override("default_color", TEXT_COLOR)
	terminal_output.add_theme_font_size_override("normal_font_size", 13)
	terminal_output.text = "guest@meridian:~$ type 'help' for a list of commands\n"
	content_container.add_child(terminal_output)

	terminal_input = LineEdit.new()
	terminal_input.placeholder_text = "type a command..."
	terminal_input.text_submitted.connect(_on_terminal_submitted)
	content_container.add_child(terminal_input)
	terminal_input.grab_focus()


func _on_terminal_submitted(command: String) -> void:
	var trimmed := command.strip_edges()
	terminal_output.text += "guest@meridian:~$ %s\n" % trimmed
	terminal_input.text = ""

	if trimmed.is_empty():
		return
	if trimmed == "clear":
		terminal_output.text = ""
		return

	var parts := trimmed.split(" ", false)
	var cmd := parts[0]
	var output := ""
	if cmd == "cat" and parts.size() > 1:
		output = _cat_file(parts[1])
	elif terminal_commands.has(cmd):
		output = String(terminal_commands[cmd])
	else:
		output = "command not found: %s" % cmd

	terminal_output.text += output + "\n"


func _cat_file(filename: String) -> String:
	var files_app: Dictionary = app_data.filter(func(a): return a.id == "files")[0]
	for entry in files_app.entries:
		if String(entry.title) == filename:
			return String(entry.body)
	return "cat: %s: No such file" % filename


func _on_close_pressed() -> void:
	computer_closed.emit()
	queue_free()

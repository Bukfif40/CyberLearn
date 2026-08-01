extends Node2D
const UIHelpers = preload("res://scripts/UIHelpers.gd")
const ProceduralPlayerSprite = preload("res://scripts/ProceduralPlayerSprite.gd")

const TILE_SIZE := 40
const MAP_ORIGIN := Vector2(40, 110)
const PLAYER_MOVE_DURATION := 0.12

const TEX_FLOOR := preload("res://assets/tiles/floor_tile.png")
const TEX_WALL := preload("res://assets/tiles/wall_tile.png")
const TEX_ROAD := preload("res://assets/tiles/road_tile.png")
const TEX_VEHICLE := preload("res://assets/sprites/vehicle_sprite.png")

var room: Dictionary = GameManager.ROOM
var npc_runtime: Dictionary = {}     # id -> {pos: Vector2i, index:int, dir:int}
var vehicle_runtime: Dictionary = {} # id -> {pos: Vector2i, index:int, dir:int}
var npc_nodes: Dictionary = {}
var vehicle_nodes: Dictionary = {}
var encounter_marker_nodes: Dictionary = {}
var player_node # AnimatedSprite2D when sprite art is available, else ProceduralPlayerSprite
var player_facing := "down"
var player_tween: Tween

var dialogue_active := false
var dialogue_npc: Dictionary = {}
var dialogue_line_index := 0

var map_layer: Node2D
var entity_layer: Node2D
var credits_label: Label
var dialogue_panel: Panel
var dialogue_speaker_label: Label
var dialogue_line_label: Label
var dialogue_hint_label: Label


func _ready() -> void:
	map_layer = Node2D.new()
	add_child(map_layer)
	entity_layer = Node2D.new()
	add_child(entity_layer)

	_build_background()
	_build_map_tiles()
	_init_npc_runtime()
	_init_vehicle_runtime()
	_build_entities()
	_build_ui()
	_update_hud()
	_render_positions()

	var tick_timer := Timer.new()
	tick_timer.wait_time = 1.0
	tick_timer.autostart = true
	add_child(tick_timer)
	tick_timer.timeout.connect(_on_tick)


func grid_to_pixel_centered(pos: Vector2i, node_size: float) -> Vector2:
	var tile_pos := MAP_ORIGIN + Vector2(pos.x * TILE_SIZE, pos.y * TILE_SIZE)
	var offset := (TILE_SIZE - node_size) / 2.0
	return tile_pos + Vector2(offset, offset)


func _grid_to_pixel_center(pos: Vector2i) -> Vector2:
	return MAP_ORIGIN + Vector2(pos.x * TILE_SIZE, pos.y * TILE_SIZE) + Vector2(TILE_SIZE / 2.0, TILE_SIZE / 2.0)


func _dir_name(dx: int, dy: int) -> String:
	if dy < 0:
		return "up"
	if dy > 0:
		return "down"
	if dx < 0:
		return "left"
	return "right"


func _build_background() -> void:
	var bg := ColorRect.new()
	bg.color = Color8(11, 13, 18)
	bg.size = Vector2(480, 854)
	add_child(bg)
	move_child(bg, 0)


func _build_map_tiles() -> void:
	for y in range(int(room["height"])):
		for x in range(int(room["width"])):
			var is_border: bool = x == 0 or y == 0 or x == int(room["width"]) - 1 or y == int(room["height"]) - 1
			var is_road: bool = y == int(room["road_y"]) and x >= int(room["road_x_start"]) and x <= int(room["road_x_end"])
			var tex_rect := TextureRect.new()
			tex_rect.size = Vector2(TILE_SIZE, TILE_SIZE)
			tex_rect.position = MAP_ORIGIN + Vector2(x * TILE_SIZE, y * TILE_SIZE)
			tex_rect.stretch_mode = TextureRect.STRETCH_SCALE
			tex_rect.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
			if is_border:
				tex_rect.texture = TEX_WALL
			elif is_road:
				tex_rect.texture = TEX_ROAD
			else:
				tex_rect.texture = TEX_FLOOR
			map_layer.add_child(tex_rect)


func _init_npc_runtime() -> void:
	for npc in GameManager.NPCS:
		npc_runtime[npc["id"]] = {"pos": npc["start"], "index": 0, "dir": 1}


func _init_vehicle_runtime() -> void:
	for vehicle in GameManager.VEHICLES:
		var path: Array = vehicle["path"]
		vehicle_runtime[vehicle["id"]] = {"pos": path[0], "index": 0, "dir": 1}


func _make_sprite_node(texture: Texture2D, size: float) -> TextureRect:
	var node := TextureRect.new()
	node.texture = texture
	node.size = Vector2(size, size)
	node.stretch_mode = TextureRect.STRETCH_SCALE
	node.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	return node


func _build_entities() -> void:
	for npc in GameManager.NPCS:
		var node := _make_sprite_node(load(String(npc["sprite"])), 34)
		entity_layer.add_child(node)
		npc_nodes[npc["id"]] = node

	for vehicle in GameManager.VEHICLES:
		var node := _make_sprite_node(TEX_VEHICLE, 36)
		entity_layer.add_child(node)
		vehicle_nodes[vehicle["id"]] = node

	for enc in GameManager.ENCOUNTERS:
		var badge := UIHelpers.make_badge("!", Color8(239, 68, 68), 24)
		entity_layer.add_child(badge)
		encounter_marker_nodes[enc["id"]] = badge

	var sprite := UIHelpers.try_make_player_sprite(GameManager.PLAYER_SPRITE)
	player_node = sprite if sprite else ProceduralPlayerSprite.new()
	entity_layer.add_child(player_node)
	player_node.position = _grid_to_pixel_center(GameManager.player_grid_pos)
	player_node.play("idle_down")


func _render_positions() -> void:
	for npc in GameManager.NPCS:
		var rt: Dictionary = npc_runtime[npc["id"]]
		var node: TextureRect = npc_nodes[npc["id"]]
		node.position = grid_to_pixel_centered(rt["pos"], node.size.x)

	for vehicle in GameManager.VEHICLES:
		var rt: Dictionary = vehicle_runtime[vehicle["id"]]
		var node: TextureRect = vehicle_nodes[vehicle["id"]]
		node.position = grid_to_pixel_centered(rt["pos"], node.size.x)

	for enc in GameManager.ENCOUNTERS:
		var node: Panel = encounter_marker_nodes[enc["id"]]
		node.position = grid_to_pixel_centered(enc["position"], node.size.x)
		var lbl: Label = node.get_meta("label")
		var style: StyleBoxFlat = node.get_meta("style")
		if GameManager.cleared_encounter_ids.has(enc["id"]):
			lbl.text = "OK"
			style.bg_color = Color8(16, 185, 129)
		else:
			lbl.text = "!"
			style.bg_color = Color8(239, 68, 68)


func _get_tile(pos: Vector2i) -> String:
	if pos.x <= 0 or pos.y <= 0 or pos.x >= int(room["width"]) - 1 or pos.y >= int(room["height"]) - 1:
		return "wall"
	if pos.y == int(room["road_y"]) and pos.x >= int(room["road_x_start"]) and pos.x <= int(room["road_x_end"]):
		return "road"
	return "floor"


func _npc_at(pos: Vector2i) -> Dictionary:
	for npc in GameManager.NPCS:
		if npc_runtime[npc["id"]]["pos"] == pos:
			return npc
	return {}


func _vehicle_at(pos: Vector2i) -> bool:
	for vehicle in GameManager.VEHICLES:
		if vehicle_runtime[vehicle["id"]]["pos"] == pos:
			return true
	return false


func _encounter_at(pos: Vector2i) -> Dictionary:
	for enc in GameManager.ENCOUNTERS:
		if enc["position"] == pos:
			return enc
	return {}


func move_player(dx: int, dy: int) -> void:
	if dialogue_active:
		return
	var direction := _dir_name(dx, dy)
	player_facing = direction
	var target: Vector2i = GameManager.player_grid_pos + Vector2i(dx, dy)
	if _get_tile(target) == "wall":
		_face_player(direction)
		return

	var npc := _npc_at(target)
	if not npc.is_empty():
		_face_player(direction)
		if npc["role"] == "vendor":
			GameManager.pending_vendor_npc_id = npc["id"]
			get_tree().change_scene_to_file("res://scenes/Store.tscn")
		else:
			_open_dialogue(npc)
		return

	if _vehicle_at(target):
		_face_player(direction)
		return  # wait for traffic

	var enc := _encounter_at(target)
	if not enc.is_empty():
		GameManager.pending_encounter_id = enc["id"]
		get_tree().change_scene_to_file("res://scenes/Encounter.tscn")
		return

	var previous: Vector2i = GameManager.player_grid_pos
	GameManager.player_grid_pos = target
	_animate_player_move(previous, target, direction)
	_render_positions()


func _face_player(direction: String) -> void:
	player_node.play("idle_%s" % direction)


func _animate_player_move(from: Vector2i, to: Vector2i, direction: String) -> void:
	player_node.play("walk_%s" % direction)
	if player_tween:
		player_tween.kill()
	player_tween = create_tween()
	player_tween.tween_property(player_node, "position", _grid_to_pixel_center(to), PLAYER_MOVE_DURATION)
	player_tween.finished.connect(_on_player_move_finished.bind(direction))


func _on_player_move_finished(direction: String) -> void:
	player_node.play("idle_%s" % direction)


func _open_dialogue(npc: Dictionary) -> void:
	dialogue_active = true
	dialogue_npc = npc
	dialogue_line_index = 0
	dialogue_panel.visible = true
	_refresh_dialogue_text()


func _refresh_dialogue_text() -> void:
	dialogue_speaker_label.text = dialogue_npc["name"]
	var lines: Array = dialogue_npc["lines"]
	dialogue_line_label.text = lines[dialogue_line_index]
	dialogue_hint_label.text = "Tap to continue ▶" if dialogue_line_index < lines.size() - 1 else "Tap to close ✕"


func _advance_dialogue() -> void:
	if not dialogue_active:
		return
	var lines: Array = dialogue_npc["lines"]
	if dialogue_line_index < lines.size() - 1:
		dialogue_line_index += 1
		_refresh_dialogue_text()
	else:
		if dialogue_npc.get("gives_quest", "") != "":
			GameManager.activate_quest(dialogue_npc["gives_quest"])
		dialogue_active = false
		dialogue_panel.visible = false
		dialogue_npc = {}


func _step_patrol(rt: Dictionary, path: Array) -> Dictionary:
	if path.size() <= 1:
		return rt
	var next_index: int = rt["index"] + rt["dir"]
	var dir: int = rt["dir"]
	if next_index >= path.size():
		next_index = path.size() - 2
		dir = -1
	elif next_index < 0:
		next_index = 1
		dir = 1
	return {"pos": path[next_index], "index": next_index, "dir": dir}


func _on_tick() -> void:
	var occupied: Dictionary = {}
	occupied[GameManager.player_grid_pos] = true
	for id in npc_runtime:
		occupied[npc_runtime[id]["pos"]] = true
	for id in vehicle_runtime:
		occupied[vehicle_runtime[id]["pos"]] = true

	for npc in GameManager.NPCS:
		var path: Array = npc["patrol"]
		if path.is_empty():
			continue
		var current: Dictionary = npc_runtime[npc["id"]]
		var candidate := _step_patrol(current, path)
		if not occupied.has(candidate["pos"]) or candidate["pos"] == current["pos"]:
			occupied.erase(current["pos"])
			npc_runtime[npc["id"]] = candidate
			occupied[candidate["pos"]] = true

	for vehicle in GameManager.VEHICLES:
		var path: Array = vehicle["path"]
		var current: Dictionary = vehicle_runtime[vehicle["id"]]
		var candidate := _step_patrol(current, path)
		if not occupied.has(candidate["pos"]):
			occupied.erase(current["pos"])
			vehicle_runtime[vehicle["id"]] = candidate
			occupied[candidate["pos"]] = true

	_render_positions()


func _update_hud() -> void:
	credits_label.text = "◈ %d" % GameManager.credits


func _move_up() -> void: move_player(0, -1)
func _move_down() -> void: move_player(0, 1)
func _move_left() -> void: move_player(-1, 0)
func _move_right() -> void: move_player(1, 0)


func _open_quest_log() -> void:
	get_tree().change_scene_to_file("res://scenes/QuestLog.tscn")


func _unhandled_key_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed:
		if event.keycode == KEY_UP:
			move_player(0, -1)
		elif event.keycode == KEY_DOWN:
			move_player(0, 1)
		elif event.keycode == KEY_LEFT:
			move_player(-1, 0)
		elif event.keycode == KEY_RIGHT:
			move_player(1, 0)


func _build_ui() -> void:
	var ui_layer := CanvasLayer.new()
	add_child(ui_layer)

	var root := Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	ui_layer.add_child(root)

	var room_label := Label.new()
	room_label.text = String(room["name"]).to_upper()
	room_label.position = Vector2(20, 40)
	room_label.add_theme_color_override("font_color", Color8(146, 152, 168))
	room_label.add_theme_font_size_override("font_size", 14)
	root.add_child(room_label)

	credits_label = Label.new()
	credits_label.position = Vector2(320, 40)
	credits_label.add_theme_color_override("font_color", Color8(245, 158, 11))
	credits_label.add_theme_font_size_override("font_size", 14)
	root.add_child(credits_label)

	var quest_btn := UIHelpers.make_button("Quests", Callable(self, "_open_quest_log"))
	quest_btn.position = Vector2(390, 30)
	root.add_child(quest_btn)

	var dpad_up := UIHelpers.make_button("^", Callable(self, "_move_up"))
	dpad_up.position = Vector2(220, 650)
	root.add_child(dpad_up)
	var dpad_left := UIHelpers.make_button("<", Callable(self, "_move_left"))
	dpad_left.position = Vector2(160, 700)
	root.add_child(dpad_left)
	var dpad_right := UIHelpers.make_button(">", Callable(self, "_move_right"))
	dpad_right.position = Vector2(280, 700)
	root.add_child(dpad_right)
	var dpad_down := UIHelpers.make_button("v", Callable(self, "_move_down"))
	dpad_down.position = Vector2(220, 750)
	root.add_child(dpad_down)

	dialogue_panel = Panel.new()
	dialogue_panel.position = Vector2(20, 480)
	dialogue_panel.size = Vector2(440, 140)
	dialogue_panel.visible = false
	var dstyle := StyleBoxFlat.new()
	dstyle.bg_color = Color8(18, 21, 28)
	dstyle.border_color = Color8(58, 63, 75)
	dstyle.border_width_top = 2
	dstyle.border_width_bottom = 2
	dstyle.border_width_left = 2
	dstyle.border_width_right = 2
	dstyle.corner_radius_top_left = 10
	dstyle.corner_radius_top_right = 10
	dstyle.corner_radius_bottom_left = 10
	dstyle.corner_radius_bottom_right = 10
	dialogue_panel.add_theme_stylebox_override("panel", dstyle)
	root.add_child(dialogue_panel)

	dialogue_speaker_label = Label.new()
	dialogue_speaker_label.position = Vector2(16, 12)
	dialogue_speaker_label.add_theme_color_override("font_color", Color8(139, 147, 255))
	dialogue_speaker_label.add_theme_font_size_override("font_size", 13)
	dialogue_panel.add_child(dialogue_speaker_label)

	dialogue_line_label = Label.new()
	dialogue_line_label.position = Vector2(16, 40)
	dialogue_line_label.size = Vector2(410, 80)
	dialogue_line_label.autowrap_mode = TextServer.AUTOWRAP_WORD
	dialogue_line_label.add_theme_color_override("font_color", Color8(230, 232, 239))
	dialogue_line_label.add_theme_font_size_override("font_size", 14)
	dialogue_panel.add_child(dialogue_line_label)

	dialogue_hint_label = Label.new()
	dialogue_hint_label.position = Vector2(300, 112)
	dialogue_hint_label.add_theme_color_override("font_color", Color8(107, 114, 128))
	dialogue_hint_label.add_theme_font_size_override("font_size", 11)
	dialogue_panel.add_child(dialogue_hint_label)

	var advance_btn := Button.new()
	advance_btn.flat = true
	advance_btn.set_anchors_preset(Control.PRESET_FULL_RECT)
	advance_btn.pressed.connect(Callable(self, "_advance_dialogue"))
	dialogue_panel.add_child(advance_btn)

extends Area2D
## An interactable case terminal. The player must walk up and press "interact"
## to open it, rather than triggering automatically on contact. One-shot:
## won't retrigger once the case has been completed.

@export var case_ui_scene: PackedScene
@export var case_data: Dictionary

var _cleared := false
var _active := false
var _player_in_range: PlayerEntity = null

@onready var prompt: Node = get_node_or_null("Prompt")


func _ready() -> void:
	body_entered.connect(_on_body_entered)
	body_exited.connect(_on_body_exited)
	_update_prompt()


func _process(_delta: float) -> void:
	if _player_in_range and not _cleared and not _active and Input.is_action_just_pressed("interact"):
		_open_case(_player_in_range)


func _on_body_entered(body: Node) -> void:
	if _cleared or not body is PlayerEntity:
		return
	_player_in_range = body
	_update_prompt()


func _on_body_exited(body: Node) -> void:
	if body == _player_in_range:
		_player_in_range = null
		_update_prompt()


func _update_prompt() -> void:
	if prompt:
		prompt.visible = _player_in_range != null and not _cleared and not _active


func _open_case(player: PlayerEntity) -> void:
	_active = true
	_update_prompt()
	player.stop()
	player.input_enabled = false
	var ui: CanvasLayer = case_ui_scene.instantiate()
	get_tree().root.add_child(ui)
	ui.case_completed.connect(func():
		_cleared = true
		_active = false
		player.input_enabled = true
		_update_prompt()
	)
	ui.open(case_data)

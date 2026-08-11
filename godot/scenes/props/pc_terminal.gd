extends Area2D
## A PC prop that opens computer_ui.gd when the player interacts with it.
## Same interact/pause pattern as npc_talker.gd, just opening the computer
## UI instead of a dialogue balloon.

const ComputerUI := preload("res://scenes/system/computer_ui.gd")

var _player_in_range: PlayerEntity = null

@onready var prompt: Node = get_node_or_null("Prompt")


func _ready() -> void:
	body_entered.connect(_on_body_entered)
	body_exited.connect(_on_body_exited)
	_update_prompt()


func _process(_delta: float) -> void:
	if _player_in_range and Input.is_action_just_pressed("interact"):
		_use_computer()


func _on_body_entered(body: Node) -> void:
	if body is PlayerEntity:
		_player_in_range = body
		_update_prompt()


func _on_body_exited(body: Node) -> void:
	if body == _player_in_range:
		_player_in_range = null
		_update_prompt()


func _update_prompt() -> void:
	if prompt:
		prompt.visible = _player_in_range != null


func _use_computer() -> void:
	# Matches case_trigger.gd's pattern (the closer analog - another
	# terminal-style prop opening a full UI modal), not npc_talker.gd's:
	# just disable player input, don't pause the tree. case_ui.gd's
	# buttons are only proven to receive input in the un-paused state.
	var player := _player_in_range
	player.stop()
	player.input_enabled = false
	prompt.visible = false

	var ui := ComputerUI.new()
	get_tree().root.add_child(ui)
	ui.open()
	await ui.computer_closed

	if is_instance_valid(player):
		player.input_enabled = true
	_update_prompt()

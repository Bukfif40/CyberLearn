extends Area2D
## A stationary NPC that shows a dialogue balloon when the player walks up
## and presses "interact". Used for background/mentor NPCs that don't need
## the full state-machine entity setup (e.g. Kessler, Mira).

@export var dialogue: DialogueResource
@export var title: String = ""

var _player_in_range: PlayerEntity = null

@onready var prompt: Node = get_node_or_null("Prompt")


func _ready() -> void:
	body_entered.connect(_on_body_entered)
	body_exited.connect(_on_body_exited)
	_update_prompt()


func _process(_delta: float) -> void:
	if _player_in_range and dialogue and Input.is_action_just_pressed("interact"):
		_talk()


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
		prompt.visible = _player_in_range != null and dialogue != null


func _talk() -> void:
	var player := _player_in_range
	player.stop()
	player.input_enabled = false
	prompt.visible = false
	get_tree().paused = true
	DialogueManager.show_dialogue_balloon(dialogue, title)
	await DialogueManager.dialogue_ended
	get_tree().paused = false
	if is_instance_valid(player):
		player.input_enabled = true
	_update_prompt()

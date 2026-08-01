extends Node2D

## Code-drawn placeholder player character: a small top-down chibi figure
## with a facing direction and a walk-bob animation. Exposes the same
## play("walk_<dir>") / play("idle_<dir>") interface as the AnimatedSprite2D
## path in UIHelpers.try_make_player_sprite(), so Main.gd doesn't need to
## know which one it's holding. Swap in real art any time by dropping a
## sheet at GameManager.PLAYER_SPRITE.sheet_path — no rework here needed.

const BODY_COLOR := Color8(108, 92, 231)
const ACCENT_COLOR := Color8(94, 234, 212)
const SKIN_COLOR := Color8(230, 200, 170)
const SHADOW_COLOR := Color8(64, 55, 138)
const EYE_COLOR := Color8(20, 20, 25)

var facing := "down"
var walking := false
var _anim_time := 0.0


func _ready() -> void:
	set_process(true)


func _process(delta: float) -> void:
	if walking:
		_anim_time += delta
		queue_redraw()


func play(anim_name: String) -> void:
	var parts := anim_name.split("_")
	var was_walking := walking
	walking = parts[0] == "walk"
	if parts.size() > 1:
		facing = parts[1]
	if not walking and was_walking:
		_anim_time = 0.0
	queue_redraw()


func _step_offset() -> float:
	if not walking:
		return 0.0
	return sin(_anim_time * 14.0) * 3.0


func _draw() -> void:
	var step := _step_offset()

	draw_rect(Rect2(-8, 9 + step, 6, 6), SHADOW_COLOR)
	draw_rect(Rect2(2, 9 - step, 6, 6), SHADOW_COLOR)

	draw_rect(Rect2(-10, -4, 20, 16), BODY_COLOR)
	draw_rect(Rect2(-10, -4, 20, 16), SHADOW_COLOR, false, 1.5)

	if facing == "left":
		draw_rect(Rect2(-8, -2, 3, 12), ACCENT_COLOR)
	elif facing == "right":
		draw_rect(Rect2(5, -2, 3, 12), ACCENT_COLOR)
	else:
		draw_rect(Rect2(-1.5, -2, 3, 12), ACCENT_COLOR)

	draw_circle(Vector2(0, -14), 9, SKIN_COLOR if facing != "up" else SHADOW_COLOR)

	if facing == "down":
		draw_circle(Vector2(-3, -15), 1.4, EYE_COLOR)
		draw_circle(Vector2(3, -15), 1.4, EYE_COLOR)
	elif facing == "left":
		draw_circle(Vector2(-4, -15), 1.4, EYE_COLOR)
	elif facing == "right":
		draw_circle(Vector2(4, -15), 1.4, EYE_COLOR)
	# facing == "up": no face drawn, just the back of the head

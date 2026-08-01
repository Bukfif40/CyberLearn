extends Node

# ---- Static content (same content as the earlier React Native prototype:
# data/world.ts, items.ts, quests.ts) ----

const ROOM := {
	"id": "fringeport-docks",
	"name": "Fringeport Docks",
	"width": 10,
	"height": 8,
	"road_y": 6,
	"road_x_start": 2,
	"road_x_end": 7,
	"player_start": Vector2i(1, 1),
}

const NPCS := [
	{
		"id": "kessler",
		"name": "Kessler",
		"role": "mentor",
		"badge": "K",
		"color": Color8(245, 158, 11),
		"sprite": "res://assets/sprites/kessler_sprite.png",
		"start": Vector2i(5, 3),
		"patrol": [Vector2i(4, 3), Vector2i(5, 3), Vector2i(6, 3)],
		"lines": [
			"You're the one who kept asking about the blackout. Good — that means you're paying attention.",
			"I used to defend the Lattice for a living. Now I do it off the books, because the city stopped reporting what really happens down here.",
			"Fringeport is where every scam in Meridian washes ashore first. There's a terminal in the corner flagging something. Go look — walk into it.",
		],
		"gives_quest": "investigate-phishing",
	},
	{
		"id": "vendor_mira",
		"name": "Mira",
		"role": "vendor",
		"badge": "$",
		"color": Color8(16, 185, 129),
		"sprite": "res://assets/sprites/mira_sprite.png",
		"start": Vector2i(2, 5),
		"patrol": [],
		"lines": [],
		"gives_quest": "",
	},
]

const VEHICLES := [
	{
		"id": "cargo-hauler",
		"badge": "T",
		"color": Color8(146, 152, 168),
		"path": [Vector2i(2, 6), Vector2i(3, 6), Vector2i(4, 6), Vector2i(5, 6), Vector2i(6, 6), Vector2i(7, 6)],
	},
]

const ENCOUNTERS := [
	{
		"id": "phishing-terminal",
		"name": "Suspicious Email Alert",
		"position": Vector2i(7, 5),
		"intro": "The terminal flashes red. An email just landed in the district comptroller's inbox: \"URGENT: Wire transfer approval needed within 1 hour — click here to review.\"",
		"credit_reward": 40,
		"questions": [
			{
				"prompt": "What should you check first?",
				"options": [
					"Click the link to see what it wants",
					"The sender's actual email address, not just the display name",
					"Forward it to the whole district as a warning",
					"Ignore it, urgent emails are usually fine",
				],
				"correct_index": 1,
				"correct_feedback": "Correct. Attackers spoof the display name constantly — the real sending address (and headers) is what actually tells you if it's legit.",
				"incorrect_feedback": "Not quite. Never click first — the sender's real address is the first thing to verify.",
			},
			{
				"prompt": "The sender address is \"comptroller@fringeport-finance.co\" instead of \"comptroller@fringeport.gov\". What is this?",
				"options": [
					"A normal IT migration",
					"A typosquatted / lookalike domain — a classic phishing sign",
					"Proof the email is safe",
					"A DNS error on your end",
				],
				"correct_index": 1,
				"correct_feedback": "Exactly — a lookalike domain designed to slip past a quick glance. That, plus urgency and a money request, is textbook Business Email Compromise.",
				"incorrect_feedback": "That's the tell of a lookalike/typosquatted domain — a very common phishing pattern, not a coincidence.",
			},
		],
	},
]

const ITEMS := [
	{"id": "analyst-toolkit", "name": "Analyst's Toolkit", "description": "A battered but reliable diagnostic rig. Mostly for show — but every real analyst has one.", "price": 30, "badge": "T", "color": Color8(108, 92, 231)},
	{"id": "lattice-badge", "name": "Lattice Access Badge", "description": "Mira's black-market badge replica. Doesn't open anything official, but it looks the part.", "price": 20, "badge": "B", "color": Color8(245, 158, 11)},
	{"id": "signal-jammer", "name": "Pocket Signal Jammer", "description": "Cuts local Lattice chatter for a few seconds. Mira swears it once saved her life. Probably an exaggeration.", "price": 55, "badge": "J", "color": Color8(239, 68, 68)},
]

const QUESTS := [
	{
		"id": "investigate-phishing",
		"title": "Something in the Wire",
		"giver": "kessler",
		"description": "Kessler wants you to check out a flagged terminal in Fringeport before it becomes a real problem.",
		"objectives": [
			{"id": "clear-phishing-terminal", "description": "Investigate the suspicious email alert", "encounter_id": "phishing-terminal"},
		],
		"credit_reward": 25,
	},
]

# The opening cutscene. Deliberately ends right where Kessler's existing
# Fringeport Docks dialogue picks up ("You're the one who kept asking about
# the blackout...") so the two read as one continuous scene.
const INTRO_CUTSCENE := [
	"MERIDIAN.\n\nA city that never sleeps — because it can't. Every district, every home, every transit line answers to one network: the Lattice.",
	"Six months ago, your block went dark. No warning. No explanation. Just three days without power, without medical records, without answers.",
	"The city called it routine maintenance. You didn't believe that then. You don't believe it now.",
	"You started asking questions. Most people stopped listening.\n\nOne person didn't.",
	"Her name is Kessler. She used to defend the Lattice for a living. Now she does it quietly — because the city stopped reporting what actually happens down here.",
	"Today, she's bringing you in.",
]

# ---- Runtime state (persists across scene changes since this is an autoload) ----

var credits: int = 20
var owned_item_ids: Dictionary = {}
var cleared_encounter_ids: Dictionary = {}
var active_quest_ids: Dictionary = {}
var completed_quest_ids: Dictionary = {}
var completed_objective_ids: Dictionary = {}

var player_grid_pos: Vector2i = ROOM["player_start"]

# Set right before change_scene_to_file so the target scene knows what to load.
var pending_encounter_id: String = ""
var pending_vendor_npc_id: String = ""

# Generic cutscene player state — any future story beat (district
# transitions, the ECHO reveal, the ending) reuses Cutscene.tscn by setting
# these two before navigating there, rather than a one-off scene per beat.
var pending_cutscene_beats: Array = []
var pending_cutscene_next_scene: String = "res://scenes/Main.tscn"


func get_npc(id: String) -> Dictionary:
	for n in NPCS:
		if n["id"] == id:
			return n
	return {}


func get_quest(id: String) -> Dictionary:
	for q in QUESTS:
		if q["id"] == id:
			return q
	return {}


func get_encounter(id: String) -> Dictionary:
	for e in ENCOUNTERS:
		if e["id"] == id:
			return e
	return {}


func get_item(id: String) -> Dictionary:
	for i in ITEMS:
		if i["id"] == id:
			return i
	return {}


func activate_quest(quest_id: String) -> void:
	if quest_id == "":
		return
	if active_quest_ids.has(quest_id) or completed_quest_ids.has(quest_id):
		return
	active_quest_ids[quest_id] = true


func buy_item(item: Dictionary) -> bool:
	if owned_item_ids.has(item["id"]):
		return false
	if credits < int(item["price"]):
		return false
	credits -= int(item["price"])
	owned_item_ids[item["id"]] = true
	return true


func clear_encounter(encounter: Dictionary) -> void:
	cleared_encounter_ids[encounter["id"]] = true
	credits += int(encounter["credit_reward"])

	for quest in QUESTS:
		var qid: String = quest["id"]
		if not active_quest_ids.has(qid) or completed_quest_ids.has(qid):
			continue
		for obj in quest["objectives"]:
			if obj["encounter_id"] == encounter["id"]:
				completed_objective_ids["%s:%s" % [qid, obj["id"]]] = true
		var all_done := true
		for obj in quest["objectives"]:
			if not completed_objective_ids.has("%s:%s" % [qid, obj["id"]]):
				all_done = false
				break
		if all_done:
			completed_quest_ids[qid] = true
			active_quest_ids.erase(qid)
			credits += int(quest["credit_reward"])

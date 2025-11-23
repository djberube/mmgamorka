extends Node

# Quest and Mission System
# Provides objectives and rewards for players

class Quest:
	var id: String
	var title: String
	var description: String
	var objectives: Array  # Array of Objective
	var rewards: Dictionary  # {"experience": 100, "gold": 50, "wood": 20}
	var required_level: int
	var is_active: bool
	var is_completed: bool
	var is_repeatable: bool

	func _init(_id: String, _title: String, _desc: String, _level: int = 1):
		id = _id
		title = _title
		description = _desc
		required_level = _level
		objectives = []
		rewards = {}
		is_active = false
		is_completed = false
		is_repeatable = false


class Objective:
	enum Type {
		GATHER_RESOURCE,
		KILL_ANIMALS,
		CRAFT_ITEM,
		BUILD_STRUCTURE,
		REACH_LOCATION,
		SURVIVE_TIME,
		REACH_LEVEL
	}

	var type: int
	var description: String
	var target: String  # Resource name, animal type, item name, etc.
	var target_amount: int
	var current_amount: int
	var is_complete: bool

	func _init(_type: int, _desc: String, _target: String = "", _amount: int = 1):
		type = _type
		description = _desc
		target = _target
		target_amount = _amount
		current_amount = 0
		is_complete = false

	func update_progress(amount: int = 1):
		current_amount += amount
		if current_amount >= target_amount:
			current_amount = target_amount
			is_complete = true


# Quest storage
var all_quests = {}
var active_quests = []
var completed_quests = []

signal quest_started(quest_id)
signal quest_completed(quest_id, rewards)
signal objective_updated(quest_id, objective_index, progress)


func _ready():
	_initialize_quests()


func _initialize_quests():
	# TUTORIAL QUESTS
	var q1 = Quest.new("tutorial_gather", "First Steps", "Gather basic resources to survive", 1)
	q1.objectives.append(Objective.new(Objective.Type.GATHER_RESOURCE, "Gather 10 wood", "wood", 10))
	q1.objectives.append(Objective.new(Objective.Type.GATHER_RESOURCE, "Gather 5 stone", "stone", 5))
	q1.rewards = {"experience": 50, "gold": 25}
	all_quests[q1.id] = q1

	var q2 = Quest.new("tutorial_craft", "Learn to Craft", "Craft your first tools", 1)
	q2.objectives.append(Objective.new(Objective.Type.CRAFT_ITEM, "Craft a Stone Axe", "stone_axe", 1))
	q2.rewards = {"experience": 75, "gold": 30}
	all_quests[q2.id] = q2

	var q3 = Quest.new("tutorial_build", "Build Shelter", "Construct your first building", 2)
	q3.objectives.append(Objective.new(Objective.Type.BUILD_STRUCTURE, "Build a Campfire", "campfire", 1))
	q3.rewards = {"experience": 100, "gold": 50}
	all_quests[q3.id] = q3

	# SURVIVAL QUESTS
	var q4 = Quest.new("survive_night", "Night Terrors", "Survive through the first night", 2)
	q4.objectives.append(Objective.new(Objective.Type.SURVIVE_TIME, "Survive until dawn", "night", 1))
	q4.rewards = {"experience": 150, "gold": 75, "food": 5}
	all_quests[q4.id] = q4

	var q5 = Quest.new("hunter", "The Hunter", "Hunt wild animals for food", 2)
	q5.objectives.append(Objective.new(Objective.Type.KILL_ANIMALS, "Kill 3 deer or rabbits", "deer", 3))
	q5.rewards = {"experience": 100, "gold": 60}
	all_quests[q5.id] = q5

	var q6 = Quest.new("apex_predator", "Apex Predator", "Defeat a dangerous animal", 5)
	q6.objectives.append(Objective.new(Objective.Type.KILL_ANIMALS, "Kill a wolf or bear", "wolf", 1))
	q6.rewards = {"experience": 250, "gold": 150}
	all_quests[q6.id] = q6

	# RESOURCE QUESTS
	var q7 = Quest.new("lumberjack", "Master Lumberjack", "Gather a large amount of wood", 3)
	q7.objectives.append(Objective.new(Objective.Type.GATHER_RESOURCE, "Gather 50 wood", "wood", 50))
	q7.rewards = {"experience": 200, "gold": 100}
	q7.is_repeatable = true
	all_quests[q7.id] = q7

	var q8 = Quest.new("miner", "Master Miner", "Gather a large amount of stone", 3)
	q8.objectives.append(Objective.new(Objective.Type.GATHER_RESOURCE, "Gather 30 stone", "stone", 30))
	q8.rewards = {"experience": 200, "gold": 100}
	q8.is_repeatable = true
	all_quests[q8.id] = q8

	var q9 = Quest.new("metalworker", "Metalworker", "Gather metal ore", 4)
	q9.objectives.append(Objective.new(Objective.Type.GATHER_RESOURCE, "Gather 20 metal", "metal", 20))
	q9.rewards = {"experience": 300, "gold": 200}
	all_quests[q9.id] = q9

	# BUILDING QUESTS
	var q10 = Quest.new("base_builder", "Base Builder", "Construct essential buildings", 3)
	q10.objectives.append(Objective.new(Objective.Type.BUILD_STRUCTURE, "Build a Workbench", "workbench", 1))
	q10.objectives.append(Objective.new(Objective.Type.BUILD_STRUCTURE, "Build a Storage Chest", "storage_chest", 1))
	q10.rewards = {"experience": 250, "gold": 150}
	all_quests[q10.id] = q10

	var q11 = Quest.new("fortify", "Fortification", "Build defensive structures", 5)
	q11.objectives.append(Objective.new(Objective.Type.BUILD_STRUCTURE, "Build 5 Wooden Walls", "wooden_wall", 5))
	q11.rewards = {"experience": 300, "gold": 200}
	all_quests[q11.id] = q11

	var q12 = Quest.new("advanced_builder", "Advanced Builder", "Build advanced structures", 7)
	q12.objectives.append(Objective.new(Objective.Type.BUILD_STRUCTURE, "Build a Forge", "forge", 1))
	q12.objectives.append(Objective.new(Objective.Type.BUILD_STRUCTURE, "Build a Watchtower", "watchtower", 1))
	q12.rewards = {"experience": 500, "gold": 300, "metal": 10}
	all_quests[q12.id] = q12

	# CRAFTING QUESTS
	var q13 = Quest.new("weaponsmith", "Weaponsmith", "Craft advanced weapons", 5)
	q13.objectives.append(Objective.new(Objective.Type.CRAFT_ITEM, "Craft an Iron Sword", "iron_sword", 1))
	q13.objectives.append(Objective.new(Objective.Type.CRAFT_ITEM, "Craft a Bow", "bow", 1))
	q13.rewards = {"experience": 350, "gold": 250}
	all_quests[q13.id] = q13

	# EXPLORATION QUESTS
	var q14 = Quest.new("explorer", "Explorer", "Explore the world", 3)
	q14.objectives.append(Objective.new(Objective.Type.REACH_LOCATION, "Visit 5 different locations", "location", 5))
	q14.rewards = {"experience": 200, "gold": 150}
	all_quests[q14.id] = q14

	# PROGRESSION QUESTS
	var q15 = Quest.new("level_up_5", "Rising Power", "Reach level 5", 1)
	q15.objectives.append(Objective.new(Objective.Type.REACH_LEVEL, "Reach level 5", "level", 5))
	q15.rewards = {"experience": 500, "gold": 300}
	all_quests[q15.id] = q15

	var q16 = Quest.new("level_up_10", "Elite Survivor", "Reach level 10", 5)
	q16.objectives.append(Objective.new(Objective.Type.REACH_LEVEL, "Reach level 10", "level", 10))
	q16.rewards = {"experience": 1000, "gold": 600}
	all_quests[q16.id] = q16

	# DAILY QUESTS (repeatable)
	var q17 = Quest.new("daily_gather", "Daily Gathering", "Daily resource gathering", 1)
	q17.objectives.append(Objective.new(Objective.Type.GATHER_RESOURCE, "Gather 20 of any resource", "any", 20))
	q17.rewards = {"experience": 100, "gold": 50}
	q17.is_repeatable = true
	all_quests[q17.id] = q17


func start_quest(quest_id: String, character: Character) -> bool:
	if not quest_id in all_quests:
		return false

	var quest = all_quests[quest_id]

	# Check if already active or completed
	if quest.is_active:
		return false
	if quest.is_completed and not quest.is_repeatable:
		return false

	# Check level requirement
	if character.level < quest.required_level:
		return false

	# Activate quest
	quest.is_active = true
	quest.is_completed = false
	active_quests.append(quest_id)

	# Reset objectives
	for objective in quest.objectives:
		objective.current_amount = 0
		objective.is_complete = false

	emit_signal("quest_started", quest_id)
	return true


func update_objective(quest_id: String, objective_type: int, target: String, amount: int = 1):
	if not quest_id in all_quests:
		return

	var quest = all_quests[quest_id]
	if not quest.is_active:
		return

	# Update matching objectives
	for i in range(quest.objectives.size()):
		var obj = quest.objectives[i]
		if obj.type == objective_type and (obj.target == target or obj.target == "any"):
			if not obj.is_complete:
				obj.update_progress(amount)
				emit_signal("objective_updated", quest_id, i, obj.current_amount)

	# Check if quest is complete
	check_quest_completion(quest_id)


func check_quest_completion(quest_id: String):
	if not quest_id in all_quests:
		return

	var quest = all_quests[quest_id]
	var all_complete = true

	for obj in quest.objectives:
		if not obj.is_complete:
			all_complete = false
			break

	if all_complete:
		complete_quest(quest_id)


func complete_quest(quest_id: String) -> Dictionary:
	if not quest_id in all_quests:
		return {}

	var quest = all_quests[quest_id]
	quest.is_active = false
	quest.is_completed = true

	active_quests.erase(quest_id)
	if not quest.is_repeatable:
		completed_quests.append(quest_id)

	emit_signal("quest_completed", quest_id, quest.rewards)
	return quest.rewards


func give_rewards(character: Character, rewards: Dictionary):
	for reward_type in rewards:
		var amount = rewards[reward_type]
		match reward_type:
			"experience":
				character.gain_experience(amount)
			"gold", "wood", "stone", "metal", "food":
				character.add_resource(reward_type, amount)


func get_available_quests(character: Character) -> Array:
	var available = []
	for quest_id in all_quests:
		var quest = all_quests[quest_id]
		if not quest.is_active and (not quest.is_completed or quest.is_repeatable):
			if character.level >= quest.required_level:
				available.append(quest_id)
	return available


func get_quest_progress(quest_id: String) -> String:
	if not quest_id in all_quests:
		return ""

	var quest = all_quests[quest_id]
	var progress = ""

	for i in range(quest.objectives.size()):
		var obj = quest.objectives[i]
		progress += "%s: %d/%d\n" % [obj.description, obj.current_amount, obj.target_amount]

	return progress

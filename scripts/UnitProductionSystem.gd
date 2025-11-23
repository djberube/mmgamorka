extends Node

# Unit Production System (AoE2 inspired)
# Allows buildings to train units

class UnitTemplate:
	var id: String
	var name: String
	var description: String
	var unit_type: String  # "villager", "infantry", "archer", "cavalry", "siege"
	var cost: Dictionary  # {"food": 50, "gold": 0}
	var training_time: float
	var health: float
	var attack: float
	var armor: float
	var move_speed: float
	var required_building: String
	var required_tech: String

	func _init(
		_id: String,
		_name: String,
		_desc: String,
		_type: String,
		_cost: Dictionary,
		_time: float,
		_hp: float,
		_atk: float,
		_armor: float,
		_speed: float,
		_building: String = "",
		_tech: String = ""
	):
		id = _id
		name = _name
		description = _desc
		unit_type = _type
		cost = _cost
		training_time = _time
		health = _hp
		attack = _atk
		armor = _armor
		move_speed = _speed
		required_building = _building
		required_tech = _tech


class TrainingQueue:
	var building: Building
	var queue: Array  # Array of unit IDs
	var current_unit: String
	var training_progress: float

	func _init(_building: Building):
		building = _building
		queue = []
		current_unit = ""
		training_progress = 0.0


# All unit templates
var unit_templates = {}

# Training queues for each building
var training_queues = {}

# Population management
var max_population = 50
var current_population = 0
var population_per_house = 5

signal unit_trained(unit_id, building, template)
signal training_started(unit_id, building)
signal population_limit_reached()


func _ready():
	_initialize_unit_templates()


func _process(delta):
	if not Network.is_server:
		return

	# Update all training queues
	for building_id in training_queues:
		_update_training_queue(building_id, delta)


func _initialize_unit_templates():
	# CIVILIAN UNITS
	unit_templates["villager"] = UnitTemplate.new(
		"villager",
		"Villager",
		"Basic worker unit - gathers resources and builds",
		"villager",
		{"food": 50},
		25.0,
		25.0,
		3.0,
		0.0,
		40.0,
		"house"
	)

	# DARK AGE UNITS
	unit_templates["militia"] = UnitTemplate.new(
		"militia",
		"Militia",
		"Basic infantry unit",
		"infantry",
		{"food": 60, "gold": 20},
		21.0,
		40.0,
		4.0,
		0.0,
		45.0,
		"barracks"
	)

	unit_templates["spearman"] = UnitTemplate.new(
		"spearman",
		"Spearman",
		"Anti-cavalry infantry",
		"infantry",
		{"food": 35, "wood": 25},
		22.0,
		45.0,
		3.0,
		0.0,
		40.0,
		"barracks"
	)

	# FEUDAL AGE UNITS
	unit_templates["man_at_arms"] = UnitTemplate.new(
		"man_at_arms",
		"Man-at-Arms",
		"Upgraded infantry unit",
		"infantry",
		{"food": 60, "gold": 20},
		21.0,
		60.0,
		6.0,
		1.0,
		45.0,
		"barracks",
		"feudal_age"
	)

	unit_templates["archer"] = UnitTemplate.new(
		"archer",
		"Archer",
		"Basic ranged unit",
		"archer",
		{"wood": 25, "gold": 45},
		35.0,
		30.0,
		4.0,
		0.0,
		45.0,
		"archery_range"
	)

	unit_templates["skirmisher"] = UnitTemplate.new(
		"skirmisher",
		"Skirmisher",
		"Anti-archer unit",
		"archer",
		{"food": 25, "wood": 35},
		22.0,
		30.0,
		2.0,
		3.0,
		46.0,
		"archery_range"
	)

	unit_templates["scout_cavalry"] = UnitTemplate.new(
		"scout_cavalry",
		"Scout Cavalry",
		"Fast reconnaissance unit",
		"cavalry",
		{"food": 80},
		30.0,
		45.0,
		3.0,
		2.0,
		80.0,
		"stable"
	)

	# CASTLE AGE UNITS
	unit_templates["knight"] = UnitTemplate.new(
		"knight",
		"Knight",
		"Heavy cavalry unit",
		"cavalry",
		{"food": 60, "gold": 75},
		30.0,
		100.0,
		10.0,
		2.0,
		70.0,
		"stable",
		"castle_age"
	)

	unit_templates["crossbowman"] = UnitTemplate.new(
		"crossbowman",
		"Crossbowman",
		"Upgraded archer",
		"archer",
		{"wood": 25, "gold": 45},
		27.0,
		35.0,
		5.0,
		0.0,
		46.0,
		"archery_range",
		"castle_age"
	)

	unit_templates["pikeman"] = UnitTemplate.new(
		"pikeman",
		"Pikeman",
		"Strong anti-cavalry unit",
		"infantry",
		{"food": 35, "wood": 25},
		22.0,
		55.0,
		4.0,
		0.0,
		40.0,
		"barracks",
		"castle_age"
	)

	# IMPERIAL AGE UNITS
	unit_templates["champion"] = UnitTemplate.new(
		"champion",
		"Champion",
		"Elite infantry",
		"infantry",
		{"food": 60, "gold": 20},
		21.0,
		70.0,
		13.0,
		1.0,
		45.0,
		"barracks",
		"imperial_age"
	)

	unit_templates["paladin"] = UnitTemplate.new(
		"paladin",
		"Paladin",
		"Elite heavy cavalry",
		"cavalry",
		{"food": 60, "gold": 75},
		30.0,
		160.0,
		14.0,
		3.0,
		70.0,
		"stable",
		"imperial_age"
	)

	# SPECIAL UNITS
	unit_templates["battering_ram"] = UnitTemplate.new(
		"battering_ram",
		"Battering Ram",
		"Siege weapon for destroying buildings",
		"siege",
		{"wood": 160, "gold": 75},
		36.0,
		175.0,
		2.0,
		-3.0,
		30.0,
		"siege_workshop"
	)

	unit_templates["trebuchet"] = UnitTemplate.new(
		"trebuchet",
		"Trebuchet",
		"Long-range siege weapon",
		"siege",
		{"wood": 200, "gold": 200},
		50.0,
		150.0,
		200.0,
		2.0,
		20.0,
		"siege_workshop",
		"imperial_age"
	)


func create_training_queue(building: Building):
	var building_id = building.get_instance_id()
	if not building_id in training_queues:
		training_queues[building_id] = TrainingQueue.new(building)


func queue_unit(building: Building, unit_id: String, player_character: Character) -> bool:
	if not unit_id in unit_templates:
		return false

	var template = unit_templates[unit_id]

	# Check population limit
	if current_population >= max_population:
		emit_signal("population_limit_reached")
		return false

	# Check if player can afford it
	for resource in template.cost:
		var cost = template.cost[resource]
		var available = 0

		match resource:
			"food":
				available = player_character.food_count
			"wood":
				available = player_character.wood
			"gold":
				available = player_character.gold
			"stone":
				available = player_character.stone

		if available < cost:
			return false

	# Deduct resources
	for resource in template.cost:
		player_character.spend_resource(resource, template.cost[resource])

	# Add to queue
	var building_id = building.get_instance_id()
	create_training_queue(building)
	var queue = training_queues[building_id]
	queue.queue.append(unit_id)

	emit_signal("training_started", unit_id, building)
	return true


func _update_training_queue(building_id, delta):
	var queue = training_queues[building_id]

	# Start training next unit if queue is not empty
	if queue.current_unit == "" and queue.queue.size() > 0:
		queue.current_unit = queue.queue[0]
		queue.queue.remove(0)
		queue.training_progress = 0.0

	# Update training progress
	if queue.current_unit != "":
		var template = unit_templates[queue.current_unit]
		queue.training_progress += delta

		if queue.training_progress >= template.training_time:
			# Unit training complete
			_spawn_unit(queue.current_unit, queue.building)
			queue.current_unit = ""
			queue.training_progress = 0.0


func _spawn_unit(unit_id: String, building: Building):
	var template = unit_templates[unit_id]

	# Create character/unit from template
	var character_scene = preload("res://scenes/characters/Character.tscn")
	var unit = character_scene.instance()

	# Set up unit stats based on template
	var unit_info = {
		"char_name": template.name,
		"template": randi() % 7,  # Random appearance
		"position": building.position + Vector2(50, 50),  # Spawn near building
		"color": Color(0.5, 0.5, 1.0),
		"player_id": building.owner_id
	}

	unit.setup_from_info(unit_info)
	unit.MAX_HEALTH = template.health
	unit.health = template.health
	unit.walking_speed = template.move_speed
	unit.running_speed = template.move_speed * 1.5

	# Add to game
	var map = get_node_or_null("/root/World/Map")
	if map:
		map.call_deferred("add_child", unit)

	current_population += 1
	emit_signal("unit_trained", unit_id, building, template)


func cancel_current_training(building: Building) -> bool:
	var building_id = building.get_instance_id()
	if not building_id in training_queues:
		return false

	var queue = training_queues[building_id]
	if queue.current_unit != "":
		# Refund partial resources
		var template = unit_templates[queue.current_unit]
		var refund_percentage = 1.0 - (queue.training_progress / template.training_time)

		# TODO: Refund resources to player

		queue.current_unit = ""
		queue.training_progress = 0.0
		return true

	return false


func get_queue_status(building: Building) -> Dictionary:
	var building_id = building.get_instance_id()
	if not building_id in training_queues:
		return {}

	var queue = training_queues[building_id]
	return {
		"current_unit": queue.current_unit,
		"progress": queue.training_progress,
		"queue_size": queue.queue.size()
	}


func add_population_capacity(amount: int):
	max_population += amount


func get_unit_info(unit_id: String) -> Dictionary:
	if not unit_id in unit_templates:
		return {}

	var template = unit_templates[unit_id]
	return {
		"name": template.name,
		"description": template.description,
		"type": template.unit_type,
		"cost": template.cost,
		"time": template.training_time,
		"health": template.health,
		"attack": template.attack,
		"armor": template.armor,
		"speed": template.move_speed
	}

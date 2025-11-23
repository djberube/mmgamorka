extends StaticBody2D
class_name Building

# Building System (AoE2 + Raft inspired)
# Placeable structures that provide benefits

enum BuildingType {
	CAMPFIRE,
	WORKBENCH,
	STORAGE_CHEST,
	WOODEN_WALL,
	STONE_WALL,
	WATCHTOWER,
	FORGE,
	FARM_PLOT,
	WATER_COLLECTOR,
	WOODEN_RAFT,
	HOUSE,
	BARRACKS,
	ARCHERY_RANGE,
	STABLE,
	MARKET,
	BLACKSMITH,
	MILL,
	LUMBER_CAMP,
	MINING_CAMP
}

enum BuildingState {
	BLUEPRINT,     # Being placed
	CONSTRUCTING,  # Being built
	COMPLETE,      # Fully functional
	DAMAGED,       # Needs repair
	DESTROYED      # Rubble
}

export(BuildingType) var building_type = BuildingType.CAMPFIRE
export var max_health = 200.0
export var construction_time = 5.0
export var provides_warmth = false
export var warmth_radius = 100.0
export var storage_capacity = 0
export var produces_resource = ""
export var production_rate = 0.0
export var garrison_capacity = 0

var health = 0.0
var state = BuildingState.BLUEPRINT
var construction_progress = 0.0
var owner_id = -1
var production_timer = 0.0
var garrisoned_units = []

# Visual
var blueprint_color = Color(0.5, 0.5, 1.0, 0.5)
var complete_color = Color.white

signal construction_complete(building)
signal building_destroyed(building)
signal resource_produced(resource_type, amount)


func _ready():
	_setup_building_stats()
	_update_appearance()


func _setup_building_stats():
	match building_type:
		BuildingType.CAMPFIRE:
			max_health = 50.0
			construction_time = 3.0
			provides_warmth = true
			warmth_radius = 150.0

		BuildingType.WORKBENCH:
			max_health = 100.0
			construction_time = 5.0

		BuildingType.STORAGE_CHEST:
			max_health = 80.0
			construction_time = 4.0
			storage_capacity = 20

		BuildingType.WOODEN_WALL:
			max_health = 150.0
			construction_time = 2.0

		BuildingType.STONE_WALL:
			max_health = 500.0
			construction_time = 6.0

		BuildingType.WATCHTOWER:
			max_health = 300.0
			construction_time = 15.0
			garrison_capacity = 5

		BuildingType.FORGE:
			max_health = 250.0
			construction_time = 20.0

		BuildingType.FARM_PLOT:
			max_health = 100.0
			construction_time = 4.0
			produces_resource = "food"
			production_rate = 10.0  # Per minute

		BuildingType.WATER_COLLECTOR:
			max_health = 80.0
			construction_time = 3.0

		BuildingType.WOODEN_RAFT:
			max_health = 200.0
			construction_time = 10.0

		# AoE2-style buildings
		BuildingType.HOUSE:
			max_health = 150.0
			construction_time = 5.0

		BuildingType.BARRACKS:
			max_health = 300.0
			construction_time = 12.0

		BuildingType.ARCHERY_RANGE:
			max_health = 250.0
			construction_time = 12.0

		BuildingType.STABLE:
			max_health = 300.0
			construction_time = 15.0

		BuildingType.MARKET:
			max_health = 200.0
			construction_time = 10.0

		BuildingType.BLACKSMITH:
			max_health = 250.0
			construction_time = 15.0

		BuildingType.MILL:
			max_health = 180.0
			construction_time = 8.0
			produces_resource = "food"
			production_rate = 15.0

		BuildingType.LUMBER_CAMP:
			max_health = 150.0
			construction_time = 6.0

		BuildingType.MINING_CAMP:
			max_health = 150.0
			construction_time = 6.0


func _process(delta):
	if not Network.is_server:
		return

	match state:
		BuildingState.CONSTRUCTING:
			_update_construction(delta)
		BuildingState.COMPLETE:
			_update_production(delta)
			_update_benefits(delta)


func start_construction(by_character: Character):
	owner_id = by_character.id
	state = BuildingState.CONSTRUCTING
	construction_progress = 0.0
	health = max_health * 0.1  # Start at 10% health
	rpc("sync_state", state, construction_progress)


func _update_construction(delta):
	construction_progress += delta

	if construction_progress >= construction_time:
		complete_construction()
	else:
		# Health increases as construction progresses
		health = max_health * (0.1 + 0.9 * (construction_progress / construction_time))
		rpc("sync_construction_progress", construction_progress)


func complete_construction():
	state = BuildingState.COMPLETE
	health = max_health
	emit_signal("construction_complete", self)
	rpc("sync_state", state, 1.0)
	rpc("show_completion_effect")


func _update_production(delta):
	if produces_resource == "":
		return

	production_timer += delta

	# Produce resource every minute
	if production_timer >= 60.0 / production_rate:
		production_timer = 0.0
		var amount = 1
		emit_signal("resource_produced", produces_resource, amount)
		# Add to nearby owner character if found
		var owner = _find_owner_character()
		if owner:
			owner.add_resource(produces_resource, amount)


func _update_benefits(delta):
	# Provide warmth to nearby characters
	if provides_warmth:
		var characters = get_tree().get_nodes_in_group("characters")
		for character in characters:
			if character is Character:
				var distance = position.distance_to(character.position)
				if distance <= warmth_radius:
					character.warm_up(5 * delta)


func take_damage(amount: float):
	health -= amount
	rpc("sync_health", health)

	if health <= 0:
		destroy()
	elif health < max_health * 0.3:
		state = BuildingState.DAMAGED


func repair(amount: float):
	health = min(max_health, health + amount)
	if health >= max_health * 0.3:
		state = BuildingState.COMPLETE
	rpc("sync_health", health)


func destroy():
	state = BuildingState.DESTROYED
	emit_signal("building_destroyed", self)
	rpc("show_destroy_effect")

	# Leave rubble for a bit, then remove
	yield(get_tree().create_timer(10.0), "timeout")
	queue_free()


func _find_owner_character():
	var characters = get_tree().get_nodes_in_group("characters")
	for character in characters:
		if character.id == owner_id:
			return character
	return null


func _update_appearance():
	if not has_node("Sprite"):
		return

	match state:
		BuildingState.BLUEPRINT:
			$Sprite.modulate = blueprint_color
		BuildingState.CONSTRUCTING:
			var progress = construction_progress / construction_time
			$Sprite.modulate = blueprint_color.linear_interpolate(complete_color, progress)
		BuildingState.COMPLETE:
			$Sprite.modulate = complete_color
		BuildingState.DAMAGED:
			$Sprite.modulate = Color(0.8, 0.6, 0.6)
		BuildingState.DESTROYED:
			$Sprite.modulate = Color(0.3, 0.3, 0.3, 0.5)


func get_building_name():
	match building_type:
		BuildingType.CAMPFIRE:
			return "Campfire"
		BuildingType.WORKBENCH:
			return "Workbench"
		BuildingType.STORAGE_CHEST:
			return "Storage Chest"
		BuildingType.WOODEN_WALL:
			return "Wooden Wall"
		BuildingType.STONE_WALL:
			return "Stone Wall"
		BuildingType.WATCHTOWER:
			return "Watchtower"
		BuildingType.FORGE:
			return "Forge"
		BuildingType.FARM_PLOT:
			return "Farm Plot"
		BuildingType.WATER_COLLECTOR:
			return "Water Collector"
		BuildingType.WOODEN_RAFT:
			return "Wooden Raft"
		BuildingType.HOUSE:
			return "House"
		BuildingType.BARRACKS:
			return "Barracks"
		BuildingType.ARCHERY_RANGE:
			return "Archery Range"
		BuildingType.STABLE:
			return "Stable"
		BuildingType.MARKET:
			return "Market"
		BuildingType.BLACKSMITH:
			return "Blacksmith"
		BuildingType.MILL:
			return "Mill"
		BuildingType.LUMBER_CAMP:
			return "Lumber Camp"
		BuildingType.MINING_CAMP:
			return "Mining Camp"
	return "Building"


# --- REMOTE FUNCTIONS ---

remotesync func sync_state(new_state, progress):
	state = new_state
	construction_progress = progress
	_update_appearance()


remotesync func sync_construction_progress(progress):
	construction_progress = progress
	_update_appearance()


remotesync func sync_health(new_health):
	health = new_health


remotesync func show_completion_effect():
	var heal_fx_scene = preload("res://scenes/effects/HealFX.tscn")
	var fx = heal_fx_scene.instance()
	fx.position = position
	fx.modulate = Color.green
	EventBus.emit_signal("fx_created", fx)


remotesync func show_destroy_effect():
	state = BuildingState.DESTROYED
	_update_appearance()

	var hit_fx_scene = preload("res://scenes/effects/HitFX.tscn")
	var fx = hit_fx_scene.instance()
	fx.position = position
	fx.start_color = Color.orange
	EventBus.emit_signal("fx_created", fx)

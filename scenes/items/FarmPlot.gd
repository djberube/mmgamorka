extends Building

# Farming System (Raft inspired)
# Grow crops for food

enum CropType {
	NONE,
	WHEAT,
	POTATO,
	CARROT,
	TOMATO,
	CORN,
	BERRY
}

enum GrowthStage {
	PLANTED,
	SEEDLING,
	GROWING,
	MATURE,
	READY_TO_HARVEST
}

var current_crop = CropType.NONE
var growth_stage = GrowthStage.PLANTED
var growth_progress = 0.0
var water_level = 100.0
var fertilizer_level = 0.0

# Crop settings
var crop_growth_times = {
	CropType.WHEAT: 120.0,      # 2 minutes
	CropType.POTATO: 150.0,     # 2.5 minutes
	CropType.CARROT: 90.0,      # 1.5 minutes
	CropType.TOMATO: 180.0,     # 3 minutes
	CropType.CORN: 200.0,       # 3.3 minutes
	CropType.BERRY: 100.0       # 1.7 minutes
}

var crop_yields = {
	CropType.WHEAT: 5,
	CropType.POTATO: 3,
	CropType.CARROT: 4,
	CropType.TOMATO: 6,
	CropType.CORN: 7,
	CropType.BERRY: 8
}

# Environmental effects
var water_depletion_rate = 1.0  # per minute
var growth_speed_modifier = 1.0


func _ready():
	._ready()  # Call parent Building._ready()


func _process(delta):
	._process(delta)  # Call parent Building._process()

	if not Network.is_server:
		return

	if state == BuildingState.COMPLETE and current_crop != CropType.NONE:
		_update_crop_growth(delta)
		_update_water(delta)


func plant_crop(crop_type: int, planter: Character):
	if current_crop != CropType.NONE:
		planter.say("Already planted!")
		return false

	if crop_type < CropType.WHEAT or crop_type > CropType.BERRY:
		return false

	current_crop = crop_type
	growth_stage = GrowthStage.PLANTED
	growth_progress = 0.0
	water_level = 100.0

	rpc("sync_crop_state", current_crop, growth_stage, growth_progress)
	planter.say("Planted!")
	return true


func _update_crop_growth(delta):
	if growth_stage >= GrowthStage.READY_TO_HARVEST:
		return

	# Deplete water over time
	water_level = max(0, water_level - (water_depletion_rate * delta / 60.0))

	# Growth slows if water is low
	var water_modifier = 1.0
	if water_level < 30:
		water_modifier = 0.5
	elif water_level < 60:
		water_modifier = 0.75

	# Apply growth
	var base_growth = delta
	var modified_growth = base_growth * growth_speed_modifier * water_modifier

	growth_progress += modified_growth

	# Get weather effects
	var weather_system = get_node_or_null("/root/WeatherSystem")
	if weather_system:
		# Rain waters crops
		if weather_system.current_weather == weather_system.WeatherType.RAIN:
			water_level = min(100, water_level + 10 * delta)

		# Cold slows growth
		if weather_system.ambient_temperature < 50:
			modified_growth *= 0.5

	# Determine growth stage
	var growth_time = crop_growth_times[current_crop]
	var progress_percent = growth_progress / growth_time

	if progress_percent >= 1.0:
		growth_stage = GrowthStage.READY_TO_HARVEST
	elif progress_percent >= 0.75:
		growth_stage = GrowthStage.MATURE
	elif progress_percent >= 0.5:
		growth_stage = GrowthStage.GROWING
	elif progress_percent >= 0.25:
		growth_stage = GrowthStage.SEEDLING
	else:
		growth_stage = GrowthStage.PLANTED

	# Sync to clients periodically
	if int(growth_progress) % 5 == 0:  # Every 5 seconds
		rpc("sync_crop_state", current_crop, growth_stage, growth_progress)


func _update_water(delta):
	# Natural water depletion handled in _update_crop_growth
	pass


func water_crop(waterer: Character):
	if current_crop == CropType.NONE:
		waterer.say("Nothing planted!")
		return false

	if water_level >= 100:
		waterer.say("Already watered!")
		return false

	water_level = min(100, water_level + 50)
	rpc("show_water_effect")
	waterer.say("Watered!")
	return true


func fertilize_crop(fertilizer: Character):
	if current_crop == CropType.NONE:
		fertilizer.say("Nothing planted!")
		return false

	if fertilizer_level >= 100:
		fertilizer.say("Already fertilized!")
		return false

	fertilizer_level = min(100, fertilizer_level + 50)
	growth_speed_modifier = 1.0 + (fertilizer_level / 100.0)  # Up to 2x speed
	rpc("show_fertilize_effect")
	fertilizer.say("Fertilized!")
	return true


func harvest_crop(harvester: Character):
	if current_crop == CropType.NONE:
		harvester.say("Nothing to harvest!")
		return false

	if growth_stage < GrowthStage.READY_TO_HARVEST:
		harvester.say("Not ready yet!")
		return false

	# Give food to harvester
	var yield_amount = crop_yields[current_crop]

	# Bonus yield from fertilizer
	if fertilizer_level > 50:
		yield_amount += int(yield_amount * 0.5)

	harvester.add_resource("food", yield_amount)
	harvester.gain_experience(20)
	harvester.add_score(50)

	# Reset crop
	current_crop = CropType.NONE
	growth_stage = GrowthStage.PLANTED
	growth_progress = 0.0
	water_level = 100.0
	fertilizer_level = 0.0
	growth_speed_modifier = 1.0

	rpc("sync_crop_state", current_crop, growth_stage, growth_progress)
	rpc("show_harvest_effect")
	harvester.say("Harvested!")

	return true


func get_crop_name():
	match current_crop:
		CropType.WHEAT:
			return "Wheat"
		CropType.POTATO:
			return "Potato"
		CropType.CARROT:
			return "Carrot"
		CropType.TOMATO:
			return "Tomato"
		CropType.CORN:
			return "Corn"
		CropType.BERRY:
			return "Berry"
	return "None"


func get_growth_stage_name():
	match growth_stage:
		GrowthStage.PLANTED:
			return "Planted"
		GrowthStage.SEEDLING:
			return "Seedling"
		GrowthStage.GROWING:
			return "Growing"
		GrowthStage.MATURE:
			return "Mature"
		GrowthStage.READY_TO_HARVEST:
			return "Ready to Harvest"
	return "Unknown"


# --- REMOTE FUNCTIONS ---

remotesync func sync_crop_state(crop, stage, progress):
	current_crop = crop
	growth_stage = stage
	growth_progress = progress
	_update_crop_appearance()


remotesync func show_water_effect():
	var fx_scene = preload("res://scenes/effects/HealFX.tscn")
	var fx = fx_scene.instance()
	fx.position = position
	fx.modulate = Color.cyan
	EventBus.emit_signal("fx_created", fx)


remotesync func show_fertilize_effect():
	var fx_scene = preload("res://scenes/effects/HealFX.tscn")
	var fx = fx_scene.instance()
	fx.position = position
	fx.modulate = Color.brown
	EventBus.emit_signal("fx_created", fx)


remotesync func show_harvest_effect():
	var fx_scene = preload("res://scenes/effects/HealFX.tscn")
	var fx = fx_scene.instance()
	fx.position = position
	fx.modulate = Color.gold
	EventBus.emit_signal("fx_created", fx)


func _update_crop_appearance():
	if not has_node("Sprite"):
		return

	# Update sprite based on growth stage
	if current_crop == CropType.NONE:
		$Sprite.modulate = Color(0.6, 0.4, 0.2)  # Brown dirt
	else:
		match growth_stage:
			GrowthStage.PLANTED:
				$Sprite.modulate = Color(0.7, 0.5, 0.3)
			GrowthStage.SEEDLING:
				$Sprite.modulate = Color(0.6, 0.8, 0.4)
			GrowthStage.GROWING:
				$Sprite.modulate = Color(0.4, 0.9, 0.4)
			GrowthStage.MATURE:
				$Sprite.modulate = Color(0.3, 1.0, 0.3)
			GrowthStage.READY_TO_HARVEST:
				$Sprite.modulate = Color.gold

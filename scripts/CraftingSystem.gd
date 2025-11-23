extends Node

# Crafting System (Raft + AoE2 inspired)
# Handles recipes, crafting, and tech tree progression

class Recipe:
	var name: String
	var description: String
	var category: String  # "tools", "weapons", "buildings", "food", "upgrades"
	var required_resources: Dictionary  # {"wood": 10, "stone": 5}
	var required_level: int
	var crafting_time: float
	var tech_tier: int
	var unlocks: Array  # Other recipes this unlocks
	var result_item: String
	var result_count: int

	func _init(
		_name: String,
		_description: String,
		_category: String,
		_resources: Dictionary,
		_level: int = 1,
		_time: float = 1.0,
		_tier: int = 1,
		_result: String = "",
		_count: int = 1
	):
		name = _name
		description = _description
		category = _category
		required_resources = _resources
		required_level = _level
		crafting_time = _time
		tech_tier = _tier
		result_item = _result
		result_count = _count
		unlocks = []


# All available recipes
var recipes = {}
var unlocked_recipes = []


func _ready():
	_initialize_recipes()


func _initialize_recipes():
	# TIER 1 - Basic Tools
	recipes["stone_axe"] = Recipe.new(
		"Stone Axe",
		"Basic tool for chopping wood",
		"tools",
		{"wood": 5, "stone": 3},
		1, 2.0, 1, "stone_axe", 1
	)

	recipes["stone_pickaxe"] = Recipe.new(
		"Stone Pickaxe",
		"Basic tool for mining stone and ore",
		"tools",
		{"wood": 5, "stone": 5},
		1, 2.0, 1, "stone_pickaxe", 1
	)

	recipes["spear"] = Recipe.new(
		"Wooden Spear",
		"Basic hunting weapon",
		"weapons",
		{"wood": 8},
		1, 1.5, 1, "spear", 1
	)

	# TIER 1 - Basic Buildings
	recipes["campfire"] = Recipe.new(
		"Campfire",
		"Provides warmth and cooks food",
		"buildings",
		{"wood": 10, "stone": 5},
		1, 3.0, 1, "campfire", 1
	)

	recipes["workbench"] = Recipe.new(
		"Workbench",
		"Unlocks advanced crafting",
		"buildings",
		{"wood": 20},
		2, 5.0, 1, "workbench", 1
	)

	recipes["storage_chest"] = Recipe.new(
		"Storage Chest",
		"Stores extra items",
		"buildings",
		{"wood": 15},
		1, 3.0, 1, "storage_chest", 1
	)

	recipes["wooden_wall"] = Recipe.new(
		"Wooden Wall",
		"Basic defensive structure",
		"buildings",
		{"wood": 10},
		1, 2.0, 1, "wooden_wall", 1
	)

	# TIER 2 - Advanced Tools (requires workbench)
	recipes["iron_axe"] = Recipe.new(
		"Iron Axe",
		"Efficient wood gathering tool",
		"tools",
		{"wood": 10, "metal": 15},
		3, 4.0, 2, "iron_axe", 1
	)

	recipes["iron_pickaxe"] = Recipe.new(
		"Iron Pickaxe",
		"Efficient mining tool",
		"tools",
		{"wood": 10, "metal": 15},
		3, 4.0, 2, "iron_pickaxe", 1
	)

	# TIER 2 - Advanced Weapons
	recipes["bow"] = Recipe.new(
		"Bow",
		"Ranged weapon for hunting",
		"weapons",
		{"wood": 15, "stone": 5},
		3, 3.0, 2, "bow", 1
	)

	recipes["iron_sword"] = Recipe.new(
		"Iron Sword",
		"Powerful melee weapon",
		"weapons",
		{"wood": 5, "metal": 20},
		4, 5.0, 2, "iron_sword", 1
	)

	# TIER 2 - Farming
	recipes["farm_plot"] = Recipe.new(
		"Farm Plot",
		"Grow crops for food",
		"buildings",
		{"wood": 15, "stone": 10},
		3, 4.0, 2, "farm_plot", 1
	)

	recipes["water_collector"] = Recipe.new(
		"Water Collector",
		"Collects rainwater for drinking",
		"buildings",
		{"wood": 20},
		2, 3.0, 2, "water_collector", 1
	)

	# TIER 3 - Raft/Boat Building
	recipes["wooden_raft"] = Recipe.new(
		"Wooden Raft",
		"Basic water transportation",
		"buildings",
		{"wood": 50, "stone": 10},
		5, 10.0, 3, "wooden_raft", 1
	)

	recipes["fishing_rod"] = Recipe.new(
		"Fishing Rod",
		"Catch fish for food",
		"tools",
		{"wood": 10, "stone": 3},
		2, 2.0, 2, "fishing_rod", 1
	)

	# TIER 3 - Advanced Buildings
	recipes["stone_wall"] = Recipe.new(
		"Stone Wall",
		"Strong defensive structure",
		"buildings",
		{"stone": 30},
		5, 6.0, 3, "stone_wall", 1
	)

	recipes["watchtower"] = Recipe.new(
		"Watchtower",
		"Defensive structure with range bonus",
		"buildings",
		{"wood": 40, "stone": 50},
		6, 15.0, 3, "watchtower", 1
	)

	recipes["forge"] = Recipe.new(
		"Forge",
		"Smelt metal and craft advanced items",
		"buildings",
		{"stone": 50, "metal": 30},
		7, 20.0, 3, "forge", 1
	)

	# Food Recipes
	recipes["cooked_meat"] = Recipe.new(
		"Cooked Meat",
		"Restore hunger significantly",
		"food",
		{"food": 1},  # Raw meat
		1, 2.0, 1, "cooked_meat", 1
	)

	recipes["bread"] = Recipe.new(
		"Bread",
		"Nutritious food from wheat",
		"food",
		{"food": 3},  # Wheat
		2, 3.0, 2, "bread", 2
	)

	# Upgrades (AoE2 inspired)
	recipes["mining_upgrade"] = Recipe.new(
		"Mining Efficiency",
		"Gather stone and metal 25% faster",
		"upgrades",
		{"gold": 100, "stone": 50},
		4, 10.0, 2
	)

	recipes["woodcutting_upgrade"] = Recipe.new(
		"Woodcutting Efficiency",
		"Gather wood 25% faster",
		"upgrades",
		{"gold": 100, "wood": 50},
		4, 10.0, 2
	)

	recipes["farming_upgrade"] = Recipe.new(
		"Farming Efficiency",
		"Crops grow 50% faster",
		"upgrades",
		{"gold": 150, "food": 100},
		5, 15.0, 2
	)

	# Set up tech tree dependencies
	recipes["iron_axe"].unlocks = ["forge"]
	recipes["iron_pickaxe"].unlocks = ["forge"]
	recipes["workbench"].unlocks = ["iron_axe", "iron_pickaxe", "bow", "farm_plot"]
	recipes["forge"].unlocks = ["iron_sword", "mining_upgrade", "stone_wall"]

	# Unlock tier 1 recipes by default
	for recipe_key in recipes:
		if recipes[recipe_key].tech_tier == 1:
			unlocked_recipes.append(recipe_key)


func can_craft(recipe_key: String, character: Character) -> bool:
	if not recipe_key in recipes:
		return false

	var recipe = recipes[recipe_key]

	# Check if unlocked
	if not recipe_key in unlocked_recipes:
		return false

	# Check level requirement
	if character.level < recipe.required_level:
		return false

	# Check resources
	for resource in recipe.required_resources:
		var required = recipe.required_resources[resource]
		var available = 0

		match resource:
			"wood":
				available = character.wood
			"stone":
				available = character.stone
			"metal":
				available = character.metal
			"food":
				available = character.food_count
			"gold":
				available = character.gold

		if available < required:
			return false

	return true


func craft(recipe_key: String, character: Character) -> bool:
	if not can_craft(recipe_key, character):
		return false

	var recipe = recipes[recipe_key]

	# Consume resources
	for resource in recipe.required_resources:
		var required = recipe.required_resources[resource]
		character.spend_resource(resource, required)

	# Unlock new recipes
	for unlock_key in recipe.unlocks:
		if not unlock_key in unlocked_recipes:
			unlocked_recipes.append(unlock_key)

	# Give experience
	character.gain_experience(recipe.tech_tier * 25)

	return true


func get_unlocked_recipes_by_category(category: String) -> Array:
	var result = []
	for recipe_key in unlocked_recipes:
		if recipes[recipe_key].category == category:
			result.append(recipe_key)
	return result


func get_recipe_info(recipe_key: String) -> Dictionary:
	if not recipe_key in recipes:
		return {}

	var recipe = recipes[recipe_key]
	return {
		"name": recipe.name,
		"description": recipe.description,
		"category": recipe.category,
		"resources": recipe.required_resources,
		"level": recipe.required_level,
		"time": recipe.crafting_time,
		"tier": recipe.tech_tier,
		"unlocked": recipe_key in unlocked_recipes
	}

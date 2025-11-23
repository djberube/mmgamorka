extends CanvasLayer

# Enhanced HUD System
# Displays all survival stats, resources, quests, and more

var player_character: Character = null

# UI Elements (to be added to scene)
onready var health_bar = $VBoxContainer/Stats/HealthBar
onready var hunger_bar = $VBoxContainer/Stats/HungerBar
onready var thirst_bar = $VBoxContainer/Stats/ThirstBar
onready var stamina_bar = $VBoxContainer/Stats/StaminaBar
onready var temperature_bar = $VBoxContainer/Stats/TemperatureBar

onready var level_label = $VBoxContainer/Level/LevelLabel
onready var xp_label = $VBoxContainer/Level/XPLabel
onready var score_label = $VBoxContainer/Score/ScoreLabel

onready var resources_panel = $VBoxContainer/Resources
onready var wood_label = $VBoxContainer/Resources/WoodLabel
onready var stone_label = $VBoxContainer/Resources/StoneLabel
onready var metal_label = $VBoxContainer/Resources/MetalLabel
onready var food_label = $VBoxContainer/Resources/FoodLabel
onready var gold_label = $VBoxContainer/Resources/GoldLabel

onready var time_label = $VBoxContainer/Environment/TimeLabel
onready var weather_label = $VBoxContainer/Environment/WeatherLabel
onready var temp_label = $VBoxContainer/Environment/TempLabel

onready var quest_panel = $QuestPanel
onready var crafting_panel = $CraftingPanel
onready var minimap = $Minimap


func _ready():
	# Hide panels initially
	crafting_panel.visible = false
	quest_panel.visible = false


func _process(delta):
	if player_character:
		_update_stats()
		_update_resources()
		_update_level()
		_update_score()

	_update_environment()


func set_player(character: Character):
	player_character = character
	if player_character:
		player_character.connect("level_up", self, "_on_player_level_up")
		player_character.connect("survival_stat_changed", self, "_on_survival_stat_changed")


func _update_stats():
	if not player_character:
		return

	# Update health bar
	if health_bar:
		health_bar.value = (player_character.health / player_character.MAX_HEALTH) * 100
		health_bar.get_node("Label").text = "HP: %d/%d" % [player_character.health, player_character.MAX_HEALTH]

	# Update hunger bar
	if hunger_bar:
		hunger_bar.value = (player_character.hunger / player_character.MAX_HUNGER) * 100
		hunger_bar.get_node("Label").text = "Hunger: %d%%" % [hunger_bar.value]
		# Color coding
		if hunger_bar.value < 20:
			hunger_bar.get("custom_styles/fg").bg_color = Color.red
		elif hunger_bar.value < 50:
			hunger_bar.get("custom_styles/fg").bg_color = Color.orange
		else:
			hunger_bar.get("custom_styles/fg").bg_color = Color.green

	# Update thirst bar
	if thirst_bar:
		thirst_bar.value = (player_character.thirst / player_character.MAX_THIRST) * 100
		thirst_bar.get_node("Label").text = "Thirst: %d%%" % [thirst_bar.value]
		# Color coding
		if thirst_bar.value < 20:
			thirst_bar.get("custom_styles/fg").bg_color = Color.red
		elif thirst_bar.value < 50:
			thirst_bar.get("custom_styles/fg").bg_color = Color.orange
		else:
			thirst_bar.get("custom_styles/fg").bg_color = Color.cyan

	# Update stamina bar
	if stamina_bar:
		stamina_bar.value = (player_character.stamina / player_character.MAX_STAMINA) * 100
		stamina_bar.get_node("Label").text = "Stamina: %d%%" % [stamina_bar.value]

	# Update temperature
	if temperature_bar:
		temperature_bar.value = (player_character.temperature / player_character.MAX_TEMPERATURE) * 100
		temperature_bar.get_node("Label").text = "Temp: %d%%" % [temperature_bar.value]
		# Color coding
		if temperature_bar.value < 30:
			temperature_bar.get("custom_styles/fg").bg_color = Color.blue
		elif temperature_bar.value > 80:
			temperature_bar.get("custom_styles/fg").bg_color = Color.red
		else:
			temperature_bar.get("custom_styles/fg").bg_color = Color.green


func _update_resources():
	if not player_character:
		return

	if wood_label:
		wood_label.text = "Wood: %d" % player_character.wood
	if stone_label:
		stone_label.text = "Stone: %d" % player_character.stone
	if metal_label:
		metal_label.text = "Metal: %d" % player_character.metal
	if food_label:
		food_label.text = "Food: %d" % player_character.food_count
	if gold_label:
		gold_label.text = "Gold: %d" % player_character.gold


func _update_level():
	if not player_character:
		return

	if level_label:
		level_label.text = "Level %d" % player_character.level

	if xp_label:
		var xp_needed = player_character.level * 100
		var xp_progress = (float(player_character.experience) / float(xp_needed)) * 100
		xp_label.text = "XP: %d/%d (%d%%)" % [player_character.experience, xp_needed, xp_progress]


func _update_score():
	if not player_character:
		return

	if score_label:
		score_label.text = "Score: %d (x%d)" % [player_character.score, player_character.combo_multiplier]


func _update_environment():
	# Get weather system (if available)
	var weather_system = get_node_or_null("/root/WeatherSystem")
	if weather_system:
		if time_label:
			var hour = int(weather_system.time_of_day)
			var minute = int((weather_system.time_of_day - hour) * 60)
			var time_string = "%02d:%02d Day %d" % [hour, minute, weather_system.current_day]
			time_label.text = time_string

		if weather_label:
			weather_label.text = "%s (%s)" % [
				weather_system.get_weather_name(),
				weather_system.get_season_name()
			]

		if temp_label:
			temp_label.text = "Ambient: %.0fF" % weather_system.ambient_temperature


func toggle_crafting_menu():
	crafting_panel.visible = not crafting_panel.visible
	if crafting_panel.visible:
		_populate_crafting_recipes()


func toggle_quest_menu():
	quest_panel.visible = not quest_panel.visible
	if quest_panel.visible:
		_populate_quest_list()


func _populate_crafting_recipes():
	# Get crafting system
	var crafting_system = get_node_or_null("/root/CraftingSystem")
	if not crafting_system or not player_character:
		return

	# Clear existing recipes
	var recipe_list = crafting_panel.get_node("RecipeList")
	for child in recipe_list.get_children():
		child.queue_free()

	# Add unlocked recipes
	for recipe_key in crafting_system.unlocked_recipes:
		var recipe = crafting_system.recipes[recipe_key]
		var can_craft = crafting_system.can_craft(recipe_key, player_character)

		var recipe_button = Button.new()
		recipe_button.text = recipe.name
		if not can_craft:
			recipe_button.disabled = true
			recipe_button.text += " [LOCKED]"

		recipe_button.connect("pressed", self, "_on_craft_recipe", [recipe_key])
		recipe_list.add_child(recipe_button)


func _populate_quest_list():
	# Get quest system
	var quest_system = get_node_or_null("/root/QuestSystem")
	if not quest_system or not player_character:
		return

	# Clear existing quests
	var quest_list = quest_panel.get_node("QuestList")
	for child in quest_list.get_children():
		child.queue_free()

	# Add available quests
	var available = quest_system.get_available_quests(player_character)
	for quest_id in available:
		var quest = quest_system.all_quests[quest_id]

		var quest_button = Button.new()
		quest_button.text = quest.title
		quest_button.connect("pressed", self, "_on_accept_quest", [quest_id])
		quest_list.add_child(quest_button)

	# Add active quests
	for quest_id in quest_system.active_quests:
		var quest = quest_system.all_quests[quest_id]
		var progress_label = Label.new()
		progress_label.text = "[ACTIVE] %s\n%s" % [quest.title, quest_system.get_quest_progress(quest_id)]
		quest_list.add_child(progress_label)


func _on_craft_recipe(recipe_key):
	var crafting_system = get_node_or_null("/root/CraftingSystem")
	if crafting_system and player_character:
		if crafting_system.craft(recipe_key, player_character):
			show_notification("Crafted: %s" % crafting_system.recipes[recipe_key].name)
			_populate_crafting_recipes()  # Refresh list


func _on_accept_quest(quest_id):
	var quest_system = get_node_or_null("/root/QuestSystem")
	if quest_system and player_character:
		if quest_system.start_quest(quest_id, player_character):
			var quest = quest_system.all_quests[quest_id]
			show_notification("Quest Started: %s" % quest.title)
			_populate_quest_list()  # Refresh list


func _on_player_level_up(new_level):
	show_notification("LEVEL UP! You are now level %d" % new_level, Color.gold)


func _on_survival_stat_changed(stat_name, value):
	if stat_name == "critical":
		show_warning("WARNING: Low survival stats!")


func show_notification(text, color = Color.white):
	# Create floating notification
	var notification = Label.new()
	notification.text = text
	notification.add_color_override("font_color", color)
	notification.rect_position = Vector2(rect_size.x / 2, 100)
	add_child(notification)

	# Fade out and remove
	var tween = Tween.new()
	add_child(tween)
	tween.interpolate_property(notification, "modulate:a", 1.0, 0.0, 2.0, Tween.TRANS_LINEAR)
	tween.start()
	yield(tween, "tween_completed")
	notification.queue_free()
	tween.queue_free()


func show_warning(text):
	show_notification(text, Color.red)


func _input(event):
	# Hotkeys
	if event.is_action_pressed("ui_focus_next"):  # Tab key
		toggle_crafting_menu()
	elif event.is_action_pressed("ui_page_up"):  # Page Up
		toggle_quest_menu()

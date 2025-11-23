extends KinematicBody2D
class_name Character

const AI_TICK = 0.1
var ai_accum = 0

var id = -1
var player_id = -1
var char_name = "Name"
var template = 0

const MAX_HEALTH = 100.0
var health = MAX_HEALTH

# Survival mechanics (The Long Dark inspired)
const MAX_HUNGER = 100.0
const MAX_THIRST = 100.0
const MAX_TEMPERATURE = 100.0
const MAX_FATIGUE = 100.0
const MAX_STAMINA = 100.0

var hunger = MAX_HUNGER
var thirst = MAX_THIRST
var temperature = MAX_TEMPERATURE  # 0 = freezing, 100 = ideal
var fatigue = 0.0  # 0 = well rested, 100 = exhausted
var stamina = MAX_STAMINA

# Survival decay rates (per second)
const HUNGER_DECAY_RATE = 0.5
const THIRST_DECAY_RATE = 0.8
const FATIGUE_GAIN_RATE = 0.3
const STAMINA_REGEN_RATE = 5.0
const STAMINA_USE_RATE = 15.0

# Experience and leveling (AoE2 inspired)
var experience = 0
var level = 1
var skill_points = 0

# Resources (Raft + AoE2 inspired)
var wood = 0
var stone = 0
var metal = 0
var food_count = 0
var gold = 100

# Power-ups (Pac-Man inspired)
var speed_boost = 1.0
var damage_boost = 1.0
var invincible_time = 0.0
var power_up_duration = 0.0

# Score system (Pac-Man inspired)
var score = 0
var combo_multiplier = 1

signal hit(gun, from_direction, at_point)
signal survival_stat_changed(stat_name, value)
signal level_up(new_level)

var animation = null
var color = Color.black

enum State {
	IDLE = 0,
	MOVING = 1,
	DEAD = 2
}

var state = State.IDLE
onready var inventory = get_node("Inventory")

export(float) var walking_speed = 40.0
export(float) var running_speed = 80.0

var facing_direction: Vector2 = Vector2.DOWN
var motion_direction: Vector2 = Vector2.ZERO
var running = false

const HitFXScene = preload("res://scenes/effects/HitFX.tscn")


func set_motion(direction, _running=false):
	running = _running
	motion_direction = direction.normalized() if direction != Vector2.ZERO else Vector2.ZERO
	

func _init():
	id = get_instance_id()
	

func _ready():
	name = str(id)
	$UI/TopPanel.visible = false
	$CollisionShape.disabled = not Network.is_server
	$Icons/Speaking.visible = false
	color = Assets.get_random_color()
	$Icons/Speaking.modulate = color
	connect("hit", self, "_on_hit")
	

func tick(delta):
	ai_accum += delta
	while ai_accum > AI_TICK:
		$Sensors.tick()
		$AI.tick()
		$Controls.tick()
		_update_survival_stats(AI_TICK)
		_update_power_ups(AI_TICK)
		ai_accum -= AI_TICK


func _update_survival_stats(delta):
	if state == State.DEAD:
		return

	# Hunger decreases over time
	hunger = max(0, hunger - HUNGER_DECAY_RATE * delta)
	if hunger <= 0:
		health = max(0, health - 1.0 * delta)  # Starvation damage

	# Thirst decreases faster than hunger
	thirst = max(0, thirst - THIRST_DECAY_RATE * delta)
	if thirst <= 0:
		health = max(0, health - 2.0 * delta)  # Dehydration damage (faster than starvation)

	# Fatigue increases over time
	fatigue = min(MAX_FATIGUE, fatigue + FATIGUE_GAIN_RATE * delta)
	if fatigue >= MAX_FATIGUE:
		stamina = 0  # Can't run when exhausted

	# Stamina regeneration (slower when fatigued)
	if not running:
		var regen_mult = 1.0 - (fatigue / MAX_FATIGUE) * 0.5
		stamina = min(MAX_STAMINA, stamina + STAMINA_REGEN_RATE * delta * regen_mult)

	# Temperature effects (simplified - will be enhanced with weather system)
	if temperature < 20:
		health = max(0, health - 0.5 * delta)  # Freezing damage
		fatigue = min(MAX_FATIGUE, fatigue + 0.5 * delta)  # Cold makes you tired
	elif temperature > 80:
		thirst = max(0, thirst - 0.5 * delta)  # Heat makes you thirsty

	# Update health based on survival stats
	if hunger < 20 or thirst < 20:
		emit_signal("survival_stat_changed", "critical", true)

	# Sync health to clients
	if health != MAX_HEALTH:
		rpc("set_health", health)


func _update_power_ups(delta):
	# Update power-up timers (Pac-Man inspired)
	if power_up_duration > 0:
		power_up_duration -= delta
		if power_up_duration <= 0:
			# Reset power-ups
			speed_boost = 1.0
			damage_boost = 1.0

	if invincible_time > 0:
		invincible_time -= delta
		

func dump_info():
	# This method and the `setup_from_info()` counterpart
	# assures that the character node can be correctly recreated on a client by passing the `info` dict.
	var info = {
		id = id,
		player_id = player_id,
		char_name = char_name,
		template = template,
		position = position,
		color = color,
		inventory = $Inventory.dump_info(),
		# Survival stats
		hunger = hunger,
		thirst = thirst,
		temperature = temperature,
		fatigue = fatigue,
		stamina = stamina,
		# Progression
		experience = experience,
		level = level,
		skill_points = skill_points,
		# Resources
		wood = wood,
		stone = stone,
		metal = metal,
		food_count = food_count,
		gold = gold,
		# Score
		score = score,
		combo_multiplier = combo_multiplier
	}

	if $Inventory.current_item:
		info.current_item = str($Inventory.current_item.id)
	return info
	

func setup_from_info(info):
	if "id" in info:
		id = info.id
	name = str(id)
	player_id = info.player_id if "player_id" in info else -1
	char_name = info.char_name
	template = info.template
	position = info.position
	color = info.color

	# Restore survival stats
	if "hunger" in info: hunger = info.hunger
	if "thirst" in info: thirst = info.thirst
	if "temperature" in info: temperature = info.temperature
	if "fatigue" in info: fatigue = info.fatigue
	if "stamina" in info: stamina = info.stamina

	# Restore progression
	if "experience" in info: experience = info.experience
	if "level" in info: level = info.level
	if "skill_points" in info: skill_points = info.skill_points

	# Restore resources
	if "wood" in info: wood = info.wood
	if "stone" in info: stone = info.stone
	if "metal" in info: metal = info.metal
	if "food_count" in info: food_count = info.food_count
	if "gold" in info: gold = info.gold

	# Restore score
	if "score" in info: score = info.score
	if "combo_multiplier" in info: combo_multiplier = info.combo_multiplier

	$Icons/Name.text = char_name
	$Shape.frames = Assets.character_sprites[template]

	if "inventory" in info:
		$Inventory.setup_from_info(info.inventory)

	if "current_item" in info:
		print($Inventory.get_child(0).name)
		$Inventory.current_item = $Inventory.get_node(info.current_item)
	
	
func dump_state():
	# This method and the `update_state()` counterpart 
	# assures fact-paced unreliable update between server and client (usually for character movement)
	return {					
		state = state,		
		facing_direction = facing_direction,
		motion_direction = motion_direction,
		runing = running,
		position = self.position,		
	}


func update_state(_state):	
	state = _state.state	
	facing_direction = _state.facing_direction
	motion_direction = _state.motion_direction
	running = _state.runing
	position = _state.position
	

func setup_for_player():
	$UI/TopPanel.visible = true
	
	
func _physics_process(delta):
	if Network.is_server:
		match state:
			State.MOVING:
				# Apply speed boost from power-ups
				var base_speed = walking_speed if not running else running_speed
				var final_speed = base_speed * speed_boost

				# Consume stamina when running
				if running and stamina > 0:
					stamina = max(0, stamina - STAMINA_USE_RATE * delta)
				elif running and stamina <= 0:
					running = false  # Stop running when out of stamina

				move_and_slide(motion_direction * final_speed)
			State.IDLE:
				pass	

	
func _process(delta):	
	_update_animation()	
	
	
func _resolve_animation(direction: Vector2):	
	var animation = "down"	
	if abs(direction.x) > 0.0:
		animation = "right" if direction.x > 0.0 else "left"
	if abs(direction.y) > abs(direction.x):
		animation = "down" if direction.y > 0.0 else "up"

	return animation


func _update_animation():	
	match state:
		State.MOVING:
			animation = _resolve_animation(motion_direction)
			$Shape.speed_scale = 2.0 if running else 1.5
			$Shape.play("walk_" + animation)
		State.IDLE:			
			animation = _resolve_animation(facing_direction)
			$Shape.play("walk_" + animation)
			$Shape.stop()
		State.DEAD:
			if not $Shape/DeathTween.shown:
				_show_death_animation()
			$Shape.stop()
			

func _show_death_animation():
	say("GASP!")
	$Shape/DeathTween.animate()	
	$Shape.modulate = Color.lightgray
			
	
func _on_SpeakingTimer_timeout():
	$Icons/Speaking.visible = false


func _on_Picker_area_entered(area):
	$Icons/Hover.visible = true	


func _on_Picker_area_exited(area):
	$Icons/Hover.visible = false
			
			
func _on_hit(gun, from_direction, at_point):
	# Check invincibility (Pac-Man power-up)
	if invincible_time > 0:
		return  # No damage when invincible

	if state != State.DEAD:
		var actual_damage = gun.damage / damage_boost  # Damage reduction from power-ups
		health -= actual_damage
		rpc("set_health", health)

		if health <= 0:
			state = State.DEAD
			$CollisionShape.disabled = true
			$HitBox/Circle.disabled = true
			EventBus.emit_signal("character_died", id)
		else:
			$Sensors.events.append({
				name = "HIT"
			})

	rpc("show_hit", from_direction, at_point)


# Survival functions
func eat_food(amount = 30):
	hunger = min(MAX_HUNGER, hunger + amount)
	rpc("show_eat_effect")


func drink_water(amount = 40):
	thirst = min(MAX_THIRST, thirst + amount)
	rpc("show_drink_effect")


func rest(amount = 50):
	fatigue = max(0, fatigue - amount)
	stamina = MAX_STAMINA


func warm_up(amount = 20):
	temperature = min(MAX_TEMPERATURE, temperature + amount)


func cool_down(amount = 20):
	temperature = max(0, temperature - amount)


# Resource management functions
func add_resource(resource_type, amount):
	match resource_type:
		"wood":
			wood += amount
		"stone":
			stone += amount
		"metal":
			metal += amount
		"food":
			food_count += amount
		"gold":
			gold += amount
	rpc("update_resources", resource_type, amount)


func spend_resource(resource_type, amount):
	match resource_type:
		"wood":
			if wood >= amount:
				wood -= amount
				return true
		"stone":
			if stone >= amount:
				stone -= amount
				return true
		"metal":
			if metal >= amount:
				metal -= amount
				return true
		"food":
			if food_count >= amount:
				food_count -= amount
				return true
		"gold":
			if gold >= amount:
				gold -= amount
				return true
	return false


# Experience and leveling (AoE2 inspired)
func gain_experience(amount):
	experience += amount
	score += amount * combo_multiplier  # Also add to score
	var xp_needed = level * 100  # 100 XP per level
	if experience >= xp_needed:
		level_up()


func level_up():
	level += 1
	skill_points += 3
	# Heal on level up
	health = min(MAX_HEALTH, health + 50)
	rpc("set_health", health)
	emit_signal("level_up", level)
	rpc("show_level_up_effect")


# Power-ups (Pac-Man inspired)
func activate_speed_boost(multiplier = 2.0, duration = 10.0):
	speed_boost = multiplier
	power_up_duration = duration
	rpc("show_power_up_effect", "speed")


func activate_damage_boost(multiplier = 2.0, duration = 10.0):
	damage_boost = multiplier
	power_up_duration = duration
	rpc("show_power_up_effect", "damage")


func activate_invincibility(duration = 5.0):
	invincible_time = duration
	rpc("show_power_up_effect", "invincible")


func add_score(points):
	score += points * combo_multiplier
	rpc("update_score", score)


func increase_combo():
	combo_multiplier = min(10, combo_multiplier + 1)


func reset_combo():
	combo_multiplier = 1
	
	
# --- REMOTE FUNCTIONS ---


remotesync func say(text):
	$Icons/Speaking.text = text
	$Icons/Speaking.visible = true
	$Icons/Speaking/SpeakingTimer.wait_time = len(text.split(" ")) * 0.5
	$Icons/Speaking/SpeakingTimer.start()
	

remotesync func set_health(value):
	health = value
	$UI/TopPanel/VBox/HealthBar.rect_min_size.x = health
	
	
remotesync func show_hit(from_direction, at_point):
	var hit_fx = HitFXScene.instance()
	hit_fx.z_index = 100
	hit_fx.position = at_point
	if state != State.DEAD:
		hit_fx.start_color = Color.red if invincible_time <= 0 else Color.yellow
		if invincible_time <= 0:
			$Shape/KickbackTween.animate(from_direction)
	EventBus.emit_signal("fx_created", hit_fx)


remotesync func show_eat_effect():
	var heal_fx_scene = preload("res://scenes/effects/HealFX.tscn")
	var fx = heal_fx_scene.instance()
	fx.position = position
	fx.modulate = Color.green
	EventBus.emit_signal("fx_created", fx)
	say("*munch*")


remotesync func show_drink_effect():
	var heal_fx_scene = preload("res://scenes/effects/HealFX.tscn")
	var fx = heal_fx_scene.instance()
	fx.position = position
	fx.modulate = Color.cyan
	EventBus.emit_signal("fx_created", fx)
	say("*glug*")


remotesync func show_level_up_effect():
	var heal_fx_scene = preload("res://scenes/effects/HealFX.tscn")
	var fx = heal_fx_scene.instance()
	fx.position = position
	fx.modulate = Color.gold
	EventBus.emit_signal("fx_created", fx)
	say("LEVEL UP!")


remotesync func show_power_up_effect(type):
	match type:
		"speed":
			$Shape.modulate = Color.yellow
			say("SPEED BOOST!")
		"damage":
			$Shape.modulate = Color.red
			say("POWER!")
		"invincible":
			$Shape.modulate = Color.cyan
			say("INVINCIBLE!")


remotesync func update_resources(resource_type, amount):
	# Client-side visual feedback for resource collection
	say("+ %d %s" % [amount, resource_type])


remotesync func update_score(new_score):
	score = new_score


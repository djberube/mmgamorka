extends KinematicBody2D
class_name Animal

# Wildlife System (The Long Dark + Raft inspired)
# Animals can be peaceful, neutral, or aggressive

enum AnimalType {
	DEER,
	RABBIT,
	WOLF,
	BEAR,
	BOAR,
	FOX,
	BIRD,
	FISH
}

enum Behavior {
	PASSIVE,   # Runs away from players
	NEUTRAL,   # Ignores players unless attacked
	AGGRESSIVE # Attacks players on sight
}

export(AnimalType) var animal_type = AnimalType.DEER
export(Behavior) var behavior = Behavior.PASSIVE
export var move_speed = 30.0
export var health = 50.0
export var damage = 10.0
export var detection_range = 200.0
export var attack_range = 30.0

var max_health = 50.0
var velocity = Vector2.ZERO
var target: Character = null
var state = "idle"
var wander_timer = 0.0
var wander_direction = Vector2.ZERO

# Loot drops
var meat_drop_amount = 3
var hide_drop_amount = 2
var experience_reward = 25

signal animal_killed(animal_type, position)


func _ready():
	max_health = health
	_setup_animal_stats()
	wander_timer = rand_range(2.0, 5.0)


func _setup_animal_stats():
	match animal_type:
		AnimalType.DEER:
			behavior = Behavior.PASSIVE
			move_speed = 50.0
			health = 40.0
			meat_drop_amount = 5
			hide_drop_amount = 3
			experience_reward = 30

		AnimalType.RABBIT:
			behavior = Behavior.PASSIVE
			move_speed = 80.0
			health = 15.0
			meat_drop_amount = 1
			hide_drop_amount = 1
			experience_reward = 10

		AnimalType.WOLF:
			behavior = Behavior.AGGRESSIVE
			move_speed = 60.0
			health = 60.0
			damage = 20.0
			attack_range = 40.0
			meat_drop_amount = 3
			hide_drop_amount = 2
			experience_reward = 50

		AnimalType.BEAR:
			behavior = Behavior.NEUTRAL
			move_speed = 40.0
			health = 150.0
			damage = 40.0
			attack_range = 50.0
			detection_range = 150.0
			meat_drop_amount = 10
			hide_drop_amount = 5
			experience_reward = 100

		AnimalType.BOAR:
			behavior = Behavior.NEUTRAL
			move_speed = 45.0
			health = 70.0
			damage = 15.0
			meat_drop_amount = 4
			hide_drop_amount = 2
			experience_reward = 40

		AnimalType.FOX:
			behavior = Behavior.PASSIVE
			move_speed = 70.0
			health = 25.0
			meat_drop_amount = 2
			hide_drop_amount = 2
			experience_reward = 20

		AnimalType.FISH:
			behavior = Behavior.PASSIVE
			move_speed = 40.0
			health = 10.0
			meat_drop_amount = 1
			experience_reward = 5

	max_health = health


func _process(delta):
	if not Network.is_server:
		return

	_update_ai(delta)


func _physics_process(delta):
	if not Network.is_server:
		return

	if state != "dead":
		move_and_slide(velocity)


func _update_ai(delta):
	if state == "dead":
		return

	# Find nearby characters
	var nearest_character = _find_nearest_character()

	match behavior:
		Behavior.PASSIVE:
			_passive_behavior(nearest_character, delta)
		Behavior.NEUTRAL:
			_neutral_behavior(nearest_character, delta)
		Behavior.AGGRESSIVE:
			_aggressive_behavior(nearest_character, delta)


func _passive_behavior(nearest_character, delta):
	if nearest_character and position.distance_to(nearest_character.position) < detection_range:
		# Run away from player
		state = "fleeing"
		var flee_direction = (position - nearest_character.position).normalized()
		velocity = flee_direction * move_speed * 1.5
	else:
		# Wander
		_wander_behavior(delta)


func _neutral_behavior(nearest_character, delta):
	if target:
		# Attack the target (was provoked)
		_attack_behavior(target)
	else:
		# Wander peacefully
		_wander_behavior(delta)


func _aggressive_behavior(nearest_character, delta):
	if nearest_character and position.distance_to(nearest_character.position) < detection_range:
		# Chase and attack player
		target = nearest_character
		_attack_behavior(target)
	else:
		# Wander while looking for prey
		target = null
		_wander_behavior(delta)


func _wander_behavior(delta):
	state = "wandering"
	wander_timer -= delta

	if wander_timer <= 0:
		# Pick new direction
		wander_direction = Vector2(rand_range(-1, 1), rand_range(-1, 1)).normalized()
		wander_timer = rand_range(2.0, 5.0)

	velocity = wander_direction * move_speed * 0.5


func _attack_behavior(character: Character):
	if not character or character.state == Character.State.DEAD:
		target = null
		return

	var distance = position.distance_to(character.position)

	if distance > detection_range * 2:
		# Lost target
		target = null
		return

	if distance > attack_range:
		# Chase
		state = "chasing"
		var chase_direction = (character.position - position).normalized()
		velocity = chase_direction * move_speed
	else:
		# Attack
		state = "attacking"
		velocity = Vector2.ZERO
		_perform_attack(character)


func _perform_attack(character: Character):
	# Attack cooldown handled here (simplified)
	if OS.get_ticks_msec() % 1000 < 100:  # Attack once per second
		character.health -= damage
		character.rpc("set_health", character.health)
		rpc("show_attack_effect", character.position)


func take_damage(amount: float, from_character: Character = null):
	health -= amount

	if health <= 0:
		die(from_character)
	else:
		# Become aggressive if neutral
		if behavior == Behavior.NEUTRAL:
			target = from_character

		rpc("show_damage_effect")


func die(killed_by: Character = null):
	state = "dead"

	# Drop loot
	if killed_by:
		killed_by.add_resource("food", meat_drop_amount)
		killed_by.add_resource("hide", hide_drop_amount)
		killed_by.gain_experience(experience_reward)
		killed_by.add_score(experience_reward * 2)

	emit_signal("animal_killed", animal_type, position)
	rpc("show_death_effect")

	# Remove after a delay
	yield(get_tree().create_timer(5.0), "timeout")
	queue_free()


func _find_nearest_character():
	var characters = get_tree().get_nodes_in_group("characters")
	var nearest: Character = null
	var min_distance = INF

	for character in characters:
		if character.state != Character.State.DEAD:
			var distance = position.distance_to(character.position)
			if distance < min_distance:
				min_distance = distance
				nearest = character

	return nearest


# --- REMOTE FUNCTIONS ---

remotesync func show_damage_effect():
	# Visual feedback for taking damage
	if has_node("Sprite"):
		$Sprite.modulate = Color.red
		yield(get_tree().create_timer(0.1), "timeout")
		$Sprite.modulate = Color.white


remotesync func show_attack_effect(target_pos):
	# Visual feedback for attacking
	var hit_fx_scene = preload("res://scenes/effects/HitFX.tscn")
	var fx = hit_fx_scene.instance()
	fx.position = target_pos
	fx.start_color = Color.red
	EventBus.emit_signal("fx_created", fx)


remotesync func show_death_effect():
	state = "dead"
	if has_node("Sprite"):
		$Sprite.modulate = Color.darkgray
		$Sprite.modulate.a = 0.5
	if has_node("CollisionShape2D"):
		$CollisionShape2D.disabled = true

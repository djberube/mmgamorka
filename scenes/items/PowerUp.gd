extends Item

enum PowerUpType {
	SPEED_BOOST,
	DAMAGE_BOOST,
	INVINCIBILITY,
	HEALTH_PACK,
	MEGA_POINTS,
	COMBO_RESET,
	EXPERIENCE_BOOST
}

export(PowerUpType) var power_up_type = PowerUpType.SPEED_BOOST
export var duration = 10.0
export var value = 2.0
export var respawn_time = 30.0

var is_collected = false
var respawn_timer = 0.0


func _process(delta):
	if is_collected and Network.is_server:
		respawn_timer += delta
		if respawn_timer >= respawn_time:
			respawn_power_up()

	# Pac-Man style floating animation
	if not is_collected:
		position.y += sin(OS.get_ticks_msec() * 0.003) * 0.1


func use(by_character: Character):
	if is_collected:
		return false

	if not Network.is_server:
		return false

	is_collected = true
	respawn_timer = 0.0

	match power_up_type:
		PowerUpType.SPEED_BOOST:
			by_character.activate_speed_boost(value, duration)
			by_character.add_score(100)
		PowerUpType.DAMAGE_BOOST:
			by_character.activate_damage_boost(value, duration)
			by_character.add_score(150)
		PowerUpType.INVINCIBILITY:
			by_character.activate_invincibility(duration)
			by_character.add_score(200)
		PowerUpType.HEALTH_PACK:
			by_character.health = min(by_character.MAX_HEALTH, by_character.health + value)
			by_character.rpc("set_health", by_character.health)
			by_character.add_score(50)
		PowerUpType.MEGA_POINTS:
			by_character.add_score(int(value) * 100)
		PowerUpType.COMBO_RESET:
			by_character.reset_combo()
			by_character.add_score(25)
		PowerUpType.EXPERIENCE_BOOST:
			by_character.gain_experience(int(value) * 10)

	rpc("collect_effect", by_character.position)

	# Play collection sound
	EventBus.emit_signal("power_up_collected", power_up_type)

	return true


func respawn_power_up():
	is_collected = false
	respawn_timer = 0.0
	rpc("show_respawn")


# --- REMOTE FUNCTIONS ---

remotesync func collect_effect(collector_pos):
	is_collected = true
	$GroundIcon.visible = false
	$CollisionShape.disabled = true

	# Particle effect
	var heal_fx_scene = preload("res://scenes/effects/HealFX.tscn")
	var fx = heal_fx_scene.instance()
	fx.position = position
	fx.modulate = _get_power_up_color()
	EventBus.emit_signal("fx_created", fx)


remotesync func show_respawn():
	is_collected = false
	$GroundIcon.visible = true
	$CollisionShape.disabled = false

	# Respawn effect
	var heal_fx_scene = preload("res://scenes/effects/HealFX.tscn")
	var fx = heal_fx_scene.instance()
	fx.position = position
	fx.modulate = Color.white
	EventBus.emit_signal("fx_created", fx)


func _get_power_up_color():
	match power_up_type:
		PowerUpType.SPEED_BOOST:
			return Color.yellow
		PowerUpType.DAMAGE_BOOST:
			return Color.red
		PowerUpType.INVINCIBILITY:
			return Color.cyan
		PowerUpType.HEALTH_PACK:
			return Color.green
		PowerUpType.MEGA_POINTS:
			return Color.gold
		PowerUpType.COMBO_RESET:
			return Color.purple
		PowerUpType.EXPERIENCE_BOOST:
			return Color.orange
	return Color.white

extends StaticBody2D
class_name ResourceNode

enum ResourceType {
	TREE,
	ROCK,
	METAL_ORE,
	BERRY_BUSH,
	WATER_SOURCE,
	MUSHROOM,
	HERB
}

export(ResourceType) var resource_type = ResourceType.TREE
export var resource_amount = 100
export var harvest_amount = 10
export var respawn_time = 60.0  # seconds
export var requires_tool = true

var current_amount = 0
var is_depleted = false
var respawn_timer = 0.0

signal resource_depleted(node)
signal resource_harvested(node, amount, resource_name)


func _ready():
	current_amount = resource_amount
	_update_appearance()


func _process(delta):
	if is_depleted and Network.is_server:
		respawn_timer += delta
		if respawn_timer >= respawn_time:
			respawn_resource()


func harvest(character: Character, tool_equipped = false):
	if is_depleted:
		return false

	if requires_tool and not tool_equipped:
		character.say("Need a tool!")
		return false

	if not Network.is_server:
		return false

	var amount = min(harvest_amount, current_amount)
	current_amount -= amount

	# Give resources to character
	var resource_name = _get_resource_name()
	character.add_resource(resource_name, amount)

	# Give experience
	character.gain_experience(amount)

	# Visual and audio feedback
	rpc("show_harvest_effect", character.position)
	emit_signal("resource_harvested", self, amount, resource_name)

	if current_amount <= 0:
		deplete()
	else:
		rpc("update_appearance", current_amount)

	return true


func deplete():
	is_depleted = true
	respawn_timer = 0.0
	rpc("show_depleted")
	emit_signal("resource_depleted", self)


func respawn_resource():
	current_amount = resource_amount
	is_depleted = false
	respawn_timer = 0.0
	rpc("show_respawn")


func _get_resource_name():
	match resource_type:
		ResourceType.TREE:
			return "wood"
		ResourceType.ROCK:
			return "stone"
		ResourceType.METAL_ORE:
			return "metal"
		ResourceType.BERRY_BUSH:
			return "food"
		ResourceType.WATER_SOURCE:
			return "water"
		ResourceType.MUSHROOM:
			return "food"
		ResourceType.HERB:
			return "food"
	return "unknown"


func _update_appearance():
	# Update visual representation based on resource amount
	var health_percent = float(current_amount) / float(resource_amount)
	if has_node("Sprite"):
		$Sprite.modulate = Color(1, health_percent, health_percent)


# --- REMOTE FUNCTIONS ---

remotesync func show_harvest_effect(harvester_pos):
	if has_node("Particles"):
		$Particles.emitting = true

	# Create visual effect
	var hit_fx_scene = preload("res://scenes/effects/HitFX.tscn")
	var fx = hit_fx_scene.instance()
	fx.position = position
	fx.start_color = _get_resource_color()
	EventBus.emit_signal("fx_created", fx)


remotesync func show_depleted():
	is_depleted = true
	if has_node("Sprite"):
		$Sprite.modulate = Color(0.5, 0.5, 0.5)
		$Sprite.modulate.a = 0.3
	if has_node("CollisionShape2D"):
		$CollisionShape2D.disabled = true


remotesync func show_respawn():
	is_depleted = false
	_update_appearance()
	if has_node("CollisionShape2D"):
		$CollisionShape2D.disabled = false

	# Spawn effect
	var heal_fx_scene = preload("res://scenes/effects/HealFX.tscn")
	var fx = heal_fx_scene.instance()
	fx.position = position
	fx.modulate = Color.green
	EventBus.emit_signal("fx_created", fx)


remotesync func update_appearance(new_amount):
	current_amount = new_amount
	_update_appearance()


func _get_resource_color():
	match resource_type:
		ResourceType.TREE:
			return Color.saddlebrown
		ResourceType.ROCK:
			return Color.gray
		ResourceType.METAL_ORE:
			return Color.silver
		ResourceType.BERRY_BUSH:
			return Color.red
		ResourceType.WATER_SOURCE:
			return Color.cyan
		ResourceType.MUSHROOM:
			return Color.purple
		ResourceType.HERB:
			return Color.green
	return Color.white

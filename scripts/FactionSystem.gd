extends Node

# Advanced Faction System
# Manages relationships between different groups/factions

enum Faction {
	PLAYER,
	FRIENDLY_NPC,
	NEUTRAL_NPC,
	HOSTILE_NPC,
	BANDITS,
	WILDLIFE,
	MONSTERS,
	TRADERS,
	GUARDS
}

enum Relationship {
	ALLIED,     # +100 to +75
	FRIENDLY,   # +74 to +25
	NEUTRAL,    # +24 to -24
	UNFRIENDLY, # -25 to -74
	HOSTILE     # -75 to -100
}

# Faction standings (faction_a -> faction_b -> reputation value)
var faction_standings = {}

# Character faction assignments
var character_factions = {}

signal faction_standing_changed(faction_a, faction_b, new_standing)
signal character_faction_changed(character_id, new_faction)


func _ready():
	_initialize_default_standings()


func _initialize_default_standings():
	# Initialize default faction relationships

	# PLAYER faction relationships
	set_standing(Faction.PLAYER, Faction.FRIENDLY_NPC, 50)
	set_standing(Faction.PLAYER, Faction.NEUTRAL_NPC, 0)
	set_standing(Faction.PLAYER, Faction.HOSTILE_NPC, -50)
	set_standing(Faction.PLAYER, Faction.BANDITS, -100)
	set_standing(Faction.PLAYER, Faction.WILDLIFE, 0)
	set_standing(Faction.PLAYER, Faction.MONSTERS, -75)
	set_standing(Faction.PLAYER, Faction.TRADERS, 75)
	set_standing(Faction.PLAYER, Faction.GUARDS, 50)

	# FRIENDLY_NPC relationships
	set_standing(Faction.FRIENDLY_NPC, Faction.NEUTRAL_NPC, 25)
	set_standing(Faction.FRIENDLY_NPC, Faction.HOSTILE_NPC, -25)
	set_standing(Faction.FRIENDLY_NPC, Faction.BANDITS, -75)
	set_standing(Faction.FRIENDLY_NPC, Faction.WILDLIFE, 0)
	set_standing(Faction.FRIENDLY_NPC, Faction.MONSTERS, -50)
	set_standing(Faction.FRIENDLY_NPC, Faction.TRADERS, 50)
	set_standing(Faction.FRIENDLY_NPC, Faction.GUARDS, 75)

	# BANDITS relationships
	set_standing(Faction.BANDITS, Faction.NEUTRAL_NPC, -50)
	set_standing(Faction.BANDITS, Faction.HOSTILE_NPC, 25)
	set_standing(Faction.BANDITS, Faction.WILDLIFE, 0)
	set_standing(Faction.BANDITS, Faction.MONSTERS, -25)
	set_standing(Faction.BANDITS, Faction.TRADERS, -100)
	set_standing(Faction.BANDITS, Faction.GUARDS, -100)

	# GUARDS relationships
	set_standing(Faction.GUARDS, Faction.NEUTRAL_NPC, 25)
	set_standing(Faction.GUARDS, Faction.HOSTILE_NPC, -75)
	set_standing(Faction.GUARDS, Faction.WILDLIFE, 0)
	set_standing(Faction.GUARDS, Faction.MONSTERS, -75)
	set_standing(Faction.GUARDS, Faction.TRADERS, 75)

	# WILDLIFE relationships (mostly neutral to everyone)
	set_standing(Faction.WILDLIFE, Faction.NEUTRAL_NPC, 0)
	set_standing(Faction.WILDLIFE, Faction.HOSTILE_NPC, 0)
	set_standing(Faction.WILDLIFE, Faction.MONSTERS, -50)
	set_standing(Faction.WILDLIFE, Faction.TRADERS, 0)

	# MONSTERS relationships (hostile to most)
	set_standing(Faction.MONSTERS, Faction.NEUTRAL_NPC, -75)
	set_standing(Faction.MONSTERS, Faction.HOSTILE_NPC, -25)
	set_standing(Faction.MONSTERS, Faction.TRADERS, -75)


func set_standing(faction_a: int, faction_b: int, value: int):
	value = clamp(value, -100, 100)

	if not faction_a in faction_standings:
		faction_standings[faction_a] = {}

	faction_standings[faction_a][faction_b] = value

	# Mirror the relationship (bidirectional)
	if not faction_b in faction_standings:
		faction_standings[faction_b] = {}
	faction_standings[faction_b][faction_a] = value

	emit_signal("faction_standing_changed", faction_a, faction_b, value)


func get_standing(faction_a: int, faction_b: int) -> int:
	# Same faction = max reputation
	if faction_a == faction_b:
		return 100

	if faction_a in faction_standings:
		if faction_b in faction_standings[faction_a]:
			return faction_standings[faction_a][faction_b]

	# Default to neutral if no standing is set
	return 0


func modify_standing(faction_a: int, faction_b: int, change: int):
	var current = get_standing(faction_a, faction_b)
	set_standing(faction_a, faction_b, current + change)


func get_relationship(faction_a: int, faction_b: int) -> int:
	var standing = get_standing(faction_a, faction_b)

	if standing >= 75:
		return Relationship.ALLIED
	elif standing >= 25:
		return Relationship.FRIENDLY
	elif standing >= -24:
		return Relationship.NEUTRAL
	elif standing >= -74:
		return Relationship.UNFRIENDLY
	else:
		return Relationship.HOSTILE


func is_hostile(faction_a: int, faction_b: int) -> bool:
	return get_relationship(faction_a, faction_b) == Relationship.HOSTILE


func is_friendly(faction_a: int, faction_b: int) -> bool:
	var rel = get_relationship(faction_a, faction_b)
	return rel == Relationship.FRIENDLY or rel == Relationship.ALLIED


func is_allied(faction_a: int, faction_b: int) -> bool:
	return get_relationship(faction_a, faction_b) == Relationship.ALLIED


func assign_character_to_faction(character_id, faction: int):
	character_factions[character_id] = faction
	emit_signal("character_faction_changed", character_id, faction)


func get_character_faction(character_id) -> int:
	if character_id in character_factions:
		return character_factions[character_id]
	return Faction.NEUTRAL_NPC  # Default


func get_standing_between_characters(char_a_id, char_b_id) -> int:
	var faction_a = get_character_faction(char_a_id)
	var faction_b = get_character_faction(char_b_id)
	return get_standing(faction_a, faction_b)


func are_characters_hostile(char_a_id, char_b_id) -> bool:
	return is_hostile(get_character_faction(char_a_id), get_character_faction(char_b_id))


func are_characters_friendly(char_a_id, char_b_id) -> bool:
	return is_friendly(get_character_faction(char_a_id), get_character_faction(char_b_id))


func get_faction_name(faction: int) -> String:
	match faction:
		Faction.PLAYER:
			return "Players"
		Faction.FRIENDLY_NPC:
			return "Friendly NPCs"
		Faction.NEUTRAL_NPC:
			return "Neutral NPCs"
		Faction.HOSTILE_NPC:
			return "Hostile NPCs"
		Faction.BANDITS:
			return "Bandits"
		Faction.WILDLIFE:
			return "Wildlife"
		Faction.MONSTERS:
			return "Monsters"
		Faction.TRADERS:
			return "Traders"
		Faction.GUARDS:
			return "Guards"
	return "Unknown"


func get_relationship_name(relationship: int) -> String:
	match relationship:
		Relationship.ALLIED:
			return "Allied"
		Relationship.FRIENDLY:
			return "Friendly"
		Relationship.NEUTRAL:
			return "Neutral"
		Relationship.UNFRIENDLY:
			return "Unfriendly"
		Relationship.HOSTILE:
			return "Hostile"
	return "Unknown"


# Reputation gains/losses from actions
func on_character_killed(killer_id, victim_id):
	var killer_faction = get_character_faction(killer_id)
	var victim_faction = get_character_faction(victim_id)

	# Killing friendlies hurts reputation
	if is_friendly(killer_faction, victim_faction):
		modify_standing(killer_faction, victim_faction, -20)

		# Also hurt reputation with allied factions
		for faction in faction_standings:
			if is_allied(faction, victim_faction):
				modify_standing(killer_faction, faction, -10)

	# Killing hostiles improves reputation with their enemies
	elif is_hostile(killer_faction, victim_faction):
		for faction in faction_standings:
			if is_hostile(faction, victim_faction):
				modify_standing(killer_faction, faction, 5)


func on_trade_completed(trader_id, customer_id, value: int):
	var trader_faction = get_character_faction(trader_id)
	var customer_faction = get_character_faction(customer_id)

	# Trading improves reputation slightly
	var rep_gain = min(10, int(value / 100))
	modify_standing(trader_faction, customer_faction, rep_gain)


func on_quest_completed(character_id, quest_giver_faction: int):
	var character_faction = get_character_faction(character_id)

	# Completing quests improves reputation
	modify_standing(character_faction, quest_giver_faction, 15)


func on_help_given(helper_id, helped_id):
	var helper_faction = get_character_faction(helper_id)
	var helped_faction = get_character_faction(helped_id)

	# Helping others improves reputation
	modify_standing(helper_faction, helped_faction, 5)

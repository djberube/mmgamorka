extends Node

# Weather and Time System (The Long Dark inspired)
# Handles day/night cycle, weather conditions, and environmental effects

enum WeatherType {
	CLEAR,
	CLOUDY,
	RAIN,
	SNOW,
	STORM,
	BLIZZARD,
	FOG
}

# Time system (24-hour cycle)
var time_of_day = 6.0  # Hours (0-24), starts at 6 AM
var day_length = 600.0  # Real seconds for a full day (10 minutes)
var current_day = 1

# Weather
var current_weather = WeatherType.CLEAR
var weather_duration = 0.0
var weather_change_interval = 120.0  # Change weather every 2 minutes
var weather_intensity = 0.0  # 0.0 to 1.0

# Environmental effects
var ambient_temperature = 70.0  # Base temperature in Fahrenheit
var wind_speed = 0.0

# Season system
enum Season {
	SPRING,
	SUMMER,
	AUTUMN,
	WINTER
}
var current_season = Season.SPRING

signal time_changed(hour, is_day)
signal weather_changed(weather_type, intensity)
signal day_changed(day_number)
signal season_changed(season)


func _ready():
	randomize()


func _process(delta):
	if not Network.is_server:
		return

	# Update time
	_update_time(delta)

	# Update weather
	_update_weather(delta)


func _update_time(delta):
	var old_hour = int(time_of_day)

	# Advance time
	time_of_day += (delta / day_length) * 24.0

	# Handle day rollover
	if time_of_day >= 24.0:
		time_of_day -= 24.0
		current_day += 1
		_check_season_change()
		emit_signal("day_changed", current_day)
		rpc("sync_day", current_day)

	# Emit hourly updates
	var new_hour = int(time_of_day)
	if new_hour != old_hour:
		var is_day = is_daytime()
		emit_signal("time_changed", new_hour, is_day)
		rpc("sync_time", time_of_day)


func _update_weather(delta):
	weather_duration += delta

	# Change weather periodically
	if weather_duration >= weather_change_interval:
		change_weather()
		weather_duration = 0.0


func change_weather():
	var old_weather = current_weather

	# Weather probabilities based on season
	var weather_weights = _get_season_weather_weights()

	# Random weather selection with weights
	var total_weight = 0
	for weight in weather_weights.values():
		total_weight += weight

	var rand = randf() * total_weight
	var accumulated = 0.0

	for weather_type in weather_weights:
		accumulated += weather_weights[weather_type]
		if rand <= accumulated:
			current_weather = weather_type
			break

	# Set intensity
	weather_intensity = rand_range(0.3, 1.0)

	# Update temperature based on weather
	_update_temperature()

	if current_weather != old_weather:
		emit_signal("weather_changed", current_weather, weather_intensity)
		rpc("sync_weather", current_weather, weather_intensity)


func _get_season_weather_weights():
	match current_season:
		Season.SPRING:
			return {
				WeatherType.CLEAR: 40,
				WeatherType.CLOUDY: 30,
				WeatherType.RAIN: 20,
				WeatherType.FOG: 10
			}
		Season.SUMMER:
			return {
				WeatherType.CLEAR: 60,
				WeatherType.CLOUDY: 20,
				WeatherType.RAIN: 10,
				WeatherType.STORM: 10
			}
		Season.AUTUMN:
			return {
				WeatherType.CLEAR: 30,
				WeatherType.CLOUDY: 40,
				WeatherType.RAIN: 20,
				WeatherType.FOG: 10
			}
		Season.WINTER:
			return {
				WeatherType.CLOUDY: 30,
				WeatherType.SNOW: 40,
				WeatherType.BLIZZARD: 20,
				WeatherType.FOG: 10
			}
	return {}


func _update_temperature():
	# Base temperature by season
	var season_base_temp = {
		Season.SPRING: 60,
		Season.SUMMER: 80,
		Season.AUTUMN: 55,
		Season.WINTER: 30
	}
	var base = season_base_temp[current_season]

	# Time of day variation
	var time_modifier = 0
	if is_daytime():
		time_modifier = 10  # Warmer during day
	else:
		time_modifier = -15  # Colder at night

	# Weather effects
	var weather_modifier = 0
	match current_weather:
		WeatherType.CLEAR:
			weather_modifier = 5
		WeatherType.RAIN:
			weather_modifier = -10
		WeatherType.SNOW:
			weather_modifier = -20
		WeatherType.STORM:
			weather_modifier = -15
		WeatherType.BLIZZARD:
			weather_modifier = -30
		WeatherType.FOG:
			weather_modifier = -5

	ambient_temperature = base + time_modifier + (weather_modifier * weather_intensity)

	# Wind speed
	match current_weather:
		WeatherType.STORM:
			wind_speed = 20 + (weather_intensity * 30)
		WeatherType.BLIZZARD:
			wind_speed = 30 + (weather_intensity * 40)
		WeatherType.CLEAR:
			wind_speed = 5
		_:
			wind_speed = 10 + (weather_intensity * 10)


func _check_season_change():
	# Change season every 7 days
	var season_day = (current_day - 1) % 28
	var new_season = int(season_day / 7)

	if new_season != current_season:
		current_season = new_season
		emit_signal("season_changed", current_season)
		rpc("sync_season", current_season)


func is_daytime():
	return time_of_day >= 6.0 and time_of_day < 20.0  # 6 AM to 8 PM


func get_darkness_level():
	# Returns 0.0 (bright) to 1.0 (dark)
	if time_of_day >= 6.0 and time_of_day < 8.0:
		# Dawn
		return 1.0 - ((time_of_day - 6.0) / 2.0)
	elif time_of_day >= 8.0 and time_of_day < 18.0:
		# Day
		return 0.0
	elif time_of_day >= 18.0 and time_of_day < 20.0:
		# Dusk
		return (time_of_day - 18.0) / 2.0
	else:
		# Night
		return 1.0


func get_visibility_range():
	# Affected by time of day and weather
	var base_range = 1000.0
	var darkness_penalty = get_darkness_level() * 0.7
	var weather_penalty = 0.0

	match current_weather:
		WeatherType.FOG:
			weather_penalty = 0.6 * weather_intensity
		WeatherType.RAIN:
			weather_penalty = 0.3 * weather_intensity
		WeatherType.SNOW:
			weather_penalty = 0.4 * weather_intensity
		WeatherType.BLIZZARD:
			weather_penalty = 0.7 * weather_intensity

	return base_range * (1.0 - darkness_penalty - weather_penalty)


func apply_environmental_effects_to_character(character: Character):
	# Called from character's tick function

	# Temperature effects
	var temp_diff = ambient_temperature - 70  # Comfortable temperature
	if temp_diff < -20:
		character.cool_down(abs(temp_diff) * 0.1)
	elif temp_diff > 20:
		character.warm_up(temp_diff * 0.05)

	# Weather effects
	match current_weather:
		WeatherType.RAIN:
			character.cool_down(5 * weather_intensity)
		WeatherType.SNOW:
			character.cool_down(10 * weather_intensity)
		WeatherType.BLIZZARD:
			character.cool_down(20 * weather_intensity)
			# Extra fatigue in blizzard
			character.fatigue += 0.5 * weather_intensity
		WeatherType.STORM:
			# Chance of lightning damage
			if randf() < 0.001 * weather_intensity:
				character.health -= 30
				character.rpc("set_health", character.health)


func get_weather_name():
	match current_weather:
		WeatherType.CLEAR:
			return "Clear"
		WeatherType.CLOUDY:
			return "Cloudy"
		WeatherType.RAIN:
			return "Rain"
		WeatherType.SNOW:
			return "Snow"
		WeatherType.STORM:
			return "Storm"
		WeatherType.BLIZZARD:
			return "Blizzard"
		WeatherType.FOG:
			return "Fog"
	return "Unknown"


func get_season_name():
	match current_season:
		Season.SPRING:
			return "Spring"
		Season.SUMMER:
			return "Summer"
		Season.AUTUMN:
			return "Autumn"
		Season.WINTER:
			return "Winter"
	return "Unknown"


# --- REMOTE FUNCTIONS ---

remotesync func sync_time(new_time):
	time_of_day = new_time


remotesync func sync_weather(weather_type, intensity):
	current_weather = weather_type
	weather_intensity = intensity
	_update_temperature()


remotesync func sync_day(day):
	current_day = day


remotesync func sync_season(season):
	current_season = season

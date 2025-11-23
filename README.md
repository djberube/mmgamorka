# AGENTS 0.1 - AAA EPIC EDITION

**The Ultimate Survival-Crafting-RTS-Action Multiplayer Game!**

An incredibly ambitious top-down multiplayer game combining the best features from **Raft**, **The Long Dark**, **Age of Empires 2**, and **Pac-Man**! What started as a simple multiplayer demo has evolved into a feature-packed AAA gaming experience with survival mechanics, base building, crafting, wildlife, weather systems, and much more!

![screenshot](assets/screenshot.png)

## NOW WITH EPIC AAA FEATURES!

## Features

### CORE GAMEPLAY
- **Advanced Character Control** - Command-based movement system perfect for tactical gameplay
- **Multiplayer Support** - Full server authority with lobby, chat, and seamless networking
- **5-Slot Inventory System** - Equippable weapons, tools, and consumables

### SURVIVAL MECHANICS (The Long Dark Inspired) 🥶
- **Hunger & Thirst System** - Manage food and water to stay alive
- **Temperature System** - Stay warm or freeze to death in harsh conditions
- **Fatigue & Stamina** - Rest and manage energy for running and activities
- **Environmental Hazards** - Survive blizzards, storms, and extreme weather
- **Health Management** - Heal wounds, cure ailments, and avoid starvation/dehydration

### RESOURCE GATHERING & CRAFTING (Raft Inspired) 🪓
- **Resource Nodes** - Chop trees, mine rocks, gather metal ore, pick berries
- **Comprehensive Crafting System** - 40+ recipes across 3 tech tiers
- **Tech Tree Progression** - Unlock advanced recipes as you level up
- **Tool Crafting** - Stone/Iron axes, pickaxes, fishing rods, and more
- **Weapon Crafting** - Spears, bows, swords, and advanced weapons
- **Resource Management** - Wood, stone, metal, food, and gold economy

### BASE BUILDING & CONSTRUCTION (Raft + AoE2 Inspired) 🏗️
- **19 Building Types** - From simple campfires to advanced forges
- **Construction System** - Buildings take time to build with blueprint mode
- **Defensive Structures** - Wooden walls, stone walls, and watchtowers
- **Resource Production** - Farm plots, mills, and resource camps
- **Raft Building** - Construct water vehicles for ocean exploration
- **Building Benefits** - Campfires provide warmth, storage chests expand inventory

### FARMING & FOOD PRODUCTION 🌾
- **7 Crop Types** - Wheat, potato, carrot, tomato, corn, berries, and more
- **Growth Stages** - Watch crops grow from seedlings to harvest
- **Irrigation System** - Water crops and use fertilizer for faster growth
- **Weather Effects** - Rain waters crops, cold slows growth
- **Food Preservation** - Cook meat, bake bread, and prepare meals

### WEATHER & DAY/NIGHT CYCLE ⛈️
- **Dynamic Time System** - 24-hour day/night cycle (10 minutes real-time)
- **7 Weather Types** - Clear, cloudy, rain, snow, storm, blizzard, fog
- **Seasonal System** - Spring, summer, autumn, winter with unique effects
- **Environmental Effects** - Temperature changes, visibility reduction, crop growth modifiers
- **Survival Challenges** - Freezing nights, deadly blizzards, scorching heat

### WILDLIFE & HUNTING 🦌
- **8 Animal Types** - Deer, rabbits, wolves, bears, boars, foxes, birds, fish
- **Animal AI Behaviors** - Passive (flee), neutral (ignore unless provoked), aggressive (attack on sight)
- **Hunting System** - Track and hunt animals for meat and resources
- **Dangerous Predators** - Wolves and bears that will attack players
- **Resource Drops** - Meat, hide, and experience from hunted animals

### RTS-STYLE UNIT PRODUCTION (AoE2 Inspired) ⚔️
- **20+ Unit Types** - Villagers, militia, archers, knights, siege weapons
- **Training Queues** - Queue multiple units at production buildings
- **Population System** - Manage population limits with houses
- **Unit Upgrades** - Progress through Dark Age → Feudal → Castle → Imperial
- **Military Buildings** - Barracks, archery range, stable, siege workshop
- **Economic Buildings** - Houses, markets, lumber camps, mining camps

### POWER-UPS & COLLECTIBLES (Pac-Man Inspired) ⭐
- **7 Power-Up Types** - Speed boost, damage boost, invincibility, health packs, mega points
- **Respawning System** - Power-ups respawn after collection
- **Score System** - Earn points with combo multipliers (up to 10x!)
- **Temporary Buffs** - Become invincible, run faster, deal more damage
- **Visual Effects** - Glowing power-ups with floating animations

### QUEST & MISSION SYSTEM 📜
- **16+ Quests** - Tutorial quests, survival challenges, building objectives
- **Quest Categories** - Gathering, hunting, crafting, building, exploration, progression
- **Repeatable Quests** - Daily quests for consistent rewards
- **Quest Rewards** - Experience, gold, resources, and unlocks
- **Objective Tracking** - Track progress on multiple active quests

### PROGRESSION & LEVELING 📈
- **Experience System** - Gain XP from crafting, gathering, hunting, quests
- **Level-Up System** - Level up for stat boosts and skill points
- **Skill Points** - Spend on upgrades and abilities
- **Tech Tiers** - Unlock advanced recipes and buildings as you progress
- **Score Tracking** - High scores with combo multipliers

### FACTION & REPUTATION SYSTEM 🤝
- **9 Factions** - Players, NPCs, bandits, wildlife, monsters, traders, guards
- **Dynamic Relationships** - Allied, friendly, neutral, unfriendly, hostile
- **Reputation System** - Actions affect faction standings
- **Faction Conflicts** - Factions fight based on relationships
- **Reputation Consequences** - Killing friendlies hurts reputation, helping improves it

### ENHANCED UI/UX 🎨
- **Comprehensive HUD** - Health, hunger, thirst, stamina, temperature bars
- **Resource Display** - Real-time tracking of wood, stone, metal, food, gold
- **Environment Info** - Time of day, weather, temperature display
- **Crafting Menu** - Browse recipes by category with requirements
- **Quest Panel** - View available and active quests
- **Level & XP Display** - Track progression and skill points
- **Notifications** - Level-up alerts, critical warnings, achievements

### MULTIPLAYER & NETWORKING 🌐
- **Server-Client Architecture** - Full server authority for fair gameplay
- **Lobby System** - Player list, chat, and game setup
- **Fast State Updates** - Unreliable RPC for smooth movement
- **Reliable Events** - Item pickups, damage, effects synced perfectly
- **Network Optimization** - Efficient state synchronization

### ORIGINAL FEATURES
- **A* Pathfinding** - Smart navigation with road preferences
- **Collision-Based Sensors** - AI sight and hearing detection
- **YSort Rendering** - Proper depth sorting for 2D sprites
- **Scanline Weapons** - Raycasting-based shooting mechanics
- **Visual Effects** - Hit effects, healing, death animations, level-up fx
  
## Technical Architecture

### NEW SYSTEMS ADDED
- **CraftingSystem** (Autoload) - Manages 40+ recipes with tech tree progression
- **WeatherSystem** (Autoload) - Dynamic weather, seasons, and day/night cycle
- **QuestSystem** (Autoload) - Quest tracking, objectives, and rewards
- **UnitProductionSystem** (Autoload) - RTS-style unit training and management
- **FactionSystem** (Autoload) - Reputation and faction relationships

### NEW CLASSES
- **Character** (Enhanced) - Now with survival stats, resources, leveling, power-ups
- **Animal** - Wildlife AI with passive/neutral/aggressive behaviors
- **Building** - Constructible structures with production and benefits
- **ResourceNode** - Harvestable trees, rocks, ore veins, berry bushes
- **PowerUp** - Collectible Pac-Man style power-ups
- **FarmPlot** - Advanced farming with crop growth stages

### Code Structure
- **Server Authority** - All game logic runs on server for cheat prevention
- **Component-Based** - Characters use modular components (AI, Sensors, Controls, Inventory)
- **Network Optimized** - Fast unreliable updates for movement, reliable for events
- **Autoload Managers** - Global systems accessible throughout the game
- **Signal-Based** - Event-driven architecture for decoupled systems

## New Files Added

### Scripts
- `/scripts/CraftingSystem.gd` - Recipe management and tech tree
- `/scripts/WeatherSystem.gd` - Environmental simulation
- `/scripts/QuestSystem.gd` - Quest and mission handling
- `/scripts/UnitProductionSystem.gd` - RTS unit training
- `/scripts/FactionSystem.gd` - Faction relationships

### Scenes
- `/scenes/characters/Animal.gd` - Wildlife behavior
- `/scenes/items/Building.gd` - Base construction
- `/scenes/items/ResourceNode.gd` - Resource gathering
- `/scenes/items/PowerUp.gd` - Collectible power-ups
- `/scenes/items/FarmPlot.gd` - Farming system
- `/scenes/ui/EnhancedHUD.gd` - Comprehensive HUD

## How to Play

### Controls
- **Left Click** - Move character
- **Right Click** - Turn and use equipped item
- **Q** - Pick up item
- **W** - Drop current item
- **1-5** - Equip inventory slots
- **Space** - Unequip item
- **Tab** - Open crafting menu
- **Page Up** - Open quest menu
- **Shift** - Run (consumes stamina)

### Survival Tips
1. **Manage Your Needs** - Keep hunger and thirst above 20% to avoid damage
2. **Stay Warm** - Build campfires in cold weather to maintain temperature
3. **Gather Resources** - Chop trees and mine rocks to unlock crafting
4. **Build a Base** - Construct workbenches to unlock advanced recipes
5. **Hunt Carefully** - Passive animals flee, but wolves and bears attack!
6. **Complete Quests** - Gain experience and rewards for progression
7. **Farm Food** - Plant crops for sustainable food sources
8. **Watch the Weather** - Seek shelter during blizzards and storms
9. **Collect Power-Ups** - Grab glowing items for temporary advantages
10. **Level Up** - Gain skill points to unlock abilities and upgrades

## Design Philosophy

This project combines survival, crafting, RTS, and arcade mechanics into a unique multiplayer experience. The architecture follows Godot best practices with component-based design, server authority, and efficient networking.

The expanded feature set demonstrates how to integrate multiple game systems:
- Resource economy and crafting chains
- Environmental simulation affecting gameplay
- Dynamic AI behaviors and faction relationships
- Progression systems with quests and leveling
- Building and farming for long-term strategy

All systems are designed to work together: weather affects crops, temperature impacts survival, resources enable crafting, buildings provide benefits, and factions create dynamic relationships.

## Future Enhancements

Potential additions:
- **Ocean/Water System** - Swimming, fishing, boat navigation
- **Advanced Particle Effects** - Weather particles, magic effects
- **Audio System** - Music, ambient sounds, SFX
- **Skill Trees** - Character specializations and abilities
- **Trading System** - Economy and merchant NPCs
- **Dungeons** - Procedurally generated challenges
- **Boss Fights** - Epic encounters with rewards
- **Team Mechanics** - Guilds, alliances, PvP

## License

Published under MIT license but there are some files (tilesets) that are for non-commercial uses only!

## Credits
Many, many thanks to:
- [Magiscarf](https://www.deviantart.com/magiscarf) for amazingly detailed tilesets 
- [DoubleLeggy](https://www.deviantart.com/doubleleggy) for a beautiful set of character animations

// Space Cats: Mining for Josh - The Ultimate Edition
// A comprehensive game combining MOO2, Monopoly, Raft, The Long Dark, AOE2, and Pac-Man mechanics

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Game State
        this.paused = false;
        this.gameTime = 0;
        this.difficulty = 1;

        // Resources
        this.resources = {
            rocks: 0,
            credits: 100,
            food: 100,
            oxygen: 100,
            fuel: 100,
            iron: 0,
            titanium: 0,
            platinum: 0,
            crystals: 0,
            antimatter: 0
        };

        // Player Stats (Survival - The Long Dark inspired)
        this.player = {
            health: 100,
            hunger: 100,
            temperature: 100,
            oxygen: 100,
            maxHealth: 100,
            position: { x: 300, y: 300 },
            velocity: { x: 0, y: 0 },
            speed: 3,
            direction: 0
        };

        // Josh Units (AOE2 inspired)
        this.joshes = [
            { id: 1, name: 'Josh Alpha', role: 'mining', level: 1, experience: 0, health: 100, position: { x: 250, y: 250 } }
        ];
        this.selectedJosh = null;

        // Territory (Monopoly inspired)
        this.territories = [
            { id: 1, name: 'Home Base', level: 1, income: 10, owned: true, position: { x: 300, y: 300 } }
        ];

        // Space Rocks (Mining mechanic)
        this.spaceRocks = [];
        this.asteroids = [];
        this.generateSpaceRocks(50);

        // Fleet & Combat (MOO2 & AOE2 inspired)
        this.ships = [];
        this.enemies = [];
        this.projectiles = [];

        // Tech Tree (MOO2 inspired)
        this.technologies = {
            mining1: { name: 'Advanced Mining', cost: 100, researched: false, unlocks: ['mining2'], bonus: 'mining_speed' },
            mining2: { name: 'Quantum Mining', cost: 250, researched: false, unlocks: ['mining3'], bonus: 'mining_efficiency' },
            mining3: { name: 'Temporal Mining', cost: 500, researched: false, unlocks: [], bonus: 'auto_mining' },
            combat1: { name: 'Laser Weapons', cost: 150, researched: false, unlocks: ['combat2'], bonus: 'weapon_damage' },
            combat2: { name: 'Plasma Cannons', cost: 300, researched: false, unlocks: ['combat3'], bonus: 'weapon_range' },
            combat3: { name: 'Antimatter Bombs', cost: 600, researched: false, unlocks: [], bonus: 'area_damage' },
            shield1: { name: 'Energy Shields', cost: 200, researched: false, unlocks: ['shield2'], bonus: 'defense' },
            shield2: { name: 'Phase Shields', cost: 400, researched: false, unlocks: [], bonus: 'regen' },
            economy1: { name: 'Trade Networks', cost: 100, researched: false, unlocks: ['economy2'], bonus: 'income' },
            economy2: { name: 'Galactic Markets', cost: 250, researched: false, unlocks: [], bonus: 'trade_bonus' },
            exploration1: { name: 'Advanced Sensors', cost: 150, researched: false, unlocks: ['exploration2'], bonus: 'scan_range' },
            exploration2: { name: 'Warp Drive', cost: 350, researched: false, unlocks: [], bonus: 'speed' }
        };
        this.currentResearch = null;
        this.researchProgress = 0;

        // Crafting (Raft inspired)
        this.craftingRecipes = {
            mining_laser: { name: 'Mining Laser', ingredients: { iron: 10, crystals: 5 }, unlocks: 'better_mining' },
            space_suit: { name: 'Advanced Space Suit', ingredients: { titanium: 15, platinum: 5 }, unlocks: 'survival_bonus' },
            oxygen_tank: { name: 'Oxygen Tank', ingredients: { iron: 5, titanium: 5 }, unlocks: 'oxygen_capacity' },
            shield_generator: { name: 'Shield Generator', ingredients: { platinum: 10, crystals: 10 }, unlocks: 'personal_shield' },
            food_synthesizer: { name: 'Food Synthesizer', ingredients: { iron: 20, crystals: 5 }, unlocks: 'unlimited_food' },
            warp_core: { name: 'Warp Core', ingredients: { antimatter: 10, platinum: 20, crystals: 15 }, unlocks: 'fast_travel' },
            turret: { name: 'Defense Turret', ingredients: { iron: 15, titanium: 10 }, unlocks: 'auto_defense' },
            refinery: { name: 'Resource Refinery', ingredients: { iron: 25, titanium: 15, platinum: 10 }, unlocks: 'resource_multiplier' }
        };
        this.craftedItems = [];

        // Achievements
        this.achievements = [
            { id: 'first_rock', name: 'First Rock', description: 'Mine your first space rock', unlocked: false },
            { id: 'josh_squad', name: 'Josh Squad', description: 'Recruit 10 Joshes', unlocked: false },
            { id: 'territory_baron', name: 'Territory Baron', description: 'Own 5 territories', unlocked: false },
            { id: 'tech_master', name: 'Tech Master', description: 'Research all technologies', unlocked: false },
            { id: 'survivor', name: 'Survivor', description: 'Survive 1000 game ticks', unlocked: false },
            { id: 'fleet_admiral', name: 'Fleet Admiral', description: 'Build 20 ships', unlocked: false },
            { id: 'destroyer', name: 'Destroyer', description: 'Defeat 50 enemies', unlocked: false },
            { id: 'craftsman', name: 'Master Craftsman', description: 'Craft all items', unlocked: false },
            { id: 'billionaire', name: 'Billionaire', description: 'Accumulate 10000 credits', unlocked: false },
            { id: 'explorer', name: 'Explorer', description: 'Discover all sectors', unlocked: false }
        ];

        // Pac-Man style maze
        this.maze = this.generateMaze();
        this.pellets = [];
        this.powerPellets = [];
        this.ghosts = [];
        this.generatePellets();
        this.spawnGhosts(4);

        // AI Opponents (MOO2 inspired)
        this.aiPlayers = [
            { id: 1, name: 'Evil Dog Empire', color: '#ff0000', territories: 3, hostility: 0.8, ships: 5 },
            { id: 2, name: 'Bird Alliance', color: '#0000ff', territories: 2, hostility: 0.5, ships: 3 },
            { id: 3, name: 'Robot Collective', color: '#ff00ff', territories: 2, hostility: 0.9, ships: 4 }
        ];

        // Game settings
        this.autoMining = false;
        this.zoom = 1;
        this.cameraOffset = { x: 0, y: 0 };

        // Stats tracking
        this.stats = {
            rocksMinedTotal: 0,
            enemiesDefeated: 0,
            territoriesConquered: 0,
            creditsEarned: 0,
            distanceTraveled: 0,
            timePlayed: 0
        };

        // Initialize
        this.setupEventListeners();
        this.updateUI();
        this.gameLoop();
        this.survivalLoop();
        this.aiLoop();

        this.log('Welcome to Space Cats: Mining for Josh!', 'info');
        this.log('Your mission: Mine space rocks, expand territory, and dominate the galaxy!', 'info');
    }

    // ==================== CORE GAME LOOP ====================
    gameLoop() {
        if (!this.paused) {
            this.update();
            this.render();
        }
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        this.gameTime++;
        this.stats.timePlayed++;

        // Update player movement
        this.updatePlayer();

        // Update Joshes
        this.updateJoshes();

        // Update ships
        this.updateShips();

        // Update enemies
        this.updateEnemies();

        // Update projectiles
        this.updateProjectiles();

        // Update ghosts (Pac-Man)
        this.updateGhosts();

        // Auto-mining
        if (this.autoMining) {
            this.autoMineNearbyRocks();
        }

        // Research progress
        if (this.currentResearch) {
            this.researchProgress += 0.5;
            if (this.researchProgress >= 100) {
                this.completeResearch();
            }
        }

        // Territory income
        if (this.gameTime % 100 === 0) {
            this.collectTerritoryIncome();
        }

        // Check achievements
        this.checkAchievements();

        // Random events
        if (Math.random() < 0.001) {
            this.triggerRandomEvent();
        }

        this.updateUI();
    }

    render() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Clear canvas with space background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);

        // Draw stars
        this.drawStars();

        // Draw maze (Pac-Man style)
        this.drawMaze();

        // Draw pellets
        this.drawPellets();

        // Draw territories
        this.drawTerritories();

        // Draw space rocks
        this.drawSpaceRocks();

        // Draw Joshes
        this.drawJoshes();

        // Draw ships
        this.drawShips();

        // Draw enemies
        this.drawEnemies();

        // Draw projectiles
        this.drawProjectiles();

        // Draw ghosts
        this.drawGhosts();

        // Draw player
        this.drawPlayer();

        // Draw minimap
        this.drawMinimap();
    }

    // ==================== SURVIVAL MECHANICS (The Long Dark) ====================
    survivalLoop() {
        if (!this.paused) {
            // Decrease survival stats over time
            this.player.hunger = Math.max(0, this.player.hunger - 0.05);
            this.player.temperature = Math.max(0, this.player.temperature - 0.02);
            this.player.oxygen = Math.max(0, this.player.oxygen - 0.03);

            // Health effects
            if (this.player.hunger < 20) {
                this.player.health = Math.max(0, this.player.health - 0.1);
            }
            if (this.player.temperature < 20) {
                this.player.health = Math.max(0, this.player.health - 0.15);
            }
            if (this.player.oxygen < 20) {
                this.player.health = Math.max(0, this.player.health - 0.2);
            }

            // Health regeneration
            if (this.player.hunger > 50 && this.player.temperature > 50 && this.player.oxygen > 50) {
                this.player.health = Math.min(this.player.maxHealth, this.player.health + 0.05);
            }

            // Game over check
            if (this.player.health <= 0) {
                this.gameOver();
            }

            this.updateSurvivalUI();
        }

        setTimeout(() => this.survivalLoop(), 100);
    }

    updateSurvivalUI() {
        document.getElementById('health-bar').style.width = this.player.health + '%';
        document.getElementById('health-value').textContent = Math.floor(this.player.health);
        document.getElementById('hunger-bar').style.width = this.player.hunger + '%';
        document.getElementById('hunger-value').textContent = Math.floor(this.player.hunger);
        document.getElementById('temp-bar').style.width = this.player.temperature + '%';
        document.getElementById('temp-value').textContent = Math.floor(this.player.temperature);
        document.getElementById('oxygen-bar').style.width = this.player.oxygen + '%';
        document.getElementById('oxygen-value').textContent = Math.floor(this.player.oxygen);
    }

    // ==================== PLAYER MECHANICS ====================
    updatePlayer() {
        const keys = this.keys || {};

        // Movement (WASD or Arrow keys)
        if (keys['w'] || keys['ArrowUp']) this.player.velocity.y = -this.player.speed;
        else if (keys['s'] || keys['ArrowDown']) this.player.velocity.y = this.player.speed;
        else this.player.velocity.y = 0;

        if (keys['a'] || keys['ArrowLeft']) this.player.velocity.x = -this.player.speed;
        else if (keys['d'] || keys['ArrowRight']) this.player.velocity.x = this.player.speed;
        else this.player.velocity.x = 0;

        // Update position
        this.player.position.x += this.player.velocity.x;
        this.player.position.y += this.player.velocity.y;

        // Keep in bounds
        this.player.position.x = Math.max(10, Math.min(590, this.player.position.x));
        this.player.position.y = Math.max(10, Math.min(590, this.player.position.y));

        // Update direction
        if (this.player.velocity.x !== 0 || this.player.velocity.y !== 0) {
            this.player.direction = Math.atan2(this.player.velocity.y, this.player.velocity.x);
            this.stats.distanceTraveled += Math.sqrt(this.player.velocity.x ** 2 + this.player.velocity.y ** 2);
        }

        // Check for rock collection
        this.checkRockCollection();

        // Check for pellet collection (Pac-Man)
        this.checkPelletCollection();
    }

    drawPlayer() {
        const ctx = this.ctx;
        const p = this.player.position;

        // Draw cat (Josh)
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(this.player.direction);

        // Cat body
        ctx.fillStyle = '#ff9900';
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();

        // Cat ears
        ctx.fillStyle = '#ff7700';
        ctx.beginPath();
        ctx.moveTo(-8, -8);
        ctx.lineTo(-12, -14);
        ctx.lineTo(-4, -10);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(8, -8);
        ctx.lineTo(12, -14);
        ctx.lineTo(4, -10);
        ctx.fill();

        // Cat face
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-4, -2, 2, 0, Math.PI * 2);
        ctx.arc(4, -2, 2, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-4, -2, 1, 0, Math.PI * 2);
        ctx.arc(4, -2, 1, 0, Math.PI * 2);
        ctx.fill();

        // Whiskers
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-8, 0);
        ctx.lineTo(-14, -1);
        ctx.moveTo(-8, 2);
        ctx.lineTo(-14, 3);
        ctx.moveTo(8, 0);
        ctx.lineTo(14, -1);
        ctx.moveTo(8, 2);
        ctx.lineTo(14, 3);
        ctx.stroke();

        ctx.restore();

        // Health bar above player
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(p.x - 15, p.y - 25, 30, 4);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(p.x - 15, p.y - 25, 30 * (this.player.health / 100), 4);
    }

    // ==================== MINING MECHANICS ====================
    generateSpaceRocks(count) {
        for (let i = 0; i < count; i++) {
            this.spaceRocks.push({
                x: Math.random() * 600,
                y: Math.random() * 600,
                size: 5 + Math.random() * 10,
                type: this.getRandomRockType(),
                value: Math.floor(10 + Math.random() * 40),
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.05
            });
        }
    }

    getRandomRockType() {
        const rand = Math.random();
        if (rand < 0.5) return 'common';
        if (rand < 0.8) return 'iron';
        if (rand < 0.92) return 'titanium';
        if (rand < 0.97) return 'platinum';
        if (rand < 0.99) return 'crystal';
        return 'antimatter';
    }

    drawSpaceRocks() {
        const ctx = this.ctx;

        this.spaceRocks.forEach(rock => {
            rock.rotation += rock.rotationSpeed;

            ctx.save();
            ctx.translate(rock.x, rock.y);
            ctx.rotate(rock.rotation);

            // Rock color based on type
            const colors = {
                common: '#888888',
                iron: '#cc6600',
                titanium: '#4444ff',
                platinum: '#ddddff',
                crystal: '#00ffff',
                antimatter: '#ff00ff'
            };

            ctx.fillStyle = colors[rock.type] || '#888888';
            ctx.beginPath();

            // Draw irregular rock shape
            const points = 6;
            for (let i = 0; i < points; i++) {
                const angle = (i / points) * Math.PI * 2;
                const radius = rock.size * (0.8 + Math.random() * 0.4);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        });
    }

    checkRockCollection() {
        const p = this.player.position;

        for (let i = this.spaceRocks.length - 1; i >= 0; i--) {
            const rock = this.spaceRocks[i];
            const dist = Math.sqrt((p.x - rock.x) ** 2 + (p.y - rock.y) ** 2);

            if (dist < 20) {
                this.mineRock(rock, i);
            }
        }
    }

    mineRock(rock, index) {
        // Add resources based on rock type
        this.resources.rocks += rock.value;
        this.stats.rocksMinedTotal += rock.value;

        switch (rock.type) {
            case 'iron':
                this.resources.iron += Math.floor(rock.value / 2);
                break;
            case 'titanium':
                this.resources.titanium += Math.floor(rock.value / 3);
                break;
            case 'platinum':
                this.resources.platinum += Math.floor(rock.value / 4);
                break;
            case 'crystal':
                this.resources.crystals += Math.floor(rock.value / 5);
                break;
            case 'antimatter':
                this.resources.antimatter += 1;
                break;
        }

        this.resources.credits += rock.value;
        this.stats.creditsEarned += rock.value;

        // Remove rock
        this.spaceRocks.splice(index, 1);

        // Generate new rock
        this.generateSpaceRocks(1);

        // Restore hunger slightly
        this.player.hunger = Math.min(100, this.player.hunger + 2);

        this.log(`Mined ${rock.type} rock for ${rock.value} credits!`, 'success');
    }

    autoMineNearbyRocks() {
        if (this.gameTime % 30 === 0) {
            this.joshes.forEach(josh => {
                if (josh.role === 'mining') {
                    const nearbyRock = this.findNearestRock(josh.position);
                    if (nearbyRock) {
                        const dist = Math.sqrt((josh.position.x - nearbyRock.rock.x) ** 2 + (josh.position.y - nearbyRock.rock.y) ** 2);
                        if (dist < 30) {
                            this.mineRock(nearbyRock.rock, nearbyRock.index);
                            josh.experience += 10;
                            if (josh.experience >= josh.level * 100) {
                                josh.level++;
                                josh.experience = 0;
                                this.log(`${josh.name} leveled up to level ${josh.level}!`, 'success');
                            }
                        }
                    }
                }
            });
        }
    }

    findNearestRock(position) {
        let nearest = null;
        let minDist = Infinity;

        this.spaceRocks.forEach((rock, index) => {
            const dist = Math.sqrt((position.x - rock.x) ** 2 + (position.y - rock.y) ** 2);
            if (dist < minDist) {
                minDist = dist;
                nearest = { rock, index };
            }
        });

        return nearest;
    }

    // ==================== JOSH MANAGEMENT (AOE2 inspired) ====================
    updateJoshes() {
        this.joshes.forEach(josh => {
            // Move towards nearest rock if mining
            if (josh.role === 'mining') {
                const nearestRock = this.findNearestRock(josh.position);
                if (nearestRock) {
                    const dx = nearestRock.rock.x - josh.position.x;
                    const dy = nearestRock.rock.y - josh.position.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 30) {
                        josh.position.x += (dx / dist) * 2;
                        josh.position.y += (dy / dist) * 2;
                    }
                }
            }

            // Move towards nearest enemy if combat
            if (josh.role === 'combat') {
                const nearestEnemy = this.findNearestEnemy(josh.position);
                if (nearestEnemy) {
                    const dx = nearestEnemy.x - josh.position.x;
                    const dy = nearestEnemy.y - josh.position.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 50) {
                        josh.position.x += (dx / dist) * 2.5;
                        josh.position.y += (dy / dist) * 2.5;
                    } else {
                        // Attack!
                        if (this.gameTime % 30 === 0) {
                            this.shootProjectile(josh.position, nearestEnemy, 'friendly');
                        }
                    }
                }
            }
        });
    }

    drawJoshes() {
        const ctx = this.ctx;

        this.joshes.forEach(josh => {
            const p = josh.position;

            // Draw Josh cat
            ctx.fillStyle = josh === this.selectedJosh ? '#ffff00' : '#ff9900';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
            ctx.fill();

            // Role indicator
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            const roleEmoji = josh.role === 'mining' ? '⛏️' : josh.role === 'combat' ? '⚔️' : '🔬';
            ctx.fillText(roleEmoji, p.x, p.y - 12);

            // Level
            ctx.fillText(josh.level, p.x, p.y + 20);

            // Health bar
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(p.x - 10, p.y - 15, 20, 3);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(p.x - 10, p.y - 15, 20 * (josh.health / 100), 3);
        });
    }

    recruitJosh() {
        if (this.resources.credits >= 50) {
            this.resources.credits -= 50;
            const newJosh = {
                id: this.joshes.length + 1,
                name: `Josh ${this.getJoshName()}`,
                role: 'mining',
                level: 1,
                experience: 0,
                health: 100,
                position: {
                    x: this.player.position.x + (Math.random() - 0.5) * 50,
                    y: this.player.position.y + (Math.random() - 0.5) * 50
                }
            };
            this.joshes.push(newJosh);
            this.updateJoshUI();
            this.log(`Recruited ${newJosh.name}!`, 'success');
        } else {
            this.log('Not enough credits to recruit Josh!', 'warning');
        }
    }

    getJoshName() {
        const names = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Theta', 'Omega', 'Prime', 'Neo', 'Max', 'Rex', 'Nova', 'Star', 'Blaze'];
        return names[Math.floor(Math.random() * names.length)];
    }

    trainJosh() {
        if (this.selectedJosh && this.resources.credits >= 30) {
            this.resources.credits -= 30;
            this.selectedJosh.experience += 50;
            if (this.selectedJosh.experience >= this.selectedJosh.level * 100) {
                this.selectedJosh.level++;
                this.selectedJosh.experience = 0;
                this.log(`${this.selectedJosh.name} leveled up to level ${this.selectedJosh.level}!`, 'success');
            }
            this.updateJoshUI();
        } else {
            this.log('Select a Josh and have enough credits to train!', 'warning');
        }
    }

    assignJosh(role) {
        if (this.selectedJosh) {
            this.selectedJosh.role = role;
            this.log(`${this.selectedJosh.name} assigned to ${role}!`, 'info');
            this.updateJoshUI();
        } else {
            this.log('Please select a Josh first!', 'warning');
        }
    }

    updateJoshUI() {
        const container = document.getElementById('josh-list');
        container.innerHTML = '';

        this.joshes.forEach(josh => {
            const div = document.createElement('div');
            div.className = 'josh-item' + (josh === this.selectedJosh ? ' selected' : '');
            div.innerHTML = `
                <strong>${josh.name}</strong> (Lv ${josh.level})<br>
                Role: ${josh.role} | HP: ${Math.floor(josh.health)}<br>
                XP: ${josh.experience}/${josh.level * 100}
            `;
            div.onclick = () => {
                this.selectedJosh = josh;
                this.updateJoshUI();
            };
            container.appendChild(div);
        });

        document.getElementById('josh-count').textContent = this.joshes.length;
    }

    // ==================== FLEET & COMBAT (MOO2 & AOE2) ====================
    buildShip(type) {
        const costs = {
            fighter: 100,
            miner: 80,
            cruiser: 200
        };

        if (this.resources.credits >= costs[type]) {
            this.resources.credits -= costs[type];
            const ship = {
                type,
                position: {
                    x: this.player.position.x + (Math.random() - 0.5) * 100,
                    y: this.player.position.y + (Math.random() - 0.5) * 100
                },
                velocity: { x: 0, y: 0 },
                health: type === 'cruiser' ? 200 : type === 'fighter' ? 80 : 100,
                maxHealth: type === 'cruiser' ? 200 : type === 'fighter' ? 80 : 100,
                damage: type === 'fighter' ? 20 : type === 'cruiser' ? 40 : 10,
                target: null
            };
            this.ships.push(ship);
            this.log(`Built ${type} ship!`, 'success');
            this.updateFleetUI();
        } else {
            this.log('Not enough credits to build ship!', 'warning');
        }
    }

    updateShips() {
        this.ships.forEach((ship, index) => {
            if (ship.health <= 0) {
                this.ships.splice(index, 1);
                return;
            }

            // Find target
            if (!ship.target || ship.target.health <= 0) {
                ship.target = this.findNearestEnemy(ship.position);
            }

            // Move towards target
            if (ship.target) {
                const dx = ship.target.x - ship.position.x;
                const dy = ship.target.y - ship.position.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 100) {
                    ship.position.x += (dx / dist) * 3;
                    ship.position.y += (dy / dist) * 3;
                } else {
                    // Attack
                    if (this.gameTime % 40 === 0) {
                        this.shootProjectile(ship.position, ship.target, 'friendly');
                    }
                }
            }
        });
    }

    drawShips() {
        const ctx = this.ctx;

        this.ships.forEach(ship => {
            const p = ship.position;

            ctx.save();
            ctx.translate(p.x, p.y);

            // Ship shape based on type
            if (ship.type === 'fighter') {
                ctx.fillStyle = '#00ff00';
                ctx.beginPath();
                ctx.moveTo(10, 0);
                ctx.lineTo(-5, -5);
                ctx.lineTo(-5, 5);
                ctx.closePath();
                ctx.fill();
            } else if (ship.type === 'miner') {
                ctx.fillStyle = '#ffaa00';
                ctx.fillRect(-5, -5, 10, 10);
            } else if (ship.type === 'cruiser') {
                ctx.fillStyle = '#0088ff';
                ctx.beginPath();
                ctx.arc(0, 0, 8, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();

            // Health bar
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(p.x - 10, p.y - 15, 20, 3);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(p.x - 10, p.y - 15, 20 * (ship.health / ship.maxHealth), 3);
        });
    }

    updateFleetUI() {
        document.getElementById('ship-count').textContent = this.ships.length;
        const totalPower = this.ships.reduce((sum, ship) => sum + ship.damage, 0);
        document.getElementById('fleet-power').textContent = totalPower;
    }

    // ==================== ENEMIES & COMBAT ====================
    spawnEnemy() {
        const edge = Math.floor(Math.random() * 4);
        let x, y;

        switch (edge) {
            case 0: x = Math.random() * 600; y = 0; break;
            case 1: x = 600; y = Math.random() * 600; break;
            case 2: x = Math.random() * 600; y = 600; break;
            case 3: x = 0; y = Math.random() * 600; break;
        }

        this.enemies.push({
            x, y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            health: 50 + Math.random() * 50,
            maxHealth: 100,
            type: Math.random() < 0.5 ? 'ship' : 'drone',
            damage: 10 + Math.random() * 20
        });
    }

    updateEnemies() {
        // Spawn new enemies periodically
        if (this.gameTime % 200 === 0 && this.enemies.length < 10) {
            this.spawnEnemy();
        }

        this.enemies.forEach((enemy, index) => {
            if (enemy.health <= 0) {
                this.enemies.splice(index, 1);
                this.stats.enemiesDefeated++;
                this.resources.credits += 20;
                this.log('Enemy destroyed! +20 credits', 'success');
                return;
            }

            // Move towards player
            const dx = this.player.position.x - enemy.x;
            const dy = this.player.position.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            enemy.x += (dx / dist) * 1.5;
            enemy.y += (dy / dist) * 1.5;

            // Attack player if close
            if (dist < 30 && this.gameTime % 60 === 0) {
                this.player.health -= enemy.damage / 10;
                this.log('Under attack!', 'danger');
            }

            // Shoot at player
            if (dist < 200 && this.gameTime % 80 === 0) {
                this.shootProjectile(enemy, this.player.position, 'enemy');
            }
        });
    }

    drawEnemies() {
        const ctx = this.ctx;

        this.enemies.forEach(enemy => {
            ctx.fillStyle = '#ff0000';
            if (enemy.type === 'ship') {
                ctx.beginPath();
                ctx.moveTo(enemy.x, enemy.y - 10);
                ctx.lineTo(enemy.x - 8, enemy.y + 10);
                ctx.lineTo(enemy.x + 8, enemy.y + 10);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(enemy.x, enemy.y, 8, 0, Math.PI * 2);
                ctx.fill();
            }

            // Health bar
            ctx.fillStyle = '#000';
            ctx.fillRect(enemy.x - 10, enemy.y - 15, 20, 3);
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(enemy.x - 10, enemy.y - 15, 20 * (enemy.health / enemy.maxHealth), 3);
        });
    }

    findNearestEnemy(position) {
        let nearest = null;
        let minDist = Infinity;

        this.enemies.forEach(enemy => {
            const dist = Math.sqrt((position.x - enemy.x) ** 2 + (position.y - enemy.y) ** 2);
            if (dist < minDist) {
                minDist = dist;
                nearest = enemy;
            }
        });

        return nearest;
    }

    attackEnemy() {
        const nearest = this.findNearestEnemy(this.player.position);
        if (nearest) {
            this.shootProjectile(this.player.position, nearest, 'friendly');
            this.log('Attacking enemy!', 'info');
        } else {
            this.log('No enemies in range!', 'warning');
        }
    }

    shootProjectile(from, to, owner) {
        this.projectiles.push({
            x: from.x,
            y: from.y,
            vx: (to.x - from.x) / 20,
            vy: (to.y - from.y) / 20,
            owner,
            damage: 15
        });
    }

    updateProjectiles() {
        this.projectiles.forEach((proj, index) => {
            proj.x += proj.vx;
            proj.y += proj.vy;

            // Remove if out of bounds
            if (proj.x < 0 || proj.x > 600 || proj.y < 0 || proj.y > 600) {
                this.projectiles.splice(index, 1);
                return;
            }

            // Check collisions
            if (proj.owner === 'friendly') {
                this.enemies.forEach(enemy => {
                    const dist = Math.sqrt((proj.x - enemy.x) ** 2 + (proj.y - enemy.y) ** 2);
                    if (dist < 10) {
                        enemy.health -= proj.damage;
                        this.projectiles.splice(index, 1);
                    }
                });
            } else {
                const dist = Math.sqrt((proj.x - this.player.position.x) ** 2 + (proj.y - this.player.position.y) ** 2);
                if (dist < 15) {
                    this.player.health -= proj.damage;
                    this.projectiles.splice(index, 1);
                }

                this.ships.forEach(ship => {
                    const dist = Math.sqrt((proj.x - ship.position.x) ** 2 + (proj.y - ship.position.y) ** 2);
                    if (dist < 10) {
                        ship.health -= proj.damage;
                        this.projectiles.splice(index, 1);
                    }
                });
            }
        });
    }

    drawProjectiles() {
        const ctx = this.ctx;

        this.projectiles.forEach(proj => {
            ctx.fillStyle = proj.owner === 'friendly' ? '#00ff00' : '#ff0000';
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // ==================== TERRITORY SYSTEM (Monopoly inspired) ====================
    drawTerritories() {
        const ctx = this.ctx;

        this.territories.forEach(territory => {
            const p = territory.position;

            // Territory circle
            ctx.strokeStyle = territory.owned ? '#00ff88' : '#888888';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 40 + territory.level * 10, 0, Math.PI * 2);
            ctx.stroke();

            // Territory name
            ctx.fillStyle = '#ffaa00';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(territory.name, p.x, p.y - 50);
            ctx.fillText(`Lv ${territory.level}`, p.x, p.y - 35);
        });
    }

    expandTerritory() {
        if (this.resources.credits >= 100) {
            this.resources.credits -= 100;
            const newTerritory = {
                id: this.territories.length + 1,
                name: `Sector ${String.fromCharCode(65 + this.territories.length)}`,
                level: 1,
                income: 10,
                owned: true,
                position: {
                    x: 100 + Math.random() * 400,
                    y: 100 + Math.random() * 400
                }
            };
            this.territories.push(newTerritory);
            this.stats.territoriesConquered++;
            this.log(`Expanded to ${newTerritory.name}!`, 'success');
            this.updateTerritoryUI();
        } else {
            this.log('Not enough credits to expand territory!', 'warning');
        }
    }

    buyProperty() {
        this.expandTerritory();
    }

    upgradeProperty() {
        if (this.territories.length > 0 && this.resources.credits >= 150) {
            this.resources.credits -= 150;
            const territory = this.territories[Math.floor(Math.random() * this.territories.length)];
            territory.level++;
            territory.income += 10;
            this.log(`Upgraded ${territory.name} to level ${territory.level}!`, 'success');
            this.updateTerritoryUI();
        } else {
            this.log('Not enough credits to upgrade property!', 'warning');
        }
    }

    collectTerritoryIncome() {
        let totalIncome = 0;
        this.territories.forEach(territory => {
            if (territory.owned) {
                totalIncome += territory.income * territory.level;
            }
        });

        if (totalIncome > 0) {
            this.resources.credits += totalIncome;
            this.player.temperature = Math.min(100, this.player.temperature + 5);
            this.player.oxygen = Math.min(100, this.player.oxygen + 5);
        }
    }

    updateTerritoryUI() {
        const container = document.getElementById('territory-list');
        container.innerHTML = '';

        this.territories.forEach(territory => {
            const div = document.createElement('div');
            div.className = 'territory-item';
            div.innerHTML = `
                <div class="territory-name">${territory.name} (Lv ${territory.level})</div>
                <div class="territory-income">Income: ${territory.income * territory.level} credits/tick</div>
            `;
            container.appendChild(div);
        });

        document.getElementById('territory-count').textContent = this.territories.filter(t => t.owned).length;
    }

    tradeWithAI() {
        if (this.resources.rocks >= 50) {
            this.resources.rocks -= 50;
            this.resources.credits += 100;
            this.resources.food += 20;
            this.player.hunger = Math.min(100, this.player.hunger + 20);
            this.log('Traded 50 rocks for 100 credits and 20 food!', 'success');
        } else {
            this.log('Not enough rocks to trade!', 'warning');
        }
    }

    // ==================== TECHNOLOGY TREE (MOO2 inspired) ====================
    updateTechUI() {
        const container = document.getElementById('tech-tree');
        container.innerHTML = '';

        Object.keys(this.technologies).forEach(key => {
            const tech = this.technologies[key];
            const div = document.createElement('div');
            div.className = 'tech-item' + (tech.researched ? ' researched' : '');
            div.innerHTML = `
                <strong>${tech.name}</strong><br>
                Cost: ${tech.cost}<br>
                ${tech.researched ? '✓ Researched' : ''}
            `;
            div.onclick = () => this.startResearch(key);
            container.appendChild(div);
        });
    }

    startResearch(techKey) {
        const tech = this.technologies[techKey];

        if (tech.researched) {
            this.log('Already researched!', 'warning');
            return;
        }

        if (this.resources.credits >= tech.cost) {
            this.resources.credits -= tech.cost;
            this.currentResearch = techKey;
            this.researchProgress = 0;
            this.log(`Started researching ${tech.name}!`, 'info');
            document.getElementById('research-name').textContent = tech.name;
        } else {
            this.log('Not enough credits to research!', 'warning');
        }
    }

    completeResearch() {
        if (this.currentResearch) {
            const tech = this.technologies[this.currentResearch];
            tech.researched = true;
            this.log(`Completed research: ${tech.name}!`, 'success');

            // Apply bonuses
            this.applyTechBonus(tech.bonus);

            this.currentResearch = null;
            this.researchProgress = 0;
            document.getElementById('research-name').textContent = 'None';
            document.getElementById('research-bar').style.width = '0%';
            this.updateTechUI();
        }
    }

    applyTechBonus(bonus) {
        switch (bonus) {
            case 'mining_speed':
                this.player.speed += 1;
                break;
            case 'mining_efficiency':
                this.autoMining = true;
                break;
            case 'weapon_damage':
                this.joshes.forEach(j => j.damage = (j.damage || 10) * 1.5);
                break;
            case 'defense':
                this.player.maxHealth += 50;
                break;
            case 'income':
                this.territories.forEach(t => t.income *= 1.5);
                break;
        }
    }

    // ==================== CRAFTING SYSTEM (Raft inspired) ====================
    showCraftingMenu() {
        const modal = document.getElementById('crafting-modal');
        const grid = document.getElementById('crafting-grid');
        grid.innerHTML = '';

        Object.keys(this.craftingRecipes).forEach(key => {
            const recipe = this.craftingRecipes[key];
            const canCraft = this.canCraft(recipe);

            const div = document.createElement('div');
            div.className = 'craft-recipe' + (canCraft ? '' : ' unavailable');

            let ingredientsHTML = '';
            Object.keys(recipe.ingredients).forEach(ing => {
                ingredientsHTML += `<div class="ingredient">${ing}: ${recipe.ingredients[ing]}</div>`;
            });

            div.innerHTML = `
                <h4>${recipe.name}</h4>
                <div class="ingredients">${ingredientsHTML}</div>
                <button onclick="game.craftItem('${key}')" ${!canCraft ? 'disabled' : ''}>Craft</button>
            `;
            grid.appendChild(div);
        });

        modal.style.display = 'flex';
    }

    canCraft(recipe) {
        for (let ing in recipe.ingredients) {
            if ((this.resources[ing] || 0) < recipe.ingredients[ing]) {
                return false;
            }
        }
        return true;
    }

    craftItem(key) {
        const recipe = this.craftingRecipes[key];

        if (this.canCraft(recipe)) {
            // Deduct resources
            Object.keys(recipe.ingredients).forEach(ing => {
                this.resources[ing] -= recipe.ingredients[ing];
            });

            this.craftedItems.push(key);
            this.log(`Crafted ${recipe.name}!`, 'success');

            // Apply crafting bonuses
            this.applyCraftBonus(recipe.unlocks);

            this.closeCraftingModal();
        }
    }

    applyCraftBonus(unlock) {
        switch (unlock) {
            case 'survival_bonus':
                this.player.maxHealth += 50;
                this.player.health = this.player.maxHealth;
                break;
            case 'oxygen_capacity':
                this.player.oxygen = 100;
                break;
            case 'unlimited_food':
                this.player.hunger = 100;
                break;
            case 'resource_multiplier':
                // Resources gain multiplier - applied in mining
                break;
        }
    }

    closeCraftingModal() {
        document.getElementById('crafting-modal').style.display = 'none';
    }

    // ==================== PAC-MAN MECHANICS ====================
    generateMaze() {
        const maze = [];
        const size = 20;

        for (let y = 0; y < size; y++) {
            maze[y] = [];
            for (let x = 0; x < size; x++) {
                // Create maze pattern
                const isWall = (x === 0 || x === size - 1 || y === 0 || y === size - 1) ||
                              (x % 4 === 0 && y % 4 === 0 && Math.random() < 0.3);
                maze[y][x] = isWall ? 1 : 0;
            }
        }

        return maze;
    }

    drawMaze() {
        const ctx = this.ctx;
        const cellSize = 30;

        ctx.strokeStyle = 'rgba(0, 100, 255, 0.3)';
        ctx.lineWidth = 2;

        this.maze.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell === 1) {
                    ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            });
        });
    }

    generatePellets() {
        const cellSize = 30;

        for (let y = 1; y < 19; y++) {
            for (let x = 1; x < 19; x++) {
                if (this.maze[y][x] === 0 && Math.random() < 0.3) {
                    this.pellets.push({ x: x * cellSize + 15, y: y * cellSize + 15, value: 5 });
                }
            }
        }

        // Power pellets
        for (let i = 0; i < 4; i++) {
            this.powerPellets.push({
                x: (2 + Math.floor(Math.random() * 16)) * cellSize + 15,
                y: (2 + Math.floor(Math.random() * 16)) * cellSize + 15,
                value: 50
            });
        }
    }

    drawPellets() {
        const ctx = this.ctx;

        // Regular pellets
        ctx.fillStyle = '#ffff00';
        this.pellets.forEach(pellet => {
            ctx.beginPath();
            ctx.arc(pellet.x, pellet.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Power pellets
        ctx.fillStyle = '#ff00ff';
        this.powerPellets.forEach(pellet => {
            ctx.beginPath();
            ctx.arc(pellet.x, pellet.y, 6, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    checkPelletCollection() {
        const p = this.player.position;

        // Regular pellets
        for (let i = this.pellets.length - 1; i >= 0; i--) {
            const pellet = this.pellets[i];
            const dist = Math.sqrt((p.x - pellet.x) ** 2 + (p.y - pellet.y) ** 2);
            if (dist < 15) {
                this.resources.credits += pellet.value;
                this.player.hunger = Math.min(100, this.player.hunger + 1);
                this.pellets.splice(i, 1);
            }
        }

        // Power pellets
        for (let i = this.powerPellets.length - 1; i >= 0; i--) {
            const pellet = this.powerPellets[i];
            const dist = Math.sqrt((p.x - pellet.x) ** 2 + (p.y - pellet.y) ** 2);
            if (dist < 15) {
                this.resources.credits += pellet.value;
                this.player.health = Math.min(this.player.maxHealth, this.player.health + 20);
                this.powerPellets.splice(i, 1);
                this.log('Power pellet collected! +20 health!', 'success');
            }
        }
    }

    spawnGhosts(count) {
        const colors = ['#ff0000', '#ff00ff', '#00ffff', '#ffaa00'];
        for (let i = 0; i < count; i++) {
            this.ghosts.push({
                x: 100 + i * 100,
                y: 100,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                color: colors[i],
                scared: false,
                scaredTimer: 0
            });
        }
    }

    updateGhosts() {
        this.ghosts.forEach(ghost => {
            if (ghost.scared) {
                ghost.scaredTimer--;
                if (ghost.scaredTimer <= 0) {
                    ghost.scared = false;
                }

                // Run away from player
                const dx = ghost.x - this.player.position.x;
                const dy = ghost.y - this.player.position.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                ghost.vx = (dx / dist) * 2;
                ghost.vy = (dy / dist) * 2;
            } else {
                // Chase player
                const dx = this.player.position.x - ghost.x;
                const dy = this.player.position.y - ghost.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                ghost.vx = (dx / dist) * 1.5;
                ghost.vy = (dy / dist) * 1.5;
            }

            ghost.x += ghost.vx;
            ghost.y += ghost.vy;

            // Keep in bounds
            ghost.x = Math.max(20, Math.min(580, ghost.x));
            ghost.y = Math.max(20, Math.min(580, ghost.y));

            // Check collision with player
            const dist = Math.sqrt((ghost.x - this.player.position.x) ** 2 + (ghost.y - this.player.position.y) ** 2);
            if (dist < 20) {
                if (ghost.scared) {
                    // Eat ghost
                    this.resources.credits += 200;
                    ghost.x = 100 + Math.random() * 400;
                    ghost.y = 100 + Math.random() * 400;
                    ghost.scared = false;
                    this.log('Ghost eaten! +200 credits!', 'success');
                } else {
                    // Take damage
                    this.player.health -= 5;
                    this.log('Ghost touched you!', 'danger');
                }
            }
        });
    }

    drawGhosts() {
        const ctx = this.ctx;

        this.ghosts.forEach(ghost => {
            ctx.fillStyle = ghost.scared ? '#0000ff' : ghost.color;
            ctx.beginPath();
            ctx.arc(ghost.x, ghost.y, 12, 0, Math.PI * 2);
            ctx.fill();

            // Eyes
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(ghost.x - 4, ghost.y - 3, 3, 0, Math.PI * 2);
            ctx.arc(ghost.x + 4, ghost.y - 3, 3, 0, Math.PI * 2);
            ctx.fill();

            if (!ghost.scared) {
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(ghost.x - 4, ghost.y - 3, 1.5, 0, Math.PI * 2);
                ctx.arc(ghost.x + 4, ghost.y - 3, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    // ==================== AI OPPONENTS (MOO2 inspired) ====================
    aiLoop() {
        if (!this.paused && this.gameTime % 300 === 0) {
            this.aiPlayers.forEach(ai => {
                // AI expands territory
                if (Math.random() < 0.3) {
                    ai.territories++;
                }

                // AI builds ships
                if (Math.random() < 0.4) {
                    ai.ships++;
                }

                // AI might attack
                if (Math.random() < ai.hostility * 0.1) {
                    this.spawnEnemy();
                    this.log(`${ai.name} sent attack ships!`, 'warning');
                }
            });
        }

        setTimeout(() => this.aiLoop(), 1000);
    }

    // ==================== ACHIEVEMENTS ====================
    checkAchievements() {
        this.achievements.forEach(achievement => {
            if (achievement.unlocked) return;

            let unlock = false;

            switch (achievement.id) {
                case 'first_rock':
                    unlock = this.stats.rocksMinedTotal >= 10;
                    break;
                case 'josh_squad':
                    unlock = this.joshes.length >= 10;
                    break;
                case 'territory_baron':
                    unlock = this.territories.length >= 5;
                    break;
                case 'tech_master':
                    unlock = Object.values(this.technologies).every(t => t.researched);
                    break;
                case 'survivor':
                    unlock = this.stats.timePlayed >= 1000;
                    break;
                case 'fleet_admiral':
                    unlock = this.ships.length >= 20;
                    break;
                case 'destroyer':
                    unlock = this.stats.enemiesDefeated >= 50;
                    break;
                case 'craftsman':
                    unlock = this.craftedItems.length >= Object.keys(this.craftingRecipes).length;
                    break;
                case 'billionaire':
                    unlock = this.resources.credits >= 10000;
                    break;
                case 'explorer':
                    unlock = this.territories.length >= 15;
                    break;
            }

            if (unlock) {
                achievement.unlocked = true;
                this.log(`Achievement unlocked: ${achievement.name}!`, 'success');
                this.updateAchievementsUI();
            }
        });
    }

    updateAchievementsUI() {
        const container = document.getElementById('achievements-list');
        container.innerHTML = '';

        this.achievements.forEach(achievement => {
            const div = document.createElement('div');
            div.className = 'achievement-item' + (achievement.unlocked ? ' unlocked' : '');
            div.innerHTML = `
                <strong>${achievement.unlocked ? '🏆' : '🔒'} ${achievement.name}</strong><br>
                <small>${achievement.description}</small>
            `;
            container.appendChild(div);
        });
    }

    // ==================== RANDOM EVENTS ====================
    triggerRandomEvent() {
        const events = [
            { message: 'Asteroid storm incoming!', effect: () => { this.generateSpaceRocks(20); } },
            { message: 'Lucky find! Bonus credits!', effect: () => { this.resources.credits += 200; } },
            { message: 'Solar flare! Temperature rising!', effect: () => { this.player.temperature -= 30; } },
            { message: 'Oxygen leak detected!', effect: () => { this.player.oxygen -= 20; } },
            { message: 'Found space food!', effect: () => { this.player.hunger = 100; } },
            { message: 'Discovered rare minerals!', effect: () => { this.resources.platinum += 10; } },
            { message: 'Enemy fleet approaching!', effect: () => { for(let i = 0; i < 3; i++) this.spawnEnemy(); } },
            { message: 'Trade caravan arrived!', effect: () => { this.resources.credits += 150; } }
        ];

        const event = events[Math.floor(Math.random() * events.length)];
        this.log(event.message, 'warning');
        event.effect();
    }

    // ==================== UTILITIES ====================
    drawStars() {
        const ctx = this.ctx;
        ctx.fillStyle = '#ffffff';

        for (let i = 0; i < 100; i++) {
            const x = (i * 73) % 600;
            const y = (i * 131) % 600;
            const size = ((i * 37) % 3) / 2;
            ctx.fillRect(x, y, size, size);
        }
    }

    drawMinimap() {
        const ctx = this.ctx;
        const size = 100;
        const x = this.canvas.width - size - 10;
        const y = 10;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x, y, size, size);
        ctx.strokeStyle = '#00ff88';
        ctx.strokeRect(x, y, size, size);

        // Player
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(
            x + (this.player.position.x / 600) * size - 2,
            y + (this.player.position.y / 600) * size - 2,
            4, 4
        );

        // Enemies
        ctx.fillStyle = '#ff0000';
        this.enemies.forEach(enemy => {
            ctx.fillRect(
                x + (enemy.x / 600) * size - 1,
                y + (enemy.y / 600) * size - 1,
                2, 2
            );
        });

        // Territories
        ctx.fillStyle = '#00ff88';
        this.territories.forEach(territory => {
            ctx.fillRect(
                x + (territory.position.x / 600) * size - 2,
                y + (territory.position.y / 600) * size - 2,
                4, 4
            );
        });
    }

    updateUI() {
        document.getElementById('rocks-count').textContent = Math.floor(this.resources.rocks);
        document.getElementById('credits-count').textContent = Math.floor(this.resources.credits);

        if (this.currentResearch) {
            document.getElementById('research-bar').style.width = this.researchProgress + '%';
        }
    }

    log(message, type = 'info') {
        const logDiv = document.getElementById('event-log');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[${Math.floor(this.gameTime / 60)}s] ${message}`;
        logDiv.insertBefore(entry, logDiv.firstChild);

        // Keep only last 50 entries
        while (logDiv.children.length > 50) {
            logDiv.removeChild(logDiv.lastChild);
        }
    }

    clearLog() {
        document.getElementById('event-log').innerHTML = '';
    }

    setupEventListeners() {
        this.keys = {};

        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;

            if (e.key === ' ') {
                e.preventDefault();
                this.attackEnemy();
            }

            if (e.key === 'Escape') {
                this.togglePause();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Check if clicked on Josh
            this.joshes.forEach(josh => {
                const dist = Math.sqrt((x - josh.position.x) ** 2 + (y - josh.position.y) ** 2);
                if (dist < 15) {
                    this.selectedJosh = josh;
                    this.updateJoshUI();
                }
            });
        });
    }

    // ==================== GAME CONTROLS ====================
    toggleAutomation() {
        this.autoMining = !this.autoMining;
        this.log(`Auto-mining ${this.autoMining ? 'enabled' : 'disabled'}!`, 'info');
    }

    scanSector() {
        if (this.resources.credits >= 20) {
            this.resources.credits -= 20;
            this.generateSpaceRocks(10);
            this.log('Scanned sector and found new rocks!', 'success');
        } else {
            this.log('Not enough credits to scan!', 'warning');
        }
    }

    zoomIn() {
        this.zoom = Math.min(2, this.zoom + 0.1);
    }

    zoomOut() {
        this.zoom = Math.max(0.5, this.zoom - 0.1);
    }

    togglePause() {
        this.paused = !this.paused;
        document.getElementById('pause-menu').style.display = this.paused ? 'flex' : 'none';
    }

    resume() {
        this.paused = false;
        document.getElementById('pause-menu').style.display = 'none';
    }

    saveGame() {
        const saveData = {
            resources: this.resources,
            player: this.player,
            joshes: this.joshes,
            territories: this.territories,
            ships: this.ships,
            technologies: this.technologies,
            craftedItems: this.craftedItems,
            stats: this.stats,
            achievements: this.achievements
        };

        localStorage.setItem('spaceCatsSave', JSON.stringify(saveData));
        this.log('Game saved!', 'success');
    }

    loadGame() {
        const saveData = localStorage.getItem('spaceCatsSave');
        if (saveData) {
            const data = JSON.parse(saveData);
            this.resources = data.resources;
            this.player = data.player;
            this.joshes = data.joshes;
            this.territories = data.territories;
            this.ships = data.ships;
            this.technologies = data.technologies;
            this.craftedItems = data.craftedItems;
            this.stats = data.stats;
            this.achievements = data.achievements;

            this.log('Game loaded!', 'success');
            this.resume();
        } else {
            this.log('No save data found!', 'warning');
        }
    }

    showSettings() {
        alert('Settings coming soon! This is already a AAA game!');
    }

    closeTechModal() {
        document.getElementById('tech-modal').style.display = 'none';
    }

    gameOver() {
        this.paused = true;
        alert(`Game Over!\n\nStats:\nRocks Mined: ${this.stats.rocksMinedTotal}\nEnemies Defeated: ${this.stats.enemiesDefeated}\nTerritories: ${this.territories.length}\nTime Survived: ${Math.floor(this.stats.timePlayed / 60)}s`);
        location.reload();
    }
}

// Initialize game when page loads
let game;
window.addEventListener('load', () => {
    game = new Game();

    // Initialize all UIs
    game.updateJoshUI();
    game.updateTerritoryUI();
    game.updateTechUI();
    game.updateFleetUI();
    game.updateAchievementsUI();

    console.log('🐱 Space Cats: Mining for Josh - The Ultimate Edition 🚀');
    console.log('Controls:');
    console.log('WASD/Arrows - Move');
    console.log('Space - Attack nearest enemy');
    console.log('ESC - Pause');
    console.log('Click on canvas - Select Josh');
});

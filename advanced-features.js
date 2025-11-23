// Space Cats: Mining for Josh - Advanced AAA Features
// Tutorial, Game Modes, Weather, Skill Tree, Building System, and More!

(function() {
    if (typeof Game === 'undefined') {
        console.error('Game class not found! Load game.js first.');
        return;
    }

    // ==================== TUTORIAL SYSTEM ====================
    class TutorialManager {
        constructor(game) {
            this.game = game;
            this.active = true;
            this.currentStep = 0;
            this.steps = [
                {
                    title: 'Welcome, Commander Josh!',
                    message: 'Use WASD or Arrow keys to move your cat around the space sector.',
                    condition: () => this.game.stats.distanceTraveled > 50,
                    reward: { credits: 50 }
                },
                {
                    title: 'Mining Basics',
                    message: 'Move close to the colored rocks to mine them. Different colors have different values!',
                    condition: () => this.game.stats.rocksMinedTotal >= 5,
                    reward: { credits: 100 }
                },
                {
                    title: 'Recruit Your Team',
                    message: 'Click "Recruit Josh" to hire more workers. They can help you mine automatically!',
                    condition: () => this.game.joshes.length >= 2,
                    reward: { credits: 150 }
                },
                {
                    title: 'Survival is Key',
                    message: 'Monitor your Health, Hunger, Temperature, and Oxygen levels. Keep them above 50%!',
                    condition: () => this.game.gameTime > 300,
                    reward: { credits: 100 }
                },
                {
                    title: 'Expand Your Empire',
                    message: 'Use "Expand Territory" to claim new sectors. More territories = more income!',
                    condition: () => this.game.territories.length >= 2,
                    reward: { credits: 200 }
                },
                {
                    title: 'Combat Ready',
                    message: 'Press SPACE to attack enemies. Build ships to defend your empire!',
                    condition: () => this.game.stats.enemiesDefeated >= 3,
                    reward: { credits: 250 }
                },
                {
                    title: 'Research Technology',
                    message: 'Invest in research to unlock powerful upgrades and abilities!',
                    condition: () => Object.values(this.game.technologies).some(t => t.researched),
                    reward: { credits: 300 }
                },
                {
                    title: 'Tutorial Complete!',
                    message: 'You are now ready to conquer the galaxy! Good luck, Commander!',
                    condition: () => true,
                    reward: { credits: 500, special: 'tutorial_badge' }
                }
            ];
        }

        update() {
            if (!this.active || this.currentStep >= this.steps.length) {
                this.active = false;
                return;
            }

            const step = this.steps[this.currentStep];
            if (step.condition()) {
                this.completeStep();
            }
        }

        completeStep() {
            const step = this.steps[this.currentStep];

            if (step.reward) {
                if (step.reward.credits) {
                    this.game.resources.credits += step.reward.credits;
                    this.game.log(`Tutorial reward: +${step.reward.credits} credits!`, 'success');
                }
            }

            this.currentStep++;

            if (this.currentStep < this.steps.length) {
                const nextStep = this.steps[this.currentStep];
                this.game.log(`Tutorial: ${nextStep.title}`, 'info');
                this.game.log(nextStep.message, 'info');
            } else {
                this.active = false;
                this.game.log('Tutorial completed! You are now a master Josh commander!', 'success');
            }
        }

        draw(ctx) {
            if (!this.active || this.currentStep >= this.steps.length) return;

            const step = this.steps[this.currentStep];

            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(150, 450, 300, 120);
            ctx.strokeStyle = '#ffaa00';
            ctx.lineWidth = 3;
            ctx.strokeRect(150, 450, 300, 120);

            ctx.fillStyle = '#ffaa00';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(step.title, 300, 475);

            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            this.wrapText(ctx, step.message, 300, 495, 280, 16);

            // Progress indicator
            ctx.fillStyle = '#00ff88';
            ctx.font = '10px Arial';
            ctx.fillText(`Step ${this.currentStep + 1}/${this.steps.length}`, 300, 560);

            ctx.restore();
        }

        wrapText(ctx, text, x, y, maxWidth, lineHeight) {
            const words = text.split(' ');
            let line = '';
            let yPos = y;

            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;

                if (testWidth > maxWidth && n > 0) {
                    ctx.fillText(line, x, yPos);
                    line = words[n] + ' ';
                    yPos += lineHeight;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, x, yPos);
        }
    }

    // ==================== WEATHER SYSTEM ====================
    class WeatherSystem {
        constructor() {
            this.currentWeather = 'clear';
            this.weatherTimer = 0;
            this.weatherDuration = 500;
            this.particles = [];

            this.weatherTypes = {
                clear: { name: 'Clear Space', effect: null },
                asteroid_storm: { name: 'Asteroid Storm', effect: 'damage_over_time' },
                solar_flare: { name: 'Solar Flare', effect: 'temperature_decrease' },
                cosmic_rain: { name: 'Cosmic Rain', effect: 'resource_bonus' },
                nebula: { name: 'Space Nebula', effect: 'visibility_reduced' },
                radiation_wave: { name: 'Radiation Wave', effect: 'health_drain' }
            };
        }

        update(game) {
            this.weatherTimer++;

            if (this.weatherTimer >= this.weatherDuration) {
                this.changeWeather(game);
                this.weatherTimer = 0;
            }

            // Apply weather effects
            const weather = this.weatherTypes[this.currentWeather];
            if (weather && weather.effect) {
                this.applyEffect(game, weather.effect);
            }

            // Update weather particles
            this.updateParticles();
        }

        changeWeather(game) {
            const types = Object.keys(this.weatherTypes);
            const rand = Math.random();

            if (rand < 0.5) {
                this.currentWeather = 'clear';
            } else {
                this.currentWeather = types[Math.floor(Math.random() * types.length)];
            }

            const weather = this.weatherTypes[this.currentWeather];
            game.log(`Weather changed: ${weather.name}`, 'info');

            this.particles = [];
        }

        applyEffect(game, effect) {
            switch (effect) {
                case 'damage_over_time':
                    if (game.gameTime % 60 === 0) {
                        game.player.health = Math.max(0, game.player.health - 2);
                        this.spawnAsteroidParticles();
                    }
                    break;
                case 'temperature_decrease':
                    game.player.temperature = Math.max(0, game.player.temperature - 0.1);
                    break;
                case 'resource_bonus':
                    if (game.gameTime % 100 === 0) {
                        game.resources.credits += 10;
                    }
                    this.spawnRainParticles();
                    break;
                case 'health_drain':
                    if (game.gameTime % 120 === 0) {
                        game.player.health = Math.max(0, game.player.health - 1);
                    }
                    break;
            }
        }

        spawnAsteroidParticles() {
            for (let i = 0; i < 3; i++) {
                this.particles.push({
                    x: Math.random() * 600,
                    y: -10,
                    vy: 2 + Math.random() * 3,
                    size: 3 + Math.random() * 5,
                    color: '#888888',
                    life: 200
                });
            }
        }

        spawnRainParticles() {
            for (let i = 0; i < 5; i++) {
                this.particles.push({
                    x: Math.random() * 600,
                    y: -10,
                    vy: 5 + Math.random() * 3,
                    size: 2,
                    color: '#00ffff',
                    life: 150
                });
            }
        }

        updateParticles() {
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.y += p.vy;
                p.life--;

                if (p.y > 600 || p.life <= 0) {
                    this.particles.splice(i, 1);
                }
            }
        }

        draw(ctx) {
            // Draw weather particles
            ctx.save();
            this.particles.forEach(p => {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();

            // Draw weather indicator
            const weather = this.weatherTypes[this.currentWeather];
            if (this.currentWeather !== 'clear') {
                ctx.save();
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.fillRect(460, 10, 130, 30);
                ctx.strokeStyle = '#ffaa00';
                ctx.strokeRect(460, 10, 130, 30);
                ctx.fillStyle = '#ffaa00';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(weather.name, 525, 28);
                ctx.restore();
            }
        }
    }

    // ==================== SKILL TREE ====================
    class SkillTree {
        constructor() {
            this.skillPoints = 0;
            this.skills = {
                // Mining Branch
                efficient_mining: { name: 'Efficient Mining', tier: 1, branch: 'mining', cost: 1, unlocked: false, bonus: 'mining_value_+20%' },
                auto_collector: { name: 'Auto Collector', tier: 2, branch: 'mining', cost: 2, unlocked: false, requires: 'efficient_mining' },
                resource_magnet: { name: 'Resource Magnet', tier: 3, branch: 'mining', cost: 3, unlocked: false, requires: 'auto_collector' },

                // Combat Branch
                sharpshooter: { name: 'Sharpshooter', tier: 1, branch: 'combat', cost: 1, unlocked: false, bonus: 'accuracy_+25%' },
                rapid_fire: { name: 'Rapid Fire', tier: 2, branch: 'combat', cost: 2, unlocked: false, requires: 'sharpshooter' },
                explosive_rounds: { name: 'Explosive Rounds', tier: 3, branch: 'combat', cost: 3, unlocked: false, requires: 'rapid_fire' },

                // Survival Branch
                tough_skin: { name: 'Tough Skin', tier: 1, branch: 'survival', cost: 1, unlocked: false, bonus: 'max_health_+50' },
                regeneration: { name: 'Regeneration', tier: 2, branch: 'survival', cost: 2, unlocked: false, requires: 'tough_skin' },
                life_support: { name: 'Advanced Life Support', tier: 3, branch: 'survival', cost: 3, unlocked: false, requires: 'regeneration' },

                // Economy Branch
                entrepreneur: { name: 'Entrepreneur', tier: 1, branch: 'economy', cost: 1, unlocked: false, bonus: 'income_+30%' },
                trade_master: { name: 'Trade Master', tier: 2, branch: 'economy', cost: 2, unlocked: false, requires: 'entrepreneur' },
                tax_haven: { name: 'Tax Haven', tier: 3, branch: 'economy', cost: 3, unlocked: false, requires: 'trade_master' }
            };
        }

        unlockSkill(skillKey, game) {
            const skill = this.skills[skillKey];
            if (!skill) return false;

            // Check requirements
            if (skill.requires && !this.skills[skill.requires].unlocked) {
                game.log('Prerequisite skill required!', 'warning');
                return false;
            }

            // Check skill points
            if (this.skillPoints < skill.cost) {
                game.log('Not enough skill points!', 'warning');
                return false;
            }

            // Unlock skill
            this.skillPoints -= skill.cost;
            skill.unlocked = true;

            // Apply bonus
            this.applySkillBonus(skillKey, game);

            game.log(`Skill unlocked: ${skill.name}!`, 'success');
            return true;
        }

        applySkillBonus(skillKey, game) {
            const skill = this.skills[skillKey];

            switch (skillKey) {
                case 'efficient_mining':
                    game.miningBonus = (game.miningBonus || 1) * 1.2;
                    break;
                case 'tough_skin':
                    game.player.maxHealth += 50;
                    game.player.health = game.player.maxHealth;
                    break;
                case 'sharpshooter':
                    game.accuracyBonus = 1.25;
                    break;
                case 'entrepreneur':
                    game.incomeBonus = (game.incomeBonus || 1) * 1.3;
                    break;
                case 'regeneration':
                    game.healthRegen = 0.1;
                    break;
            }
        }

        earnSkillPoint(game) {
            this.skillPoints++;
            game.log('Skill point earned!', 'success');
        }
    }

    // ==================== BUILDING SYSTEM ====================
    class Building {
        constructor(x, y, type) {
            this.x = x;
            this.y = y;
            this.type = type;
            this.level = 1;
            this.health = 100;
            this.maxHealth = 100;

            const types = {
                mine: { name: 'Mining Outpost', cost: 200, production: 'rocks', rate: 5, color: '#cc6600' },
                refinery: { name: 'Refinery', cost: 300, production: 'credits', rate: 3, color: '#ffd700' },
                barracks: { name: 'Barracks', cost: 250, production: 'joshes', rate: 0.01, color: '#ff0000' },
                lab: { name: 'Research Lab', cost: 400, production: 'research', rate: 1, color: '#aa00ff' },
                defense: { name: 'Defense Turret', cost: 350, production: 'defense', rate: 0, color: '#0088ff' },
                solar: { name: 'Solar Collector', cost: 150, production: 'energy', rate: 10, color: '#ffff00' }
            };

            this.data = types[type] || types['mine'];
        }

        update(game) {
            // Produce resources
            if (game.gameTime % 60 === 0) {
                switch (this.data.production) {
                    case 'rocks':
                        game.resources.rocks += this.data.rate * this.level;
                        break;
                    case 'credits':
                        game.resources.credits += this.data.rate * this.level;
                        break;
                    case 'research':
                        if (game.currentResearch) {
                            game.researchProgress += this.data.rate * this.level;
                        }
                        break;
                    case 'energy':
                        game.resources.fuel += this.data.rate * this.level;
                        break;
                }
            }

            // Defense turrets attack nearby enemies
            if (this.data.production === 'defense' && game.gameTime % 90 === 0) {
                const nearbyEnemy = this.findNearestEnemy(game);
                if (nearbyEnemy) {
                    game.shootProjectile(this, nearbyEnemy, 'friendly');
                }
            }
        }

        findNearestEnemy(game) {
            let nearest = null;
            let minDist = 150; // Turret range

            game.enemies.forEach(enemy => {
                const dist = Math.sqrt((this.x - enemy.x) ** 2 + (this.y - enemy.y) ** 2);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = enemy;
                }
            });

            return nearest;
        }

        upgrade(game) {
            const cost = this.level * 100;
            if (game.resources.credits >= cost) {
                game.resources.credits -= cost;
                this.level++;
                this.maxHealth += 50;
                this.health = this.maxHealth;
                game.log(`${this.data.name} upgraded to level ${this.level}!`, 'success');
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);

            // Building base
            ctx.fillStyle = this.data.color;
            ctx.fillRect(-15, -15, 30, 30);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(-15, -15, 30, 30);

            // Level indicator
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.level, 0, 5);

            // Health bar
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(-15, -22, 30, 4);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(-15, -22, 30 * (this.health / this.maxHealth), 4);

            ctx.restore();
        }
    }

    // ==================== DAY/NIGHT CYCLE ====================
    class DayNightCycle {
        constructor() {
            this.time = 0; // 0-1440 (24 hours in game time)
            this.speed = 1;
        }

        update() {
            this.time = (this.time + this.speed) % 1440;
        }

        getPhase() {
            if (this.time < 360) return 'night';
            if (this.time < 480) return 'dawn';
            if (this.time < 960) return 'day';
            if (this.time < 1080) return 'dusk';
            return 'night';
        }

        getLightLevel() {
            const hour = this.time / 60;

            if (hour < 6) return 0.3; // Night
            if (hour < 8) return 0.5 + (hour - 6) * 0.25; // Dawn
            if (hour < 16) return 1.0; // Day
            if (hour < 18) return 1.0 - (hour - 16) * 0.35; // Dusk
            return 0.3; // Night
        }

        applyLighting(ctx, canvas) {
            const lightLevel = this.getLightLevel();
            const darkness = 1 - lightLevel;

            ctx.save();
            ctx.fillStyle = `rgba(0, 0, 30, ${darkness * 0.6})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }

        draw(ctx) {
            // Time indicator
            ctx.save();
            const hour = Math.floor(this.time / 60);
            const minute = Math.floor(this.time % 60);
            const phase = this.getPhase();

            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(10, 560, 100, 30);
            ctx.strokeStyle = '#ffaa00';
            ctx.strokeRect(10, 560, 100, 30);

            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`, 20, 575);
            ctx.fillText(phase.toUpperCase(), 20, 585);

            ctx.restore();
        }
    }

    // ==================== GAME MODES ====================
    class GameModeManager {
        constructor() {
            this.currentMode = 'normal';
            this.modes = {
                normal: {
                    name: 'Normal Mode',
                    description: 'Standard gameplay',
                    modifiers: {}
                },
                hardcore: {
                    name: 'Hardcore Mode',
                    description: 'Permadeath, higher difficulty',
                    modifiers: { enemyDamage: 2, resourceRate: 0.5, noRespawn: true }
                },
                creative: {
                    name: 'Creative Mode',
                    description: 'Unlimited resources, no enemies',
                    modifiers: { unlimitedResources: true, noEnemies: true }
                },
                speedrun: {
                    name: 'Speedrun Mode',
                    description: 'Race against time!',
                    modifiers: { timeLimit: 3600, bonusSpeed: 2 }
                },
                survival: {
                    name: 'Survival Mode',
                    description: 'Extreme survival challenge',
                    modifiers: { hungerRate: 3, damageRate: 2, limitedResources: true }
                }
            };
        }

        setMode(mode, game) {
            if (!this.modes[mode]) return;

            this.currentMode = mode;
            const modeData = this.modes[mode];

            game.log(`Game mode: ${modeData.name}`, 'info');
            game.log(modeData.description, 'info');

            // Apply modifiers
            this.applyModifiers(modeData.modifiers, game);
        }

        applyModifiers(modifiers, game) {
            if (modifiers.enemyDamage) {
                game.enemyDamageMultiplier = modifiers.enemyDamage;
            }
            if (modifiers.resourceRate) {
                game.resourceMultiplier = modifiers.resourceRate;
            }
            if (modifiers.unlimitedResources) {
                game.cheatMode = true;
            }
            if (modifiers.noEnemies) {
                game.enemies = [];
                game.spawnEnemies = false;
            }
            if (modifiers.bonusSpeed) {
                game.player.speed *= modifiers.bonusSpeed;
            }
        }
    }

    // ==================== STATISTICS SCREEN ====================
    class StatisticsManager {
        constructor(game) {
            this.game = game;
        }

        getStatistics() {
            return {
                'Time Played': `${Math.floor(this.game.stats.timePlayed / 60)}s`,
                'Rocks Mined': this.game.stats.rocksMinedTotal,
                'Enemies Defeated': this.game.stats.enemiesDefeated,
                'Distance Traveled': Math.floor(this.game.stats.distanceTraveled),
                'Credits Earned': this.game.stats.creditsEarned,
                'Territories Owned': this.game.territories.length,
                'Joshes Recruited': this.game.joshes.length,
                'Ships Built': this.game.ships.length,
                'Technologies Researched': Object.values(this.game.technologies).filter(t => t.researched).length,
                'Achievements Unlocked': this.game.achievements.filter(a => a.unlocked).length,
                'Items Crafted': this.game.craftedItems.length
            };
        }

        draw(ctx, x, y) {
            const stats = this.getStatistics();
            let yPos = y;

            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            ctx.fillRect(x, y - 20, 200, 300);
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y - 20, 200, 300);

            ctx.fillStyle = '#ffaa00';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('STATISTICS', x + 10, y);

            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            yPos += 25;

            Object.entries(stats).forEach(([key, value]) => {
                ctx.fillText(`${key}:`, x + 10, yPos);
                ctx.fillStyle = '#00ff88';
                ctx.fillText(value.toString(), x + 130, yPos);
                ctx.fillStyle = '#ffffff';
                yPos += 20;
            });

            ctx.restore();
        }
    }

    // ==================== INITIALIZE ADVANCED FEATURES ====================
    Game.prototype.initAdvancedFeatures = function() {
        this.tutorial = new TutorialManager(this);
        this.weather = new WeatherSystem();
        this.skillTree = new SkillTree();
        this.dayNightCycle = new DayNightCycle();
        this.gameModeManager = new GameModeManager();
        this.statsManager = new StatisticsManager(this);
        this.buildings = [];

        console.log('✨ Advanced features initialized!');
    };

    // Add building placement
    Game.prototype.placeBuilding = function(type) {
        const costs = {
            mine: 200,
            refinery: 300,
            barracks: 250,
            lab: 400,
            defense: 350,
            solar: 150
        };

        const cost = costs[type];
        if (this.resources.credits >= cost) {
            this.resources.credits -= cost;
            const building = new Building(
                this.player.position.x + 50,
                this.player.position.y + 50,
                type
            );
            this.buildings.push(building);
            this.log(`Built ${building.data.name}!`, 'success');
        } else {
            this.log('Not enough credits to build!', 'warning');
        }
    };

    // Hook into game loop
    const originalUpdate = Game.prototype.update;
    Game.prototype.update = function() {
        if (originalUpdate) {
            originalUpdate.call(this);
        }

        if (this.tutorial) this.tutorial.update();
        if (this.weather) this.weather.update(this);
        if (this.dayNightCycle) this.dayNightCycle.update();

        if (this.buildings) {
            this.buildings.forEach(b => b.update(this));
        }

        // Health regeneration from skills
        if (this.healthRegen && this.gameTime % 60 === 0) {
            this.player.health = Math.min(this.player.maxHealth, this.player.health + this.healthRegen);
        }

        // Earn skill points periodically
        if (this.skillTree && this.gameTime % 500 === 0) {
            this.skillTree.earnSkillPoint(this);
        }
    };

    const originalRender = Game.prototype.render;
    Game.prototype.render = function() {
        if (originalRender) {
            originalRender.call(this);
        }

        if (this.weather) this.weather.draw(this.ctx);
        if (this.buildings) {
            this.buildings.forEach(b => b.draw(this.ctx));
        }
        if (this.dayNightCycle) {
            this.dayNightCycle.applyLighting(this.ctx, this.canvas);
            this.dayNightCycle.draw(this.ctx);
        }
        if (this.tutorial) this.tutorial.draw(this.ctx);
    };

    // Auto-initialize
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (typeof game !== 'undefined' && game.initAdvancedFeatures) {
                game.initAdvancedFeatures();
                console.log('🎮 Advanced AAA Features loaded!');
                console.log('⭐ Tutorial, Weather, Skills, Buildings, Day/Night, Game Modes!');
            }
        }, 1500);
    });

})();

console.log('🚀 Advanced Features module loaded!');

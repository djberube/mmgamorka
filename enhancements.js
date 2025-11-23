// Space Cats: Mining for Josh - AAA Enhancements
// Particle Effects, Boss Battles, Quests, Sound System, and More!

// Extend the Game class with additional features
(function() {
    if (typeof Game === 'undefined') {
        console.error('Game class not found! Load game.js first.');
        return;
    }

    // Store original constructor
    const OriginalGame = Game;
    const originalUpdate = Game.prototype.update;
    const originalRender = Game.prototype.render;
    const originalConstructor = Game.prototype.constructor;

    // ==================== PARTICLE SYSTEM ====================
    class Particle {
        constructor(x, y, vx, vy, color, life, size = 3) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.color = color;
            this.life = life;
            this.maxLife = life;
            this.size = size;
            this.alpha = 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.1; // Gravity
            this.life--;
            this.alpha = this.life / this.maxLife;
            return this.life > 0;
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Add particles array to game
    Game.prototype.initParticles = function() {
        this.particles = [];
    };

    Game.prototype.createExplosion = function(x, y, color = '#ff6600') {
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            const speed = 2 + Math.random() * 3;
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                30 + Math.random() * 20,
                2 + Math.random() * 3
            ));
        }
    };

    Game.prototype.createMiningParticles = function(x, y) {
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 2;
            this.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                ['#888888', '#cc6600', '#4444ff', '#00ffff'][Math.floor(Math.random() * 4)],
                20 + Math.random() * 15,
                1 + Math.random() * 2
            ));
        }
    };

    Game.prototype.updateParticles = function() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            if (!this.particles[i].update()) {
                this.particles.splice(i, 1);
            }
        }
    };

    Game.prototype.drawParticles = function() {
        this.particles.forEach(p => p.draw(this.ctx));
    };

    // ==================== SOUND SYSTEM ====================
    class SoundSystem {
        constructor() {
            this.audioContext = null;
            this.sounds = {};
            this.enabled = true;
            this.masterVolume = 0.3;
            this.initAudioContext();
        }

        initAudioContext() {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.log('Web Audio API not supported');
                this.enabled = false;
            }
        }

        playTone(frequency, duration, type = 'sine') {
            if (!this.enabled || !this.audioContext) return;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            gainNode.gain.setValueAtTime(this.masterVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        }

        playMiningSound() {
            this.playTone(200 + Math.random() * 100, 0.1, 'square');
        }

        playExplosionSound() {
            this.playTone(50, 0.3, 'sawtooth');
        }

        playCollectSound() {
            this.playTone(600, 0.1, 'sine');
            setTimeout(() => this.playTone(800, 0.1, 'sine'), 50);
        }

        playLaserSound() {
            this.playTone(1000, 0.1, 'square');
            setTimeout(() => this.playTone(800, 0.1, 'square'), 50);
        }

        playAchievementSound() {
            this.playTone(523, 0.15);
            setTimeout(() => this.playTone(659, 0.15), 150);
            setTimeout(() => this.playTone(784, 0.3), 300);
        }

        playBossMusic() {
            // Epic boss battle sound
            const notes = [262, 294, 330, 349, 392];
            notes.forEach((freq, i) => {
                setTimeout(() => this.playTone(freq, 0.2, 'triangle'), i * 200);
            });
        }
    }

    Game.prototype.initSound = function() {
        this.sound = new SoundSystem();
    };

    // ==================== BOSS BATTLES ====================
    class Boss {
        constructor(x, y, type) {
            this.x = x;
            this.y = y;
            this.type = type;
            this.health = 500;
            this.maxHealth = 500;
            this.damage = 30;
            this.phase = 1;
            this.attackTimer = 0;
            this.movePattern = 0;
            this.size = 50;

            // Boss types
            const types = {
                'space_kraken': { name: 'Space Kraken', color: '#8b00ff', abilities: ['tentacles', 'ink_cloud'] },
                'mega_dog': { name: 'Mega Dog Emperor', color: '#ff0000', abilities: ['bark_wave', 'fetch'] },
                'robot_overlord': { name: 'Robot Overlord', color: '#00ffff', abilities: ['laser_grid', 'shield'] }
            };

            this.data = types[type] || types['space_kraken'];
        }

        update(game) {
            this.attackTimer++;

            // Movement pattern
            this.movePattern += 0.02;
            this.x += Math.cos(this.movePattern) * 2;
            this.y += Math.sin(this.movePattern) * 2;

            // Keep in bounds
            this.x = Math.max(50, Math.min(550, this.x));
            this.y = Math.max(50, Math.min(550, this.y));

            // Phase transition
            if (this.health < this.maxHealth * 0.5 && this.phase === 1) {
                this.phase = 2;
                this.damage *= 1.5;
                game.log('Boss entered phase 2!', 'warning');
            }

            // Special attacks
            if (this.attackTimer % 120 === 0) {
                this.specialAttack(game);
            }

            // Regular attacks
            if (this.attackTimer % 60 === 0) {
                this.attack(game);
            }
        }

        attack(game) {
            // Shoot projectiles at player
            const dx = game.player.position.x - this.x;
            const dy = game.player.position.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            for (let i = 0; i < this.phase; i++) {
                game.projectiles.push({
                    x: this.x,
                    y: this.y,
                    vx: (dx / dist) * 5 + (Math.random() - 0.5),
                    vy: (dy / dist) * 5 + (Math.random() - 0.5),
                    owner: 'enemy',
                    damage: this.damage
                });
            }

            game.sound.playLaserSound();
        }

        specialAttack(game) {
            if (this.data.abilities.includes('tentacles')) {
                // Spawn mini enemies
                for (let i = 0; i < 3; i++) {
                    game.spawnEnemy();
                }
                game.log('Boss summoned minions!', 'danger');
            } else if (this.data.abilities.includes('laser_grid')) {
                // Create laser grid
                for (let i = 0; i < 5; i++) {
                    game.projectiles.push({
                        x: 100 + i * 100,
                        y: 0,
                        vx: 0,
                        vy: 3,
                        owner: 'enemy',
                        damage: this.damage
                    });
                }
            }
        }

        draw(ctx) {
            // Boss body
            ctx.save();
            ctx.translate(this.x, this.y);

            // Glow effect
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.data.color;

            // Draw boss based on type
            if (this.type === 'space_kraken') {
                // Tentacles
                for (let i = 0; i < 8; i++) {
                    const angle = (Math.PI * 2 * i) / 8 + this.movePattern;
                    const length = 30 + Math.sin(this.attackTimer * 0.05 + i) * 10;
                    ctx.strokeStyle = this.data.color;
                    ctx.lineWidth = 5;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
                    ctx.stroke();
                }

                // Body
                ctx.fillStyle = this.data.color;
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.type === 'mega_dog') {
                // Dog shape
                ctx.fillStyle = this.data.color;
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();

                // Eyes
                ctx.fillStyle = '#ffff00';
                ctx.beginPath();
                ctx.arc(-15, -10, 8, 0, Math.PI * 2);
                ctx.arc(15, -10, 8, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Robot
                ctx.fillStyle = this.data.color;
                ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);

                // Lights
                ctx.fillStyle = '#ff0000';
                for (let i = 0; i < 4; i++) {
                    ctx.beginPath();
                    ctx.arc(-20 + i * 15, -20, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            ctx.restore();

            // Health bar
            ctx.fillStyle = '#000';
            ctx.fillRect(this.x - 60, this.y - 70, 120, 10);
            ctx.fillStyle = this.phase === 2 ? '#ff0000' : '#00ff00';
            ctx.fillRect(this.x - 60, this.y - 70, 120 * (this.health / this.maxHealth), 10);

            // Name
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.data.name, this.x, this.y - 80);
        }
    }

    Game.prototype.spawnBoss = function(type) {
        this.boss = new Boss(300, 100, type);
        this.log(`WARNING: ${this.boss.data.name} has appeared!`, 'danger');
        this.sound.playBossMusic();
        this.createExplosion(300, 100, '#ff00ff');
    };

    // ==================== QUEST SYSTEM ====================
    class Quest {
        constructor(id, title, description, objectives, rewards) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.objectives = objectives; // Array of {type, target, current}
            this.rewards = rewards;
            this.completed = false;
            this.active = true;
        }

        checkProgress(game) {
            let allComplete = true;

            this.objectives.forEach(obj => {
                switch (obj.type) {
                    case 'mine_rocks':
                        obj.current = game.stats.rocksMinedTotal;
                        break;
                    case 'defeat_enemies':
                        obj.current = game.stats.enemiesDefeated;
                        break;
                    case 'recruit_joshes':
                        obj.current = game.joshes.length;
                        break;
                    case 'expand_territory':
                        obj.current = game.territories.length;
                        break;
                    case 'research_tech':
                        obj.current = Object.values(game.technologies).filter(t => t.researched).length;
                        break;
                    case 'craft_items':
                        obj.current = game.craftedItems.length;
                        break;
                }

                if (obj.current < obj.target) {
                    allComplete = false;
                }
            });

            if (allComplete && !this.completed) {
                this.complete(game);
            }
        }

        complete(game) {
            this.completed = true;
            this.active = false;

            // Grant rewards
            if (this.rewards.credits) game.resources.credits += this.rewards.credits;
            if (this.rewards.experience) game.player.experience = (game.player.experience || 0) + this.rewards.experience;
            if (this.rewards.unlock) {
                // Unlock special features
            }

            game.log(`Quest completed: ${this.title}! Rewards claimed!`, 'success');
            game.sound.playAchievementSound();
        }

        getProgress() {
            return this.objectives.map(obj =>
                `${obj.description}: ${obj.current}/${obj.target}`
            ).join('\n');
        }
    }

    Game.prototype.initQuests = function() {
        this.quests = [
            new Quest('starter', 'Welcome to Space!', 'Complete basic tasks',
                [
                    { type: 'mine_rocks', target: 50, current: 0, description: 'Mine 50 rocks' },
                    { type: 'recruit_joshes', target: 3, current: 0, description: 'Recruit 3 Joshes' }
                ],
                { credits: 200, experience: 100 }
            ),
            new Quest('builder', 'Empire Builder', 'Expand your territory',
                [
                    { type: 'expand_territory', target: 5, current: 0, description: 'Own 5 territories' },
                    { type: 'research_tech', target: 3, current: 0, description: 'Research 3 technologies' }
                ],
                { credits: 500, experience: 250 }
            ),
            new Quest('warrior', 'Space Warrior', 'Prove your combat skills',
                [
                    { type: 'defeat_enemies', target: 25, current: 0, description: 'Defeat 25 enemies' }
                ],
                { credits: 400, experience: 300, unlock: 'special_weapon' }
            ),
            new Quest('craftsman', 'Master Crafter', 'Craft advanced items',
                [
                    { type: 'craft_items', target: 5, current: 0, description: 'Craft 5 items' }
                ],
                { credits: 300, experience: 200 }
            )
        ];
    };

    Game.prototype.updateQuests = function() {
        this.quests.forEach(quest => {
            if (quest.active && !quest.completed) {
                quest.checkProgress(this);
            }
        });
    };

    // ==================== UPGRADE SYSTEM ====================
    Game.prototype.initUpgrades = function() {
        this.upgrades = {
            speed: { level: 0, cost: 100, max: 10, bonus: 0.5 },
            health: { level: 0, cost: 150, max: 10, bonus: 20 },
            damage: { level: 0, cost: 200, max: 10, bonus: 5 },
            mining: { level: 0, cost: 100, max: 10, bonus: 1 },
            income: { level: 0, cost: 250, max: 10, bonus: 10 }
        };
    };

    Game.prototype.purchaseUpgrade = function(type) {
        const upgrade = this.upgrades[type];
        if (!upgrade) return;

        if (upgrade.level < upgrade.max && this.resources.credits >= upgrade.cost) {
            this.resources.credits -= upgrade.cost;
            upgrade.level++;
            upgrade.cost = Math.floor(upgrade.cost * 1.5);

            // Apply upgrade
            switch (type) {
                case 'speed':
                    this.player.speed += upgrade.bonus;
                    break;
                case 'health':
                    this.player.maxHealth += upgrade.bonus;
                    this.player.health = this.player.maxHealth;
                    break;
                case 'damage':
                    this.baseDamage = (this.baseDamage || 10) + upgrade.bonus;
                    break;
                case 'mining':
                    this.miningBonus = (this.miningBonus || 1) + upgrade.bonus;
                    break;
                case 'income':
                    this.incomeBonus = (this.incomeBonus || 1) + upgrade.bonus;
                    break;
            }

            this.log(`Upgraded ${type} to level ${upgrade.level}!`, 'success');
            this.sound.playCollectSound();
        } else {
            this.log('Cannot upgrade!', 'warning');
        }
    };

    // ==================== POWER-UPS ====================
    class PowerUp {
        constructor(x, y, type) {
            this.x = x;
            this.y = y;
            this.type = type;
            this.lifetime = 300;
            this.collected = false;

            const types = {
                'health': { color: '#ff0000', effect: 'restore_health' },
                'shield': { color: '#0088ff', effect: 'temporary_shield' },
                'speed': { color: '#ffff00', effect: 'speed_boost' },
                'damage': { color: '#ff6600', effect: 'damage_boost' },
                'credits': { color: '#ffd700', effect: 'bonus_credits' }
            };

            this.data = types[type] || types['health'];
        }

        update() {
            this.lifetime--;
            this.y += Math.sin(this.lifetime * 0.1) * 0.5;
            return this.lifetime > 0;
        }

        draw(ctx) {
            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.data.color;
            ctx.fillStyle = this.data.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        collect(game) {
            if (this.collected) return;
            this.collected = true;

            switch (this.data.effect) {
                case 'restore_health':
                    game.player.health = Math.min(game.player.maxHealth, game.player.health + 30);
                    game.log('Health restored!', 'success');
                    break;
                case 'temporary_shield':
                    game.player.shield = (game.player.shield || 0) + 50;
                    game.log('Shield activated!', 'success');
                    break;
                case 'speed_boost':
                    game.player.speedBoost = 200;
                    game.log('Speed boost!', 'success');
                    break;
                case 'damage_boost':
                    game.player.damageBoost = 200;
                    game.log('Damage boost!', 'success');
                    break;
                case 'bonus_credits':
                    game.resources.credits += 100;
                    game.log('+100 credits!', 'success');
                    break;
            }

            game.sound.playCollectSound();
            game.createExplosion(this.x, this.y, this.data.color);
        }
    }

    Game.prototype.initPowerUps = function() {
        this.powerUps = [];
    };

    Game.prototype.spawnPowerUp = function(x, y, type) {
        const types = ['health', 'shield', 'speed', 'damage', 'credits'];
        const powerUpType = type || types[Math.floor(Math.random() * types.length)];
        this.powerUps.push(new PowerUp(x, y, powerUpType));
    };

    Game.prototype.updatePowerUps = function() {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];

            if (!powerUp.update()) {
                this.powerUps.splice(i, 1);
                continue;
            }

            // Check collection
            const dist = Math.sqrt(
                (this.player.position.x - powerUp.x) ** 2 +
                (this.player.position.y - powerUp.y) ** 2
            );

            if (dist < 20) {
                powerUp.collect(this);
                this.powerUps.splice(i, 1);
            }
        }

        // Decay temporary boosts
        if (this.player.speedBoost > 0) {
            this.player.speedBoost--;
            if (this.player.speedBoost === 0) {
                this.log('Speed boost expired', 'info');
            }
        }
        if (this.player.damageBoost > 0) {
            this.player.damageBoost--;
        }
        if (this.player.shield > 0) {
            this.player.shield = Math.max(0, this.player.shield - 0.1);
        }
    };

    Game.prototype.drawPowerUps = function() {
        this.powerUps.forEach(p => p.draw(this.ctx));
    };

    // ==================== EXTENDED GAME METHODS ====================

    // Override constructor to add new features
    const originalInit = Game.prototype.constructor;
    Game.prototype.initEnhancements = function() {
        this.initParticles();
        this.initSound();
        this.initQuests();
        this.initUpgrades();
        this.initPowerUps();

        this.boss = null;
        this.bossSpawnTimer = 0;

        // Tutorial state
        this.tutorialStep = 0;
        this.showTutorial = true;
    };

    // Enhance update loop
    const originalUpdateFunc = Game.prototype.update;
    Game.prototype.updateEnhanced = function() {
        if (originalUpdateFunc) {
            originalUpdateFunc.call(this);
        }

        // Update particles
        if (this.particles) {
            this.updateParticles();
        }

        // Update boss
        if (this.boss) {
            this.boss.update(this);

            // Check if boss defeated
            if (this.boss.health <= 0) {
                this.log(`${this.boss.data.name} defeated!`, 'success');
                this.resources.credits += 1000;
                this.createExplosion(this.boss.x, this.boss.y, '#ff00ff');
                this.sound.playExplosionSound();

                // Drop power-ups
                for (let i = 0; i < 5; i++) {
                    this.spawnPowerUp(
                        this.boss.x + (Math.random() - 0.5) * 50,
                        this.boss.y + (Math.random() - 0.5) * 50
                    );
                }

                this.boss = null;
            }
        }

        // Boss spawn timer
        this.bossSpawnTimer++;
        if (this.bossSpawnTimer >= 2000 && !this.boss && Math.random() < 0.01) {
            const bossTypes = ['space_kraken', 'mega_dog', 'robot_overlord'];
            this.spawnBoss(bossTypes[Math.floor(Math.random() * bossTypes.length)]);
            this.bossSpawnTimer = 0;
        }

        // Update quests
        if (this.quests) {
            this.updateQuests();
        }

        // Update power-ups
        if (this.powerUps) {
            this.updatePowerUps();
        }

        // Random power-up spawns
        if (Math.random() < 0.001) {
            this.spawnPowerUp(
                100 + Math.random() * 400,
                100 + Math.random() * 400
            );
        }
    };

    // Enhance render loop
    const originalRenderFunc = Game.prototype.render;
    Game.prototype.renderEnhanced = function() {
        if (originalRenderFunc) {
            originalRenderFunc.call(this);
        }

        // Draw particles
        if (this.particles) {
            this.drawParticles();
        }

        // Draw boss
        if (this.boss) {
            this.boss.draw(this.ctx);
        }

        // Draw power-ups
        if (this.powerUps) {
            this.drawPowerUps();
        }

        // Draw player shield
        if (this.player.shield > 0) {
            this.ctx.strokeStyle = 'rgba(0, 136, 255, ' + (this.player.shield / 50) + ')';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(this.player.position.x, this.player.position.y, 20, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Draw active quest notification
        if (this.quests) {
            const activeQuest = this.quests.find(q => q.active && !q.completed);
            if (activeQuest) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(10, 10, 250, 80);
                this.ctx.strokeStyle = '#00ff88';
                this.ctx.strokeRect(10, 10, 250, 80);

                this.ctx.fillStyle = '#ffaa00';
                this.ctx.font = 'bold 14px Arial';
                this.ctx.textAlign = 'left';
                this.ctx.fillText(activeQuest.title, 20, 30);

                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '11px Arial';
                const progress = activeQuest.getProgress().split('\n');
                progress.forEach((line, i) => {
                    this.ctx.fillText(line, 20, 50 + i * 15);
                });
            }
        }
    };

    // Override mine rock to add effects
    const originalMineRock = Game.prototype.mineRock;
    Game.prototype.mineRock = function(rock, index) {
        if (this.particles && this.sound) {
            this.createMiningParticles(rock.x, rock.y);
            this.sound.playMiningSound();
        }

        // Apply mining bonus
        const bonus = this.miningBonus || 1;
        rock.value = Math.floor(rock.value * bonus);

        if (originalMineRock) {
            originalMineRock.call(this, rock, index);
        }
    };

    // Override enemy defeat
    const originalUpdateEnemies = Game.prototype.updateEnemies;
    Game.prototype.updateEnemies = function() {
        const enemyCountBefore = this.enemies.length;

        if (originalUpdateEnemies) {
            originalUpdateEnemies.call(this);
        }

        // Check for defeated enemies and create effects
        if (this.enemies.length < enemyCountBefore && this.particles && this.sound) {
            this.sound.playExplosionSound();

            // Chance to drop power-up
            if (Math.random() < 0.2) {
                const lastEnemy = this.enemies[this.enemies.length - 1] || { x: 300, y: 300 };
                this.spawnPowerUp(lastEnemy.x, lastEnemy.y);
            }
        }
    };

    // Initialize enhancements when game starts
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (typeof game !== 'undefined' && game.initEnhancements) {
                game.initEnhancements();

                // Replace update and render
                game.update = game.updateEnhanced;
                game.render = game.renderEnhanced;

                console.log('🎮 AAA Enhancements loaded!');
                console.log('✨ Features: Particles, Sound, Bosses, Quests, Power-ups, Upgrades');
            }
        }, 1000);
    });

})();

console.log('🚀 Space Cats AAA Enhancements module loaded!');

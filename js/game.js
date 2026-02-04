// Main game class

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 600;

        // Disable image smoothing for pixel art
        this.ctx.imageSmoothingEnabled = false;

        // Game state
        this.state = 'loading';  // loading, charselect, start, playing, paused, gameover, levelcomplete, win
        this.score = 0;
        this.debug = false;

        // Lives system
        this.lives = 3;
        this.maxLives = 3;

        // Level progression
        this.currentLevelIndex = 0;
        this.levelNames = LEVEL_ORDER;

        // Character selection
        this.selectedCharacter = 'rainbow';
        this.characterOptions = ['rainbow', 'pink', 'white'];
        this.characterIndex = 0;

        // Level select (for testing)
        this.selectedLevelIndex = 0;

        // Timing
        this.lastTime = 0;
        this.deltaTime = 0;

        // Level complete timing
        this.levelCompleteTimer = 0;
        this.levelCompleteDelay = 2.5;

        // Camera
        this.cameraX = 0;
        this.cameraY = 0;
        this.cameraSmoothing = 0.1;

        // Special ability (Rainbow Blast)
        this.specialKills = 0;
        this.specialKillsRequired = 10;
        this.specialReady = false;

        // Floor clear bonus
        this.floorClearBonusGiven = false;

        // Boss intro sequence
        this.bossIntroTimer = 0;
        this.bossIntroDuration = 5;
        this.bossIntroActive = false;
        this.bossIntroTriggered = false;
        this.introBoss = null;

        // Game objects
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.powerUps = [];  // Power-up pickups in level
        this.gems = [];      // Destructible gems for Pyromancer fight
        this.level = null;

        // UI elements
        this.startScreen = document.getElementById('start-screen');
        this.startButton = document.getElementById('start-button');

        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.startGame = this.startGame.bind(this);
    }

    async init() {
        // Initialize systems
        Input.init(this.canvas);
        UI.init();
        SoundManager.init();

        // Load projectile sprites
        await Projectile.loadSprites();

        // Set up start button
        if (this.startButton) {
            this.startButton.addEventListener('click', () => this.showCharacterSelect());
        }

        // Load first level
        this.level = createLevel(this.levelNames[0]);

        // Create and load player
        this.player = new Player(
            this.level.playerStart.x,
            this.level.playerStart.y
        );
        await this.player.loadAnimations(this.selectedCharacter);

        // Spawn enemies
        await this.spawnEnemies();

        // Hide loading screen, show start screen
        UI.hideLoading();
        this.state = 'start';

        // Start game loop (but game won't actually play until start is pressed)
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop);
    }

    showCharacterSelect() {
        // Hide start screen
        if (this.startScreen) {
            this.startScreen.classList.add('hidden');
        }

        this.state = 'charselect';

        // Resume audio context (requires user interaction)
        SoundManager.resume();
        SoundManager.play('select');

        // Focus canvas for input
        this.canvas.setAttribute('tabindex', '0');
        this.canvas.style.outline = 'none';
        this.canvas.focus();
    }

    async selectCharacter(direction) {
        this.characterIndex += direction;
        if (this.characterIndex < 0) this.characterIndex = this.characterOptions.length - 1;
        if (this.characterIndex >= this.characterOptions.length) this.characterIndex = 0;
        this.selectedCharacter = this.characterOptions[this.characterIndex];

        SoundManager.play('select');

        // Reload player animations with new character
        await this.player.loadAnimations(this.selectedCharacter);
    }

    async startGame() {
        // Reset game state for new game
        this.lives = this.maxLives;
        this.score = 0;
        this.currentLevelIndex = this.selectedLevelIndex;  // Start at selected level
        this.specialKills = 0;
        this.specialReady = false;

        // Reset Milestone 3 systems
        GameStats.reset();
        PowerUpManager.clear();
        ParticleSystem.clear();
        FloatingText.clear();

        // Load selected level
        await this.loadLevel(this.levelNames[this.currentLevelIndex]);

        // Start playing
        this.state = 'playing';

        // Re-initialize input to ensure events are captured
        Input.reset();

        console.log('Game started! Use WASD to move, mouse to attack.');
    }

    selectLevel(direction) {
        this.selectedLevelIndex += direction;
        if (this.selectedLevelIndex < 0) this.selectedLevelIndex = this.levelNames.length - 1;
        if (this.selectedLevelIndex >= this.levelNames.length) this.selectedLevelIndex = 0;
        SoundManager.play('select');
    }

    async loadLevel(levelName) {
        this.state = 'loading';
        UI.showLoading();

        // Create level
        this.level = createLevel(levelName);

        // Reset player position
        this.player.reset(this.level.playerStart.x, this.level.playerStart.y);

        // Spawn enemies
        await this.spawnEnemies();

        // Clear projectiles and effects
        this.projectiles = [];
        this.powerUps = [];
        this.gems = [];
        ParticleSystem.clear();
        FloatingText.clear();

        // Spawn power-ups in level
        this.spawnPowerUps();

        // Spawn gems for pyromancer level
        this.spawnGems();

        // Reset camera
        this.cameraX = 0;
        this.cameraY = 0;

        // Reset boss intro state
        this.bossIntroActive = false;
        this.bossIntroTriggered = false;
        this.bossIntroTimer = 0;
        this.introBoss = null;

        // Reset floor clear bonus
        this.floorClearBonusGiven = false;

        // Villain chat bubbles for later levels
        const villainLines = {
            2: "Turn back, foolish horned horse!",
            3: "Muahahahahahahah!",
            4: "You dare enter MY labyrinth?!",
            5: "The dead shall feast on your soul!",
            6: "BURN IN ETERNAL FLAMES!"
        };
        const line = villainLines[this.currentLevelIndex];
        if (line) {
            FloatingText.addVillainBubble(line, 5);
        }

        UI.hideLoading();
    }

    async nextLevel() {
        this.currentLevelIndex++;

        if (this.currentLevelIndex >= this.levelNames.length) {
            // Game complete!
            this.state = 'win';

            // Save high score
            if (HighScoreManager.isHighScore(this.score)) {
                HighScoreManager.addScore(this.score);
            }

            // Victory particles
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    ParticleSystem.levelUp(
                        Math.random() * this.canvas.width,
                        Math.random() * this.canvas.height
                    );
                }, i * 200);
            }
            return;
        }

        await this.loadLevel(this.levelNames[this.currentLevelIndex]);
        this.state = 'playing';
    }

    async spawnEnemies() {
        this.enemies = [];

        for (const spawn of this.level.enemySpawns) {
            const enemy = createEnemy(spawn.type, spawn.x, spawn.y);
            await enemy.loadAnimations();
            this.enemies.push(enemy);
        }
    }

    spawnPowerUps() {
        // Spawn power-ups based on level configuration or randomly
        const powerUpTypes = ['speed', 'shield', 'rapidfire', 'damage', 'magnet'];

        // Check if level has defined power-up spawns
        if (this.level.powerUpSpawns) {
            for (const spawn of this.level.powerUpSpawns) {
                this.powerUps.push(new PowerUp(spawn.x, spawn.y, spawn.type));
            }
        } else {
            // Spawn random power-ups in level
            const numPowerUps = Math.min(2 + this.currentLevelIndex, 5);
            for (let i = 0; i < numPowerUps; i++) {
                // Find a platform to place power-up on
                const platform = this.level.platforms[Math.floor(Math.random() * this.level.platforms.length)];
                if (platform) {
                    const type = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
                    const x = platform.x + Math.random() * (platform.width - 32);
                    const y = platform.y - 48;
                    this.powerUps.push(new PowerUp(x, y, type));
                }
            }
        }
    }

    spawnGems() {
        // Spawn gems only for pyromancer level
        if (this.level.gemSpawns) {
            for (const spawn of this.level.gemSpawns) {
                this.gems.push(new Gem(spawn.x, spawn.y));
            }
        }
    }

    gameLoop(currentTime) {
        try {
            // Calculate delta time
            this.deltaTime = (currentTime - this.lastTime) / 1000;
            this.lastTime = currentTime;

            // Cap delta time to prevent huge jumps
            if (this.deltaTime > 0.1) {
                this.deltaTime = 0.1;
            }

            // Apply time scaling from effects (slow motion, freeze)
            const timeScale = ScreenEffects.getTimeScale();
            const scaledDeltaTime = this.deltaTime * timeScale;

            // Update screen effects with real time (not scaled)
            ScreenEffects.update(this.deltaTime);

            // Update
            this.update(scaledDeltaTime);

            // Draw
            this.draw();

            // Clear input state
            Input.update();
        } catch (e) {
            console.error('Game loop error:', e);
        }

        // Continue loop (always, even if there was an error)
        requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime = this.deltaTime) {
        // Handle character select screen
        if (this.state === 'charselect') {
            this.updateCharacterSelect();
            return;
        }

        // Don't update game logic during start screen
        if (this.state === 'start' || this.state === 'loading') {
            return;
        }

        // Handle level complete transition
        if (this.state === 'levelcomplete') {
            this.levelCompleteTimer += this.deltaTime;  // Use real time for transition
            ParticleSystem.update(deltaTime);
            if (this.levelCompleteTimer >= this.levelCompleteDelay) {
                this.levelCompleteTimer = 0;
                this.nextLevel();
            }
            return;
        }

        // Handle boss intro sequence
        if (this.state === 'bossintro') {
            this.bossIntroTimer += this.deltaTime;
            ParticleSystem.update(deltaTime);
            FloatingText.update(deltaTime);

            // Slowly float boss down
            if (this.introBoss && this.introBoss.y < this.introBossTargetY) {
                this.introBoss.y += 60 * this.deltaTime; // Slow descent
                if (this.introBoss.y >= this.introBossTargetY) {
                    this.introBoss.y = this.introBossTargetY;
                }
            }

            // Demonic particles around boss during intro
            if (this.introBoss && Math.random() < 0.3) {
                ParticleSystem.fire(
                    this.introBoss.x + Math.random() * this.introBoss.width,
                    this.introBoss.y + Math.random() * this.introBoss.height
                );
            }

            // End intro after duration
            if (this.bossIntroTimer >= this.bossIntroDuration) {
                this.bossIntroActive = false;
                this.state = 'playing';
                ScreenEffects.shake(10, 0.3);
            }
            return;
        }

        // Handle win state
        if (this.state === 'win') {
            ParticleSystem.update(deltaTime);
            if (Input.restart) {
                this.showCharacterSelect();
            }
            return;
        }

        // Handle pause
        if (Input.pause && this.state === 'playing') {
            this.state = 'paused';
            SoundManager.play('pause');
            return;
        } else if (Input.pause && this.state === 'paused') {
            this.state = 'playing';
            SoundManager.play('pause');
        }

        // Handle restart on game over
        if (this.state === 'gameover' && Input.restart) {
            this.restart();
            return;
        }

        // Toggle debug with F1
        if (Input.isJustPressed('F1')) {
            this.debug = !this.debug;
        }

        if (this.state !== 'playing') return;

        // Update game stats
        GameStats.update(deltaTime);

        // Update particles and floating text
        ParticleSystem.update(deltaTime);
        FloatingText.update(deltaTime);

        // Update power-up manager (timers for active power-ups)
        PowerUpManager.update(deltaTime, this.player);

        // Update power-up pickups
        for (const powerUp of this.powerUps) {
            powerUp.update(deltaTime);
        }

        // Update gems
        for (const gem of this.gems) {
            gem.update(deltaTime);
        }

        // Update level (moving platforms)
        this.level.update(deltaTime);

        // Update player
        this.player.update(deltaTime, this.level, this.projectiles);

        // Check for player death
        if (this.player.isDeathAnimationComplete()) {
            this.handlePlayerDeath();
            return;
        }

        // Update enemies
        for (const enemy of this.enemies) {
            enemy.update(deltaTime, this.level, this.player, this.projectiles);

            // Demon Lord spawns imp when hit
            if (enemy.spawnImpRequested) {
                enemy.spawnImpRequested = false;
                const side = Math.random() > 0.5 ? 1 : -1;
                const impX = enemy.x + enemy.width / 2 + side * 100;
                const impY = enemy.y;
                const imp = createEnemy('imp', impX, impY);
                imp.loadAnimations().then(() => {});
                this.enemies.push(imp);
                ParticleSystem.fire(impX + 64, impY + 24);
                FloatingText.addBossAbility('SUMMON IMP!', '#ff6600');
            }

            // Headless Horseman spawns skeletons
            if (enemy.spawnSkeletonRequested) {
                enemy.spawnSkeletonRequested = false;
                // Spawn 2 skeletons on either side
                for (let i = 0; i < 2; i++) {
                    const side = i === 0 ? -1 : 1;
                    const skelX = enemy.x + enemy.width / 2 + side * 120;
                    const skelY = enemy.y + enemy.height - 80;
                    const skeleton = createEnemy('skeleton', skelX, skelY);
                    skeleton.loadAnimations().then(() => {});
                    this.enemies.push(skeleton);
                    ParticleSystem.magic(skelX + 32, skelY + 32);
                }
                SoundManager.play('enemyDeath');  // Spooky summon sound
                FloatingText.addBossAbility('ANIMATE DEAD!', '#88ff88');
            }
        }

        // Update projectiles
        for (const projectile of this.projectiles) {
            projectile.update(deltaTime);
        }

        // Check collisions
        this.handleCollisions();

        // Check pickup collection
        this.checkPickups();

        // Check power-up collection
        this.checkPowerUpCollection();

        // Check level completion
        this.checkLevelComplete();

        // Rainbow Blast special ability (Q key)
        if (Input.special && this.specialReady) {
            this.activateRainbowBlast();
        }

        // Remove dead enemies and give score
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (enemy.markedForRemoval) {
                this.score += enemy.scoreValue;
                GameStats.enemiesKilled++;

                // Track kills for special ability charge
                this.specialKills++;
                if (this.specialKills >= this.specialKillsRequired) {
                    this.specialReady = true;
                }

                // Spawn particles on enemy death
                const centerX = enemy.x + enemy.width / 2;
                const centerY = enemy.y + enemy.height / 2;
                ParticleSystem.explosion(centerX, centerY);
                SoundManager.play('enemyDeath');

                if (enemy.isBoss) {
                    ScreenEffects.onBossDeath();
                    ParticleSystem.confetti(this.canvas.width / 2, this.canvas.height / 2);
                    // Rainbow "BOSS DEFEATED" text
                    FloatingText.texts.push({
                        text: 'BOSS DEFEATED',
                        x: 400,
                        y: 250,
                        startY: 250,
                        color: '#ff0000',
                        life: 4.0,
                        maxLife: 4.0,
                        alpha: 1,
                        centered: true,
                        large: true,
                        worldSpace: false,
                        rainbow: true
                    });
                } else {
                    ScreenEffects.onEnemyDeath();
                }

                this.enemies.splice(i, 1);
            }
        }

        // Floor clear bonus is now awarded when completing the level instead

        // Remove dead projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            if (proj.markedForRemoval ||
                proj.isOffScreen(this.canvas.width, this.canvas.height, this.cameraX, this.cameraY)) {
                this.projectiles.splice(i, 1);
            }
        }

        // Update camera
        this.updateCamera();

        // Update UI
        UI.updateHealth(this.player.health, this.player.maxHealth);
        UI.updateScore(this.score);
        UI.updateLives(this.lives);
        UI.updateLevel(this.currentLevelIndex + 1, this.level.name);
    }

    updateCharacterSelect() {
        // Handle left/right input for character selection
        if (Input.isJustPressed('KeyA') || Input.isJustPressed('ArrowLeft')) {
            this.selectCharacter(-1);
        }
        if (Input.isJustPressed('KeyD') || Input.isJustPressed('ArrowRight')) {
            this.selectCharacter(1);
        }

        // Handle up/down input for level selection
        if (Input.isJustPressed('KeyW') || Input.isJustPressed('ArrowUp')) {
            this.selectLevel(-1);
        }
        if (Input.isJustPressed('KeyS') || Input.isJustPressed('ArrowDown')) {
            this.selectLevel(1);
        }

        // Start game on Enter or Space
        if (Input.isJustPressed('Enter') || Input.isJustPressed('Space')) {
            this.startGame();
        }
    }

    handlePlayerDeath() {
        this.lives--;

        if (this.lives <= 0) {
            this.state = 'gameover';
            UI.showGameOver();
            SoundManager.play('gameOver');

            // Check and save high score
            if (HighScoreManager.isHighScore(this.score)) {
                HighScoreManager.addScore(this.score);
            }
        } else {
            // Respawn at level start
            this.player.reset(this.level.playerStart.x, this.level.playerStart.y);
            this.projectiles = [];

            // Clear active power-ups on death
            PowerUpManager.clear();
        }
    }

    checkPickups() {
        const playerHitbox = this.player.getHitbox();

        for (const pickup of this.level.pickups) {
            if (pickup.collected) continue;

            // Simple collision with pickup
            const pickupBounds = {
                x: pickup.x - 16,
                y: pickup.y - 16,
                width: 32,
                height: 32
            };

            if (this.rectIntersect(playerHitbox, pickupBounds)) {
                pickup.collected = true;
                GameStats.pickupsCollected++;

                // Particle effect
                ParticleSystem.sparkle(pickup.x, pickup.y);
                SoundManager.play('pickup');

                if (pickup.type === 'heart') {
                    this.player.heal(2);
                    FloatingText.add('+1 HEALTH', pickup.x, pickup.y - 20, '#ff6b6b', 1.5);
                } else if (pickup.type === 'star') {
                    this.score += 500;
                    FloatingText.add('+500', pickup.x, pickup.y - 20, '#ffd700', 1.5);
                } else if (pickup.type === 'crystal') {
                    this.score += 1000;
                    // Crystal also grants temporary invincibility
                    this.player.invincible = true;
                    this.player.invincibleTimer = 3;
                    this.player.flickerTimer = 0;
                    ParticleSystem.levelUp(pickup.x, pickup.y);
                    FloatingText.add('+1000 INVINCIBLE!', pickup.x, pickup.y - 20, '#00ffff', 2);
                }
            }
        }
    }

    checkPowerUpCollection() {
        const playerHitbox = this.player.getHitbox();

        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            if (powerUp.collected) continue;

            const powerUpBounds = powerUp.getBounds();

            // Magnet effect: attract power-ups to player
            if (this.player.magnetActive) {
                const dx = (playerHitbox.x + playerHitbox.width / 2) - (powerUp.x + powerUp.width / 2);
                const dy = (playerHitbox.y + playerHitbox.height / 2) - (powerUp.y + powerUp.height / 2);
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200 && dist > 0) {
                    powerUp.x += (dx / dist) * 200 * this.deltaTime;
                    powerUp.y += (dy / dist) * 200 * this.deltaTime;
                }
            }

            if (this.rectIntersect(playerHitbox, powerUpBounds)) {
                powerUp.collected = true;
                GameStats.powerUpsUsed++;

                // Apply power-up effect
                PowerUpManager.apply(this.player, powerUp.type, powerUp.duration);

                // Effects
                ParticleSystem.magic(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
                SoundManager.play('powerup');
                ScreenEffects.onPowerUp();

                // Show power-up description
                FloatingText.addPowerUpText(powerUp.type);

                // Remove from array
                this.powerUps.splice(i, 1);
            }
        }
    }

    checkLevelComplete() {
        if (!this.level.levelEnd) return;

        const playerHitbox = this.player.getHitbox();
        const endZone = this.level.levelEnd;

        // Check if all required enemies (bosses) are defeated
        const bossAlive = this.enemies.some(e => e.isBoss && !e.isDead);
        if (this.level.isBossLevel && bossAlive) return;

        // Boss intro trigger: when player passes midpoint on a hasBossIntro level
        if (this.level.hasBossIntro && !this.bossIntroTriggered) {
            const midpoint = this.level.width / 2;
            if (this.player.x >= midpoint) {
                this.bossIntroTriggered = true;
                this.bossIntroActive = true;
                this.bossIntroTimer = 0;
                this.state = 'bossintro';

                // Spawn the boss using level data
                const bossType = this.level.bossType || 'demon_lord';
                const bossX = this.player.x;
                const boss = createEnemy(bossType, bossX, -200);
                boss.loadAnimations().then(() => {});
                this.enemies.push(boss);
                this.introBoss = boss;
                this.introBossTargetY = 100;  // Where the boss floats down to

                ScreenEffects.flash('#440022', 0.3);
                ScreenEffects.shake(6, 0.5);
            }
            return;
        }

        if (this.rectIntersect(playerHitbox, endZone)) {
            this.state = 'levelcomplete';
            this.levelCompleteTimer = 0;

            // Bonus score for completing level
            this.score += 1000;

            // Award permanent heart for completing the level
            this.player.maxHealth += 2;  // +1 heart (2 HP)
            this.player.health = Math.min(this.player.health + 2, this.player.maxHealth);
            FloatingText.add('+1 HEART', this.player.x + this.player.width / 2, this.player.y - 20, '#ff69b4', 2.5);
            ParticleSystem.sparkle(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);

            // Effects
            SoundManager.play('levelComplete');
            ScreenEffects.onLevelComplete();
            ParticleSystem.levelUp(this.player.x + this.player.width / 2, this.player.y);
        }
    }

    activateRainbowBlast() {
        this.specialReady = false;
        this.specialKills = 0;

        // Big rainbow burst from the player
        const playerCX = this.player.x + this.player.width / 2;
        const playerCY = this.player.y + this.player.height / 2;
        ParticleSystem.rainbowWave(playerCX, playerCY);

        // Kill all non-boss enemies, stun bosses
        for (const enemy of this.enemies) {
            if (enemy.isDead) continue;
            const cx = enemy.x + enemy.width / 2;
            const cy = enemy.y + enemy.height / 2;
            ParticleSystem.rainbowBlast(cx, cy);
            if (enemy.isBoss) {
                enemy.stun(3);  // Stun bosses for 3 seconds
            } else {
                enemy.takeDamage(enemy.health);
            }
        }

        // Screen effects
        ScreenEffects.onRainbowBlast();
        SoundManager.play('powerup');

        // Floating text
        FloatingText.texts.push({
            text: 'RAINBOW BLAST!',
            subtext: '',
            x: 400,
            y: 200,
            startY: 200,
            color: '#ff69b4',
            life: 2.0,
            maxLife: 2.0,
            alpha: 1,
            centered: true,
            large: true,
            worldSpace: false
        });
    }

    rectIntersect(r1, r2) {
        return r1.x < r2.x + r2.width &&
               r1.x + r1.width > r2.x &&
               r1.y < r2.y + r2.height &&
               r1.y + r1.height > r2.y;
    }

    handleCollisions() {
        // Player vs enemies (contact damage)
        Collision.checkPlayerEnemyCollisions(this.player, this.enemies);

        // Player melee vs enemies
        Collision.checkPlayerMeleeCollisions(this.player, this.enemies);

        // Player projectiles vs enemies
        Collision.checkProjectileEnemyCollisions(this.projectiles, this.enemies);

        // Enemy projectiles vs player
        Collision.checkProjectilePlayerCollisions(this.projectiles, this.player);

        // Projectiles vs platforms (including moving platforms)
        Collision.checkProjectilePlatformCollisions(this.projectiles, this.level.getAllPlatforms());

        // Player vs hazards (spike plants)
        this.checkHazardCollisions();

        // Player attacks vs gems
        this.checkGemCollisions();
    }

    checkHazardCollisions() {
        if (this.player.isDead || this.player.invincible) return;

        const playerHitbox = this.player.getHitbox();

        for (const hazard of this.level.hazards) {
            if (this.rectIntersect(playerHitbox, hazard)) {
                this.player.takeDamage(hazard.damage || 1);
                SoundManager.play('hurt');
                ScreenEffects.onPlayerHit();
                ParticleSystem.blood(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
                break;  // Only take one hazard hit per frame
            }
        }
    }

    checkGemCollisions() {
        if (this.gems.length === 0) return;

        // Check player melee vs gems
        if (this.player.isMeleeActive()) {
            const meleeHitbox = this.player.getMeleeHitbox();
            for (const gem of this.gems) {
                if (gem.destroyed || gem.isHurt) continue;
                if (this.rectIntersect(meleeHitbox, gem.getBounds())) {
                    gem.takeDamage(this.player.meleeDamage);
                    if (gem.destroyed) {
                        this.score += 500;
                    }
                }
            }
        }

        // Check player projectiles vs gems
        for (const projectile of this.projectiles) {
            if (projectile.owner !== 'player') continue;
            const projBounds = projectile.getBounds();
            for (const gem of this.gems) {
                if (gem.destroyed) continue;
                if (this.rectIntersect(projBounds, gem.getBounds())) {
                    gem.takeDamage(projectile.damage);
                    projectile.markedForRemoval = true;
                    if (gem.destroyed) {
                        this.score += 500;
                    }
                    break;
                }
            }
        }

        // Check if all gems destroyed - notify Pyromancer boss
        const allGemsDestroyed = this.gems.length > 0 && this.gems.every(gem => gem.destroyed);
        if (allGemsDestroyed) {
            for (const enemy of this.enemies) {
                if (enemy.type === 'pyromancer' && !enemy.gemsDestroyed) {
                    enemy.gemsDestroyed = true;
                }
            }
        }
    }

    updateCamera() {
        // Target position (center on player)
        const targetX = this.player.x + this.player.width / 2 - this.canvas.width / 2;
        const targetY = this.player.y + this.player.height / 2 - this.canvas.height / 2;

        // Smooth camera movement
        this.cameraX += (targetX - this.cameraX) * this.cameraSmoothing;
        this.cameraY += (targetY - this.cameraY) * this.cameraSmoothing;

        // Clamp camera to level bounds
        this.cameraX = Utils.clamp(this.cameraX, 0, this.level.width - this.canvas.width);
        this.cameraY = Utils.clamp(this.cameraY, 0, this.level.height - this.canvas.height);

        // Apply screen shake offset
        const shakeOffset = ScreenEffects.getCameraOffset();
        this.cameraX += shakeOffset.x;
        this.cameraY += shakeOffset.y;
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // During start screen, draw a preview of the level
        if (this.state === 'start' || this.state === 'loading') {
            // Draw level as background preview
            this.level.draw(this.ctx, 0, 0, this.canvas.width, this.canvas.height);

            // Darken it
            this.ctx.fillStyle = 'rgba(26, 26, 46, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }

        // Character select screen
        if (this.state === 'charselect') {
            this.drawCharacterSelect();
            return;
        }

        // Win screen
        if (this.state === 'win') {
            this.drawWinScreen();
            return;
        }

        // Draw level
        this.level.draw(this.ctx, this.cameraX, this.cameraY, this.canvas.width, this.canvas.height);

        // Draw power-up pickups
        for (const powerUp of this.powerUps) {
            powerUp.draw(this.ctx, this.cameraX, this.cameraY);
        }

        // Draw gems
        for (const gem of this.gems) {
            gem.draw(this.ctx, this.cameraX, this.cameraY);
        }

        // Draw projectiles
        for (const projectile of this.projectiles) {
            projectile.draw(this.ctx, this.cameraX, this.cameraY);
        }

        // Draw particles (behind enemies/player)
        ParticleSystem.draw(this.ctx, this.cameraX, this.cameraY);

        // Draw enemies
        for (const enemy of this.enemies) {
            enemy.draw(this.ctx, this.cameraX, this.cameraY);
        }

        // Draw player
        this.player.draw(this.ctx, this.cameraX, this.cameraY);

        // Draw flash effect (screen overlay)
        ScreenEffects.drawFlash(this.ctx, this.canvas.width, this.canvas.height);

        // Draw UI
        UI.draw(this.ctx, this);

        // Draw power-up indicators
        PowerUpManager.draw(this.ctx);

        // Draw floating text (power-up descriptions, etc.)
        FloatingText.draw(this.ctx, this.cameraX, this.cameraY);

        // Draw debug hitboxes
        if (this.debug) {
            UI.drawHitboxes(this.ctx, this, this.cameraX, this.cameraY);
        }

        // Draw pause overlay
        if (this.state === 'paused') {
            this.drawPauseScreen();
        }

        // Draw level complete overlay
        if (this.state === 'levelcomplete') {
            this.drawLevelComplete();
        }

        // Draw boss intro overlay
        if (this.state === 'bossintro') {
            this.drawBossIntro();
        }
    }

    drawCharacterSelect() {
        // Background
        this.level.draw(this.ctx, 0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'rgba(26, 26, 46, 0.85)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Title
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 42px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SELECT YOUR UNICORN', this.canvas.width / 2, 70);

        // Draw character preview
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2 - 80;

        // Draw arrows for character
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '36px sans-serif';
        this.ctx.fillText('<', centerX - 120, centerY + 20);
        this.ctx.fillText('>', centerX + 120, centerY + 20);

        // Draw current character (use player sprite)
        this.player.x = centerX - this.player.width / 2;
        this.player.y = centerY - this.player.height / 2;
        this.player.playAnimation('idle');
        this.player.draw(this.ctx, 0, 0);

        // Character name
        const names = {
            'rainbow': 'Rainbow Unicorn',
            'pink': 'Pink Unicorn',
            'white': 'White Unicorn'
        };
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '24px sans-serif';
        this.ctx.fillText(names[this.selectedCharacter], centerX, centerY + 80);

        // Level select section
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 28px sans-serif';
        this.ctx.fillText('SELECT LEVEL', centerX, centerY + 140);

        // Level name with arrows
        const levelData = LEVELS[this.levelNames[this.selectedLevelIndex]];
        const levelDisplayName = `${this.selectedLevelIndex + 1}. ${levelData.name}`;

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '36px sans-serif';
        this.ctx.fillText('▲', centerX, centerY + 165);

        this.ctx.font = '22px sans-serif';
        this.ctx.fillStyle = levelData.isBossLevel ? '#FF6666' : '#AAFFAA';
        this.ctx.fillText(levelDisplayName, centerX, centerY + 195);

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '36px sans-serif';
        this.ctx.fillText('▼', centerX, centerY + 225);

        // Instructions
        this.ctx.fillStyle = '#AAAAAA';
        this.ctx.font = '16px sans-serif';
        this.ctx.fillText('A/D or ←/→: Choose Character', centerX, this.canvas.height - 70);
        this.ctx.fillText('W/S or ↑/↓: Choose Level', centerX, this.canvas.height - 48);
        this.ctx.fillText('Press ENTER or SPACE to start', centerX, this.canvas.height - 26);

        this.ctx.textAlign = 'left';
    }

    drawPauseScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '48px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = '16px sans-serif';
        this.ctx.fillText('Press ESC to continue', this.canvas.width / 2, this.canvas.height / 2 + 40);
        this.ctx.textAlign = 'left';
    }

    drawBossIntro() {
        const time = Date.now() / 1000;

        // Get boss info from level data
        const bossName = this.level.bossName || 'BOSS';
        const bossSubtitle = this.level.bossSubtitle || '';

        // Theme-based colors
        const theme = this.level.theme || 'demon_throne';
        let overlayColor, edgeColor, nameColor, subColor;
        if (theme === 'labyrinth') {
            overlayColor = 'rgba(5, 5, 10, 0.5)';
            edgeColor = [80, 60, 20];
            nameColor = '#dd8844';
            subColor = '#ccaa88';
        } else if (theme === 'graveyard') {
            overlayColor = 'rgba(5, 5, 15, 0.5)';
            edgeColor = [40, 80, 60];
            nameColor = '#44dd88';
            subColor = '#88ddaa';
        } else if (theme === 'volcanic') {
            overlayColor = 'rgba(15, 5, 0, 0.5)';
            edgeColor = [150, 60, 0];
            nameColor = '#ff6600';
            subColor = '#ffaa44';
        } else {
            overlayColor = 'rgba(10, 0, 5, 0.5)';
            edgeColor = [100, 0, 20];
            nameColor = '#ff2244';
            subColor = '#ffaaaa';
        }

        // Dark overlay
        this.ctx.fillStyle = overlayColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Pulsing edges
        const pulse = Math.sin(time * 3) * 0.15 + 0.15;
        const edgeGrad = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 200,
            this.canvas.width / 2, this.canvas.height / 2, 500
        );
        edgeGrad.addColorStop(0, `rgba(${edgeColor[0]}, ${edgeColor[1]}, ${edgeColor[2]}, 0)`);
        edgeGrad.addColorStop(1, `rgba(${edgeColor[0]}, ${edgeColor[1]}, ${edgeColor[2]}, ${pulse})`);
        this.ctx.fillStyle = edgeGrad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Boss name text
        this.ctx.textAlign = 'center';
        if (this.bossIntroTimer > 1) {
            const textAlpha = Math.min(1, (this.bossIntroTimer - 1) / 0.5);
            this.ctx.save();
            this.ctx.globalAlpha = textAlpha;
            this.ctx.font = 'bold 48px sans-serif';
            this.ctx.fillStyle = nameColor;
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 4;
            this.ctx.strokeText(bossName, this.canvas.width / 2, this.canvas.height / 2 + 100);
            this.ctx.fillText(bossName, this.canvas.width / 2, this.canvas.height / 2 + 100);

            if (this.bossIntroTimer > 2.5 && bossSubtitle) {
                const subAlpha = Math.min(1, (this.bossIntroTimer - 2.5) / 0.5);
                this.ctx.globalAlpha = subAlpha * (0.7 + Math.sin(time * 4) * 0.3);
                this.ctx.font = '20px sans-serif';
                this.ctx.fillStyle = subColor;
                this.ctx.fillText(bossSubtitle, this.canvas.width / 2, this.canvas.height / 2 + 140);
            }
            this.ctx.restore();
        }

        this.ctx.textAlign = 'left';
    }

    drawLevelComplete() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 48px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('LEVEL COMPLETE!', this.canvas.width / 2, this.canvas.height / 2 - 20);

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '24px sans-serif';
        this.ctx.fillText(`${this.level.name}`, this.canvas.width / 2, this.canvas.height / 2 + 30);
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 70);

        this.ctx.textAlign = 'left';
    }

    drawWinScreen() {
        // Celebratory background
        const time = Date.now() / 1000;
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a0a30');
        gradient.addColorStop(0.5, '#2a1050');
        gradient.addColorStop(1, '#1a0a30');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Animated stars
        this.ctx.fillStyle = '#FFD700';
        for (let i = 0; i < 20; i++) {
            const x = (Math.sin(time + i * 0.5) * 0.5 + 0.5) * this.canvas.width;
            const y = (i * 30 + time * 50) % this.canvas.height;
            const size = 2 + Math.sin(time * 2 + i) * 2;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Draw particles
        ParticleSystem.draw(this.ctx, 0, 0);

        // Title
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 64px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('VICTORY!', this.canvas.width / 2, 120);

        // Subtitle
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '32px sans-serif';
        this.ctx.fillText('You defeated all the bosses!', this.canvas.width / 2, 180);

        // Final score
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 48px sans-serif';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, 270);

        // High score
        const highScore = HighScoreManager.getHighScore();
        this.ctx.fillStyle = '#FF69B4';
        this.ctx.font = '24px sans-serif';
        this.ctx.fillText(`High Score: ${highScore}`, this.canvas.width / 2, 310);

        // Stats
        this.ctx.fillStyle = '#AAAAFF';
        this.ctx.font = '20px sans-serif';
        this.ctx.fillText(`Lives Remaining: ${this.lives}`, this.canvas.width / 2, 360);
        this.ctx.fillText(`Enemies Defeated: ${GameStats.enemiesKilled}`, this.canvas.width / 2, 390);
        this.ctx.fillText(`Time: ${Math.floor(GameStats.timePlayed / 60)}m ${Math.floor(GameStats.timePlayed % 60)}s`, this.canvas.width / 2, 420);

        // Play again
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '20px sans-serif';
        const pulse = Math.sin(time * 3) * 0.3 + 0.7;
        this.ctx.globalAlpha = pulse;
        this.ctx.fillText('Press SPACE to play again', this.canvas.width / 2, 500);
        this.ctx.globalAlpha = 1;

        this.ctx.textAlign = 'left';
    }

    async restart() {
        // Reset game state
        this.state = 'loading';
        this.score = 0;
        this.lives = this.maxLives;
        this.currentLevelIndex = 0;
        this.specialKills = 0;
        this.specialReady = false;
        UI.hideGameOver();
        UI.showLoading();

        // Reset Milestone 3 systems
        GameStats.reset();
        PowerUpManager.clear();
        ParticleSystem.clear();
        FloatingText.clear();

        // Load first level
        await this.loadLevel(this.levelNames[0]);

        // Resume
        UI.hideLoading();
        this.state = 'playing';
    }
}

// Start game when page loads
window.addEventListener('load', async () => {
    const game = new Game();
    await game.init();

    // Make game accessible for debugging
    window.game = game;
});

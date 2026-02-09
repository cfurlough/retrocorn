// UI system

const UI = {
    healthDisplay: null,
    scoreDisplay: null,
    livesDisplay: null,
    levelDisplay: null,
    gameOverScreen: null,
    loadingScreen: null,
    startScreen: null,

    init() {
        this.healthDisplay = document.getElementById('health-display');
        this.scoreDisplay = document.getElementById('score-display');
        this.livesDisplay = document.getElementById('lives-display');
        this.levelDisplay = document.getElementById('level-display');
        this.gameOverScreen = document.getElementById('game-over');
        this.loadingScreen = document.getElementById('loading');
        this.startScreen = document.getElementById('start-screen');

        // Create lives display if it doesn't exist
        if (!this.livesDisplay) {
            this.livesDisplay = document.createElement('div');
            this.livesDisplay.id = 'lives-display';
            document.getElementById('ui-overlay').appendChild(this.livesDisplay);
        }

        // Create level display if it doesn't exist
        if (!this.levelDisplay) {
            this.levelDisplay = document.createElement('div');
            this.levelDisplay.id = 'level-display';
            document.getElementById('ui-overlay').appendChild(this.levelDisplay);
        }
    },

    showStartScreen() {
        if (this.startScreen) {
            this.startScreen.classList.remove('hidden');
        }
    },

    hideStartScreen() {
        if (this.startScreen) {
            this.startScreen.classList.add('hidden');
        }
    },

    updateHealth(health, maxHealth) {
        if (!this.healthDisplay) return;

        const hearts = Math.ceil(maxHealth / 2);
        let html = '';

        for (let i = 0; i < hearts; i++) {
            const heartHealth = health - (i * 2);

            if (heartHealth >= 2) {
                html += '<div class="heart full"></div>';
            } else if (heartHealth === 1) {
                html += '<div class="heart half"></div>';
            } else {
                html += '<div class="heart empty"></div>';
            }
        }

        this.healthDisplay.innerHTML = html;
    },

    updateScore(score) {
        if (!this.scoreDisplay) return;
        this.scoreDisplay.textContent = `Score: ${score}`;
    },

    updateLives(lives) {
        if (!this.livesDisplay) return;

        let html = 'Lives: ';
        for (let i = 0; i < lives; i++) {
            html += '<span class="life-icon">★</span>';
        }
        this.livesDisplay.innerHTML = html;
    },

    updateLevel(levelNumber, levelName) {
        if (!this.levelDisplay) return;
        this.levelDisplay.textContent = `Level ${levelNumber}: ${levelName}`;
    },

    showGameOver() {
        if (this.gameOverScreen) {
            this.gameOverScreen.classList.remove('hidden');
        }
    },

    hideGameOver() {
        if (this.gameOverScreen) {
            this.gameOverScreen.classList.add('hidden');
        }
    },

    showLoading() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.remove('hidden');
        }
    },

    hideLoading() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('hidden');
        }
    },

    // Draw in-game UI on canvas (for things that need to be on canvas)
    draw(ctx, game) {
        // Draw special ability bar
        if (game.state === 'playing') {
            this.drawSpecialBar(ctx, game);
        }

        // Draw debug info if enabled
        if (game.debug) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '12px monospace';
            ctx.fillText(`FPS: ${Math.round(1 / game.deltaTime)}`, 10, 580);
            ctx.fillText(`Enemies: ${game.enemies.length}`, 10, 560);
            ctx.fillText(`Projectiles: ${game.projectiles.length}`, 10, 540);
            ctx.fillText(`Player: ${Math.floor(game.player.x)}, ${Math.floor(game.player.y)}`, 10, 520);
        }
    },

    drawProtectionIndicator(ctx, game) {
        const timeLeft = Math.ceil(game.levelStartProtectionDuration - game.levelStartTimer);
        const pulse = 0.6 + Math.sin(Date.now() / 100) * 0.4;

        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#00ffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(`PROTECTED: ${timeLeft}`, 400, 120);
        ctx.fillText(`PROTECTED: ${timeLeft}`, 400, 120);
        ctx.restore();
    },

    drawSpecialBar(ctx, game) {
        const barX = 10;
        const barY = 70;
        const segWidth = 18;
        const segHeight = 12;
        const segGap = 3;
        const totalSegs = game.specialKillsRequired;
        const filledSegs = Math.min(game.specialKills, totalSegs);
        const ready = game.specialReady;
        const time = Date.now() / 1000;

        ctx.save();

        // "Q" label
        ctx.font = 'bold 14px sans-serif';
        ctx.fillStyle = ready ? '#ffffff' : '#888888';
        ctx.textAlign = 'left';
        ctx.fillText('Q', barX, barY + segHeight - 1);

        const segsStartX = barX + 18;

        // Background for all segments
        for (let i = 0; i < totalSegs; i++) {
            const sx = segsStartX + i * (segWidth + segGap);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(sx, barY, segWidth, segHeight);
        }

        // Rainbow colors for filled segments
        const rainbowColors = [
            '#ff0000', '#ff4400', '#ff8800', '#ffbb00', '#ffff00',
            '#88ff00', '#00ff44', '#00ccff', '#4488ff', '#8844ff'
        ];

        for (let i = 0; i < filledSegs; i++) {
            const sx = segsStartX + i * (segWidth + segGap);
            // Pulse when ready
            if (ready) {
                const pulse = 0.7 + Math.sin(time * 6 + i * 0.5) * 0.3;
                ctx.globalAlpha = pulse;
            }
            ctx.fillStyle = rainbowColors[i % rainbowColors.length];
            ctx.fillRect(sx + 1, barY + 1, segWidth - 2, segHeight - 2);
        }

        ctx.globalAlpha = 1;

        // Border for all segments
        for (let i = 0; i < totalSegs; i++) {
            const sx = segsStartX + i * (segWidth + segGap);
            ctx.strokeStyle = ready ? '#ffffff' : '#555555';
            ctx.lineWidth = 1;
            ctx.strokeRect(sx, barY, segWidth, segHeight);
        }

        // "READY!" text when charged
        if (ready) {
            const textX = segsStartX + totalSegs * (segWidth + segGap) + 6;
            const pulse = 0.6 + Math.sin(time * 5) * 0.4;
            ctx.globalAlpha = pulse;
            ctx.font = 'bold 12px sans-serif';
            ctx.fillStyle = '#ff69b4';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.strokeText('READY!', textX, barY + segHeight - 1);
            ctx.fillText('READY!', textX, barY + segHeight - 1);
            ctx.globalAlpha = 1;
        }

        ctx.restore();
    },

    // Draw hitboxes for debugging
    drawHitboxes(ctx, game, cameraX, cameraY) {
        if (!game.debug) return;

        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;

        // Player hitbox
        const playerHitbox = game.player.getHitbox();
        ctx.strokeRect(
            playerHitbox.x - cameraX,
            playerHitbox.y - cameraY,
            playerHitbox.width,
            playerHitbox.height
        );

        // Player melee hitbox
        if (game.player.isMeleeActive()) {
            ctx.strokeStyle = '#ff0000';
            const meleeHitbox = game.player.getMeleeHitbox();
            ctx.strokeRect(
                meleeHitbox.x - cameraX,
                meleeHitbox.y - cameraY,
                meleeHitbox.width,
                meleeHitbox.height
            );
        }

        // Enemy hitboxes
        ctx.strokeStyle = '#ff00ff';
        for (const enemy of game.enemies) {
            if (enemy.isDead) continue;
            const hitbox = enemy.getHitbox();
            ctx.strokeRect(
                hitbox.x - cameraX,
                hitbox.y - cameraY,
                hitbox.width,
                hitbox.height
            );
        }

        // Projectile hitboxes
        ctx.strokeStyle = '#ffff00';
        for (const proj of game.projectiles) {
            const bounds = proj.getBounds();
            ctx.strokeRect(
                bounds.x - cameraX,
                bounds.y - cameraY,
                bounds.width,
                bounds.height
            );
        }
    }
};

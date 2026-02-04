// Screen Effects - shake, flash, slowmo

const ScreenEffects = {
    // Screen shake
    shakeIntensity: 0,
    shakeDuration: 0,
    shakeOffsetX: 0,
    shakeOffsetY: 0,

    // Screen flash
    flashColor: null,
    flashAlpha: 0,
    flashDuration: 0,

    // Slow motion
    slowMoFactor: 1,
    slowMoDuration: 0,

    // Freeze frame
    freezeTime: 0,
    freezeCooldown: 0,  // Prevent freeze spam

    update(deltaTime) {
        // Update freeze cooldown
        if (this.freezeCooldown > 0) {
            this.freezeCooldown -= deltaTime;
        }
        // Update shake
        if (this.shakeDuration > 0) {
            this.shakeDuration -= deltaTime;
            this.shakeOffsetX = (Math.random() - 0.5) * 2 * this.shakeIntensity;
            this.shakeOffsetY = (Math.random() - 0.5) * 2 * this.shakeIntensity;
            // Decay intensity
            this.shakeIntensity *= 0.9;
        } else {
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
            this.shakeIntensity = 0;
        }

        // Update flash
        if (this.flashDuration > 0) {
            this.flashDuration -= deltaTime;
            this.flashAlpha = this.flashDuration / 0.1; // Fade out
        } else {
            this.flashAlpha = 0;
        }

        // Update slow motion
        if (this.slowMoDuration > 0) {
            this.slowMoDuration -= deltaTime;
        } else {
            this.slowMoFactor = 1;
        }

        // Update freeze
        if (this.freezeTime > 0) {
            this.freezeTime -= deltaTime;
        }
    },

    shake(intensity, duration = 0.3) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
        this.shakeDuration = Math.max(this.shakeDuration, duration);
    },

    flash(color = '#ffffff', duration = 0.1) {
        this.flashColor = color;
        this.flashAlpha = 1;
        this.flashDuration = duration;
    },

    slowMo(factor = 0.3, duration = 0.5) {
        this.slowMoFactor = factor;
        this.slowMoDuration = duration;
    },

    freeze(duration = 0.05) {
        // Prevent freeze spam - only allow freeze if cooldown expired
        if (this.freezeCooldown > 0) return;
        this.freezeTime = Math.min(duration, 0.1);  // Cap at 0.1s max
        this.freezeCooldown = 0.15;  // Minimum time between freezes
    },

    getTimeScale() {
        if (this.freezeTime > 0) return 0.1;  // Slow to 10% instead of near-zero
        return Math.max(0.1, this.slowMoFactor);  // Minimum 10% speed
    },

    drawFlash(ctx, width, height) {
        if (this.flashAlpha > 0 && this.flashColor) {
            ctx.save();
            ctx.globalAlpha = this.flashAlpha * 0.5;
            ctx.fillStyle = this.flashColor;
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
        }
    },

    getCameraOffset() {
        return {
            x: this.shakeOffsetX,
            y: this.shakeOffsetY
        };
    },

    // Preset effects
    onPlayerHit() {
        this.shake(8, 0.2);
        this.flash('#ff0000', 0.1);
        this.freeze(0.03);
    },

    onEnemyHit() {
        this.shake(3, 0.1);
        this.freeze(0.02);
    },

    onEnemyDeath() {
        this.shake(5, 0.15);
    },

    onBossHit() {
        this.shake(6, 0.15);
        this.freeze(0.04);
    },

    onBossDeath() {
        this.shake(10, 0.3);
        this.flash('#ffffff', 0.2);
        // No slow-mo to avoid potential timing issues
    },

    onLevelComplete() {
        this.flash('#ffffff', 0.15);
    },

    onPowerUp() {
        this.shake(4, 0.1);
        this.flash('#ffff00', 0.08);
    },

    onRainbowBlast() {
        this.shake(12, 0.4);
        this.flash('#ff88ff', 0.25);
        this.freeze(0.08);
    }
};

// High Score Manager
const HighScoreManager = {
    STORAGE_KEY: 'retrocorn_highscores',
    maxScores: 10,

    getScores() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    addScore(score, name = 'Player') {
        const scores = this.getScores();
        scores.push({
            score: score,
            name: name,
            date: new Date().toISOString()
        });

        // Sort by score descending
        scores.sort((a, b) => b.score - a.score);

        // Keep only top scores
        scores.splice(this.maxScores);

        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(scores));
        } catch (e) {
            console.warn('Could not save high score');
        }

        return scores;
    },

    isHighScore(score) {
        const scores = this.getScores();
        if (scores.length < this.maxScores) return true;
        return score > scores[scores.length - 1].score;
    },

    getHighScore() {
        const scores = this.getScores();
        return scores.length > 0 ? scores[0].score : 0;
    },

    clearScores() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
        } catch (e) {
            // Ignore
        }
    }
};

// Game Stats Tracker
const GameStats = {
    enemiesKilled: 0,
    damageDealt: 0,
    damageTaken: 0,
    pickupsCollected: 0,
    powerUpsUsed: 0,
    timePlayed: 0,

    reset() {
        this.enemiesKilled = 0;
        this.damageDealt = 0;
        this.damageTaken = 0;
        this.pickupsCollected = 0;
        this.powerUpsUsed = 0;
        this.timePlayed = 0;
    },

    update(deltaTime) {
        this.timePlayed += deltaTime;
    }
};

// Floating Text System - shows temporary messages on screen
const FloatingText = {
    texts: [],

    // Add text at world position (will move with camera)
    add(text, x, y, color = '#ffffff', duration = 2.5) {
        this.texts.push({
            text: text,
            x: x,
            y: y,
            startY: y,
            color: color,
            life: duration,
            maxLife: duration,
            alpha: 1,
            worldSpace: true  // Moves with camera
        });
    },

    // Add power-up description centered on screen
    addPowerUpText(type) {
        const descriptions = {
            speed: { text: 'SPEED BOOST!', desc: 'Move 50% faster', color: '#00ff00' },
            shield: { text: 'SHIELD!', desc: 'Blocks one hit', color: '#00aaff' },
            rapidfire: { text: 'RAPID FIRE!', desc: 'Shoot much faster', color: '#ff6600' },
            damage: { text: 'POWER UP!', desc: '2x damage dealt', color: '#ff0066' },
            magnet: { text: 'MAGNET!', desc: 'Attracts pickups', color: '#aa00ff' }
        };

        const info = descriptions[type] || { text: 'POWER UP!', desc: '', color: '#ffffff' };

        // Add main text (will be drawn centered on screen, not world space)
        this.texts.push({
            text: info.text,
            subtext: info.desc,
            x: 400,  // Center of 800px canvas
            y: 200,
            startY: 200,
            color: info.color,
            life: 2.0,
            maxLife: 2.0,
            alpha: 1,
            centered: true,
            large: true,
            worldSpace: false  // Fixed to screen
        });
    },

    update(deltaTime) {
        for (let i = this.texts.length - 1; i >= 0; i--) {
            const t = this.texts[i];
            t.life -= deltaTime;
            t.y = t.startY - (1 - t.life / t.maxLife) * 30;  // Float upward
            t.alpha = Math.min(1, t.life / 0.5);  // Fade out in last 0.5s

            if (t.life <= 0) {
                this.texts.splice(i, 1);
            }
        }
    },

    draw(ctx, cameraX = 0, cameraY = 0) {
        for (const t of this.texts) {
            ctx.save();
            ctx.globalAlpha = t.alpha;
            ctx.fillStyle = t.color;
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;

            // Calculate draw position
            let drawX = t.x;
            let drawY = t.y;
            if (t.worldSpace) {
                drawX -= cameraX;
                drawY -= cameraY;
            }

            if (t.large) {
                ctx.font = 'bold 36px sans-serif';
            } else {
                ctx.font = 'bold 18px sans-serif';
            }

            if (t.centered) {
                ctx.textAlign = 'center';

                if (t.rainbow) {
                    // Draw each letter in a different rainbow color
                    const rainbowColors = ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#0088ff', '#8800ff', '#ff00ff'];
                    const time = Date.now() / 1000;
                    const text = t.text;
                    // Measure full text to center it
                    const fullWidth = ctx.measureText(text).width;
                    let charX = drawX - fullWidth / 2;
                    ctx.textAlign = 'left';
                    for (let ci = 0; ci < text.length; ci++) {
                        const colorIdx = Math.floor((ci + time * 4) % rainbowColors.length);
                        ctx.fillStyle = rainbowColors[(colorIdx + rainbowColors.length) % rainbowColors.length];
                        ctx.strokeText(text[ci], charX, drawY);
                        ctx.fillText(text[ci], charX, drawY);
                        charX += ctx.measureText(text[ci]).width;
                    }
                } else {
                    // Draw with outline
                    ctx.strokeText(t.text, drawX, drawY);
                    ctx.fillText(t.text, drawX, drawY);
                }

                // Draw subtext if present
                if (t.subtext) {
                    ctx.font = '20px sans-serif';
                    ctx.fillStyle = '#ffffff';
                    ctx.textAlign = 'center';
                    ctx.strokeText(t.subtext, drawX, drawY + 30);
                    ctx.fillText(t.subtext, drawX, drawY + 30);
                }
            } else if (t.villainBubble) {
                // Dark speech bubble style
                ctx.font = 'bold 15px sans-serif';
                const metrics = ctx.measureText(t.text);
                const padX = 20;
                const padY = 14;
                const bw = metrics.width + padX * 2;
                const bh = 20 + padY * 2;
                const bx = drawX;
                const by = drawY - padY - 4;

                // Bubble background
                ctx.fillStyle = 'rgba(20, 5, 15, 0.9)';
                ctx.beginPath();
                ctx.roundRect(bx - bw - 8, by, bw, bh, 10);
                ctx.fill();
                ctx.strokeStyle = '#880033';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Bubble tail (triangle pointing down-right)
                ctx.fillStyle = 'rgba(20, 5, 15, 0.9)';
                ctx.beginPath();
                ctx.moveTo(bx - 12, by + bh);
                ctx.lineTo(bx + 4, by + bh + 10);
                ctx.lineTo(bx - 24, by + bh);
                ctx.closePath();
                ctx.fill();

                // Text centered in bubble
                ctx.textAlign = 'center';
                ctx.fillStyle = t.color;
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 3;
                const textX = bx - bw / 2 - 8;
                const textY = by + bh / 2 + 5;
                ctx.strokeText(t.text, textX, textY);
                ctx.fillText(t.text, textX, textY);
            } else {
                ctx.textAlign = 'center';  // Center pickup text too
                ctx.strokeText(t.text, drawX, drawY);
                ctx.fillText(t.text, drawX, drawY);
            }

            ctx.restore();
        }
    },

    // Villain speech bubble - dark bubble in upper right
    addVillainBubble(text, duration = 5) {
        this.texts.push({
            text: text,
            x: 590,   // Upper right area
            y: 60,
            startY: 60,
            color: '#ff4444',
            life: duration,
            maxLife: duration,
            alpha: 1,
            centered: false,
            large: false,
            worldSpace: false,
            villainBubble: true
        });
    },

    clear() {
        this.texts = [];
    },

    // Boss ability announcement - shows centered text briefly
    addBossAbility(text, color = '#ff4444') {
        this.texts.push({
            text: text,
            x: 400,  // Center of 800px canvas
            y: 150,
            startY: 150,
            color: color,
            life: 1.5,
            maxLife: 1.5,
            alpha: 1,
            centered: true,
            large: true,
            worldSpace: false
        });
    }
};

// Power-up System

// Destructible Gem - power source for Pyromancer boss
class Gem {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 48;
        this.height = 64;
        this.health = 2;
        this.maxHealth = 2;
        this.destroyed = false;
        this.isHurt = false;
        this.hurtTimer = 0;
        this.pulsePhase = Math.random() * Math.PI * 2;
    }

    takeDamage(amount) {
        if (this.destroyed) return;
        this.health -= amount;
        this.isHurt = true;
        this.hurtTimer = 0.2;
        SoundManager.play('hit');
        ParticleSystem.sparkle(this.x + this.width / 2, this.y + this.height / 2);

        if (this.health <= 0) {
            this.destroyed = true;
            SoundManager.play('explosion');
            ScreenEffects.shake(5, 0.15);
            // Create destruction particles
            for (let i = 0; i < 15; i++) {
                ParticleSystem.magic(
                    this.x + this.width / 2 + (Math.random() - 0.5) * 30,
                    this.y + this.height / 2 + (Math.random() - 0.5) * 40
                );
            }
            FloatingText.add('+500', this.x + this.width / 2, this.y, '#44ff44');
        }
    }

    update(deltaTime) {
        if (this.destroyed) return;
        this.pulsePhase += deltaTime * 3;
        if (this.isHurt) {
            this.hurtTimer -= deltaTime;
            if (this.hurtTimer <= 0) {
                this.isHurt = false;
            }
        }
    }

    draw(ctx, cameraX, cameraY) {
        if (this.destroyed) return;

        const x = this.x - cameraX;
        const y = this.y - cameraY;
        const centerX = x + this.width / 2;
        const centerY = y + this.height / 2;
        const pulse = 1 + Math.sin(this.pulsePhase) * 0.1;

        ctx.save();

        // Hurt flash
        if (this.isHurt) {
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.02) * 0.3;
        }

        // Glow effect
        ctx.globalAlpha = (ctx.globalAlpha || 1) * (0.4 + Math.sin(this.pulsePhase * 2) * 0.2);
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, this.width * pulse);
        gradient.addColorStop(0, '#44ff44');
        gradient.addColorStop(0.5, '#22aa22');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width * pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = this.isHurt ? 0.5 + Math.sin(Date.now() * 0.02) * 0.3 : 1;

        // Draw large gem shape
        const w = this.width * 0.8;
        const h = this.height * 0.9;

        // Gem body - hexagonal crystal shape
        ctx.fillStyle = '#22dd44';
        ctx.beginPath();
        ctx.moveTo(centerX, y + 4);  // Top point
        ctx.lineTo(centerX + w / 2, y + h * 0.25);  // Top right
        ctx.lineTo(centerX + w / 2, y + h * 0.7);   // Bottom right
        ctx.lineTo(centerX, y + h);                  // Bottom point
        ctx.lineTo(centerX - w / 2, y + h * 0.7);   // Bottom left
        ctx.lineTo(centerX - w / 2, y + h * 0.25);  // Top left
        ctx.closePath();
        ctx.fill();

        // Gem highlight - lighter green
        ctx.fillStyle = '#66ff88';
        ctx.beginPath();
        ctx.moveTo(centerX, y + 4);
        ctx.lineTo(centerX + w / 2, y + h * 0.25);
        ctx.lineTo(centerX + w * 0.2, y + h * 0.4);
        ctx.lineTo(centerX - w * 0.1, y + h * 0.3);
        ctx.closePath();
        ctx.fill();

        // Dark facet
        ctx.fillStyle = '#118833';
        ctx.beginPath();
        ctx.moveTo(centerX, y + h);
        ctx.lineTo(centerX + w / 2, y + h * 0.7);
        ctx.lineTo(centerX + w * 0.15, y + h * 0.5);
        ctx.lineTo(centerX - w * 0.15, y + h * 0.5);
        ctx.lineTo(centerX - w / 2, y + h * 0.7);
        ctx.closePath();
        ctx.fill();

        // Center shine
        ctx.fillStyle = '#aaffcc';
        ctx.beginPath();
        ctx.ellipse(centerX - 5, y + h * 0.35, 6, 10, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Small sparkle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX - 8, y + h * 0.28, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Health bar
        if (this.health < this.maxHealth) {
            const barWidth = 40;
            const barHeight = 6;
            const barX = centerX - barWidth / 2;
            const barY = y - 10;
            const healthRatio = this.health / this.maxHealth;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
            ctx.fillStyle = '#44ff44';
            ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);
        }
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 32;
        this.height = 32;
        this.collected = false;
        this.bobOffset = Math.random() * Math.PI * 2;

        // Set properties based on type
        this.setTypeProperties();
    }

    setTypeProperties() {
        switch (this.type) {
            case 'speed':
                this.color = '#00ff00';
                this.icon = 'lightning';
                this.duration = 8;
                break;
            case 'shield':
                this.color = '#00aaff';
                this.icon = 'shield';
                this.duration = 10;
                break;
            case 'rapidfire':
                this.color = '#ff6600';
                this.icon = 'fire';
                this.duration = 8;
                break;
            case 'damage':
                this.color = '#ff0066';
                this.icon = 'sword';
                this.duration = 10;
                break;
            case 'magnet':
                this.color = '#aa00ff';
                this.icon = 'magnet';
                this.duration = 15;
                break;
            default:
                this.color = '#ffffff';
                this.icon = 'star';
                this.duration = 5;
        }
    }

    update(deltaTime) {
        this.bobOffset += deltaTime * 3;
    }

    draw(ctx, cameraX, cameraY) {
        if (this.collected) return;

        const x = this.x - cameraX;
        const y = this.y - cameraY + Math.sin(this.bobOffset) * 5;
        const centerX = x + this.width / 2;
        const centerY = y + this.height / 2;

        // Glow effect
        ctx.save();
        ctx.globalAlpha = 0.4 + Math.sin(this.bobOffset * 2) * 0.2;
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, this.width);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Icon background
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 14, 0, Math.PI * 2);
        ctx.fill();

        // Icon
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;

        switch (this.icon) {
            case 'lightning':
                ctx.beginPath();
                ctx.moveTo(centerX + 2, centerY - 10);
                ctx.lineTo(centerX - 4, centerY + 2);
                ctx.lineTo(centerX + 1, centerY + 2);
                ctx.lineTo(centerX - 2, centerY + 10);
                ctx.lineTo(centerX + 4, centerY - 2);
                ctx.lineTo(centerX - 1, centerY - 2);
                ctx.closePath();
                ctx.fill();
                break;

            case 'shield':
                ctx.beginPath();
                ctx.moveTo(centerX, centerY - 10);
                ctx.lineTo(centerX + 8, centerY - 5);
                ctx.lineTo(centerX + 8, centerY + 2);
                ctx.quadraticCurveTo(centerX, centerY + 12, centerX, centerY + 12);
                ctx.quadraticCurveTo(centerX, centerY + 12, centerX - 8, centerY + 2);
                ctx.lineTo(centerX - 8, centerY - 5);
                ctx.closePath();
                ctx.fill();
                break;

            case 'fire':
                for (let i = 0; i < 3; i++) {
                    const offsetX = (i - 1) * 5;
                    const size = i === 1 ? 8 : 5;
                    ctx.beginPath();
                    ctx.ellipse(centerX + offsetX, centerY, size / 2, size, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;

            case 'sword':
                ctx.beginPath();
                ctx.moveTo(centerX, centerY - 10);
                ctx.lineTo(centerX + 3, centerY + 2);
                ctx.lineTo(centerX + 6, centerY + 4);
                ctx.lineTo(centerX + 3, centerY + 4);
                ctx.lineTo(centerX, centerY + 10);
                ctx.lineTo(centerX - 3, centerY + 4);
                ctx.lineTo(centerX - 6, centerY + 4);
                ctx.lineTo(centerX - 3, centerY + 2);
                ctx.closePath();
                ctx.fill();
                break;

            case 'magnet':
                ctx.beginPath();
                ctx.arc(centerX, centerY, 8, Math.PI, 0, false);
                ctx.lineTo(centerX + 8, centerY + 6);
                ctx.lineTo(centerX + 4, centerY + 6);
                ctx.lineTo(centerX + 4, centerY);
                ctx.arc(centerX, centerY, 4, 0, Math.PI, true);
                ctx.lineTo(centerX - 4, centerY + 6);
                ctx.lineTo(centerX - 8, centerY + 6);
                ctx.closePath();
                ctx.fill();
                break;

            default:
                // Star
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i * 4 * Math.PI / 5) - Math.PI / 2;
                    const px = centerX + Math.cos(angle) * 8;
                    const py = centerY + Math.sin(angle) * 8;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
        }
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// Player power-up state manager
const PowerUpManager = {
    activePowerUps: [],

    apply(player, type, duration) {
        // Remove existing power-up of same type
        this.activePowerUps = this.activePowerUps.filter(p => p.type !== type);

        // Store original values if not already stored
        if (!player.originalStats) {
            player.originalStats = {
                speed: player.speed,
                shootCooldownBase: 0.25,
                meleeDamage: player.meleeDamage
            };
        }

        // Apply power-up effect
        switch (type) {
            case 'speed':
                player.speed = player.originalStats.speed * 1.5;
                break;
            case 'shield':
                player.hasShield = true;
                break;
            case 'rapidfire':
                player.rapidFire = true;
                break;
            case 'damage':
                player.meleeDamage = player.originalStats.meleeDamage * 2;
                player.projectileDamage = 2;
                break;
            case 'magnet':
                player.magnetActive = true;
                break;
        }

        this.activePowerUps.push({
            type: type,
            timeRemaining: duration
        });
    },

    update(deltaTime, player) {
        for (let i = this.activePowerUps.length - 1; i >= 0; i--) {
            const powerUp = this.activePowerUps[i];
            powerUp.timeRemaining -= deltaTime;

            if (powerUp.timeRemaining <= 0) {
                this.remove(player, powerUp.type);
                this.activePowerUps.splice(i, 1);
            }
        }
    },

    remove(player, type) {
        if (!player.originalStats) return;

        switch (type) {
            case 'speed':
                player.speed = player.originalStats.speed;
                break;
            case 'shield':
                player.hasShield = false;
                break;
            case 'rapidfire':
                player.rapidFire = false;
                break;
            case 'damage':
                player.meleeDamage = player.originalStats.meleeDamage;
                player.projectileDamage = 1;
                break;
            case 'magnet':
                player.magnetActive = false;
                break;
        }
    },

    getActive() {
        return this.activePowerUps;
    },

    clear() {
        this.activePowerUps = [];
    },

    draw(ctx) {
        // Draw active power-up indicators in top-left
        let y = 70;
        for (const powerUp of this.activePowerUps) {
            ctx.fillStyle = this.getColor(powerUp.type);
            ctx.fillRect(10, y, 60, 8);

            // Remaining time bar
            const ratio = powerUp.timeRemaining / this.getDuration(powerUp.type);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(10, y, 60 * ratio, 8);

            // Border
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect(10, y, 60, 8);

            y += 12;
        }
    },

    getColor(type) {
        const colors = {
            speed: '#00ff00',
            shield: '#00aaff',
            rapidfire: '#ff6600',
            damage: '#ff0066',
            magnet: '#aa00ff'
        };
        return colors[type] || '#ffffff';
    },

    getDuration(type) {
        const durations = {
            speed: 8,
            shield: 10,
            rapidfire: 8,
            damage: 10,
            magnet: 15
        };
        return durations[type] || 5;
    }
};

// Projectile class with animated sprites

class Projectile {
    // Static sprite cache
    static sprites = {
        unicorn: [],
        loaded: false
    };

    static async loadSprites() {
        if (Projectile.sprites.loaded) return;

        // Load unicorn projectile frames
        for (let i = 0; i < 4; i++) {
            try {
                const img = await Utils.loadImage(`assets/effects/unicorn_projectile_${i}.png`);
                Projectile.sprites.unicorn.push(img);
            } catch (e) {
                console.warn(`Failed to load projectile sprite ${i}`);
            }
        }

        Projectile.sprites.loaded = true;
    }

    constructor(x, y, vx, vy, owner = 'player', type = 'magic') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.owner = owner;
        this.type = type;

        this.width = 24;
        this.height = 24;
        this.damage = 1;
        this.lifetime = 3;
        this.age = 0;
        this.markedForRemoval = false;
        this.rotation = 0;

        // Animation
        this.frameIndex = 0;
        this.frameTimer = 0;
        this.frameRate = 12;

        // Set visual properties based on type
        this.setTypeProperties();
        this.trailParticles = [];
    }

    setTypeProperties() {
        switch (this.type) {
            case 'bone':
                this.color = '#e8e0d0';
                this.glowColor = '#ffffff';
                this.width = 20;
                this.height = 12;
                break;
            case 'fireball':
                this.color = '#ff4400';
                this.glowColor = '#ffaa00';
                this.width = 20;
                this.height = 20;
                break;
            case 'skull':
                this.color = '#e8e0d0';
                this.glowColor = '#88ff88';
                this.width = 24;
                this.height = 24;
                break;
            case 'rock':
                this.color = '#888888';
                this.glowColor = '#aaaaaa';
                this.width = 22;
                this.height = 22;
                break;
            default: // 'magic'
                this.color = this.owner === 'player' ? '#ff69b4' : '#ff4444';
                this.glowColor = this.owner === 'player' ? '#ffb6c1' : '#ff6666';
                this.width = 32;
                this.height = 32;
        }
    }

    update(deltaTime) {
        // Apply gravity to rock projectiles (arc trajectory)
        if (this.type === 'rock') {
            this.vy += 300 * deltaTime;
        }

        // Move
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // Rotate bone, skull, and rock projectiles
        if (this.type === 'bone' || this.type === 'skull' || this.type === 'rock') {
            this.rotation += deltaTime * 10;
        }

        // Animate player magic projectile
        if (this.owner === 'player' && this.type === 'magic') {
            this.frameTimer += deltaTime;
            if (this.frameTimer >= 1 / this.frameRate) {
                this.frameTimer = 0;
                this.frameIndex = (this.frameIndex + 1) % 4;
            }
        }

        // Age
        this.age += deltaTime;
        if (this.age >= this.lifetime) {
            this.markedForRemoval = true;
        }

        // Add trail particles (rainbow for player, red for enemy)
        if (Math.random() < 0.6) {
            const colors = this.owner === 'player'
                ? ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd']
                : ['#ff4444', '#ff6666'];

            this.trailParticles.push({
                x: this.x + this.width / 2 + Utils.randomFloat(-4, 4),
                y: this.y + this.height / 2 + Utils.randomFloat(-4, 4),
                size: Utils.randomFloat(3, 7),
                alpha: 1,
                decay: Utils.randomFloat(2, 4),
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }

        // Update trail particles
        for (let i = this.trailParticles.length - 1; i >= 0; i--) {
            const p = this.trailParticles[i];
            p.alpha -= p.decay * deltaTime;
            p.size *= 0.92;
            if (p.alpha <= 0) {
                this.trailParticles.splice(i, 1);
            }
        }
    }

    draw(ctx, cameraX = 0, cameraY = 0) {
        const drawX = this.x - cameraX;
        const drawY = this.y - cameraY;
        const centerX = drawX + this.width / 2;
        const centerY = drawY + this.height / 2;

        // Draw trail particles
        ctx.save();
        for (const p of this.trailParticles) {
            ctx.globalAlpha = p.alpha * 0.7;
            ctx.fillStyle = p.color || this.glowColor;
            ctx.beginPath();
            ctx.arc(p.x - cameraX, p.y - cameraY, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        if (this.type === 'bone') {
            this.drawBone(ctx, centerX, centerY);
        } else if (this.type === 'fireball') {
            this.drawFireball(ctx, centerX, centerY);
        } else if (this.type === 'skull') {
            this.drawSkull(ctx, centerX, centerY);
        } else if (this.type === 'rock') {
            this.drawRock(ctx, centerX, centerY);
        } else if (this.owner === 'player') {
            this.drawPlayerMagic(ctx, drawX, drawY);
        } else {
            this.drawEnemyMagic(ctx, centerX, centerY);
        }
    }

    drawPlayerMagic(ctx, drawX, drawY) {
        // Use animated sprite if available
        const sprites = Projectile.sprites.unicorn;
        if (sprites.length > 0) {
            const sprite = sprites[this.frameIndex % sprites.length];
            if (sprite) {
                ctx.save();
                // Flip sprite based on direction
                if (this.vx < 0) {
                    ctx.translate(drawX + this.width, drawY);
                    ctx.scale(-1, 1);
                    ctx.drawImage(sprite, 0, 0, this.width, this.height);
                } else {
                    ctx.drawImage(sprite, drawX, drawY, this.width, this.height);
                }
                ctx.restore();
                return;
            }
        }

        // Fallback: draw rainbow star
        const centerX = drawX + this.width / 2;
        const centerY = drawY + this.height / 2;

        ctx.save();
        // Outer glow
        ctx.globalAlpha = 0.5;
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, this.width);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, '#ffb6c1');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width, 0, Math.PI * 2);
        ctx.fill();

        // Rainbow star shape
        ctx.globalAlpha = 1;
        const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'];
        const time = this.age * 5;

        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 + time;
            const x = centerX + Math.cos(angle) * 8;
            const y = centerY + Math.sin(angle) * 8;
            ctx.fillStyle = colors[i];
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // White center
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawEnemyMagic(ctx, centerX, centerY) {
        // Red enemy projectile
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = this.glowColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffaaaa';
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width / 4, 0, Math.PI * 2);
        ctx.fill();
    }

    drawBone(ctx, centerX, centerY) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);

        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -3, this.width, 6);

        ctx.beginPath();
        ctx.arc(-this.width / 2, 0, 5, 0, Math.PI * 2);
        ctx.arc(this.width / 2, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawFireball(ctx, centerX, centerY) {
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = this.glowColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width / 4, 0, Math.PI * 2);
        ctx.fill();
    }

    drawSkull(ctx, centerX, centerY) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);

        // Ghostly green glow
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = this.glowColor;
        ctx.beginPath();
        ctx.arc(0, 0, this.width * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Skull shape - main cranium
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, -2, 8, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Jaw
        ctx.beginPath();
        ctx.ellipse(0, 6, 6, 4, 0, 0, Math.PI);
        ctx.fill();

        // Eye sockets (dark)
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.ellipse(-3, -3, 2.5, 3, 0, 0, Math.PI * 2);
        ctx.ellipse(3, -3, 2.5, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glowing green eyes
        ctx.fillStyle = '#44ff44';
        ctx.beginPath();
        ctx.arc(-3, -3, 1.5, 0, Math.PI * 2);
        ctx.arc(3, -3, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Nose hole
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-2, 3);
        ctx.lineTo(2, 3);
        ctx.closePath();
        ctx.fill();

        // Teeth
        ctx.fillStyle = this.color;
        for (let i = -4; i <= 4; i += 2) {
            ctx.fillRect(i - 0.5, 4, 1.5, 3);
        }

        ctx.restore();
    }

    drawRock(ctx, centerX, centerY) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);

        // Rocky irregular shape
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(-8, -4);
        ctx.lineTo(-4, -9);
        ctx.lineTo(4, -8);
        ctx.lineTo(9, -2);
        ctx.lineTo(7, 6);
        ctx.lineTo(-2, 9);
        ctx.lineTo(-9, 4);
        ctx.closePath();
        ctx.fill();

        // Darker cracks
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-3, -6);
        ctx.lineTo(1, 2);
        ctx.lineTo(5, 4);
        ctx.stroke();

        // Highlight
        ctx.fillStyle = '#aaaaaa';
        ctx.beginPath();
        ctx.arc(-2, -3, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    isOffScreen(canvasWidth, canvasHeight, cameraX, cameraY) {
        return this.x < cameraX - 100 ||
               this.x > cameraX + canvasWidth + 100 ||
               this.y < cameraY - 100 ||
               this.y > cameraY + canvasHeight + 100;
    }
}

// Particle System for visual effects

class Particle {
    constructor(x, y, vx, vy, color, size, life, gravity = 0) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.maxLife = life;
        this.life = life;
        this.gravity = gravity;
        this.alpha = 1;
    }

    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.vy += this.gravity * deltaTime;
        this.life -= deltaTime;
        this.alpha = Math.max(0, this.life / this.maxLife);
        this.size *= 0.98;
    }

    draw(ctx, cameraX, cameraY) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x - cameraX, this.y - cameraY, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isDead() {
        return this.life <= 0 || this.size < 0.5;
    }
}

const ParticleSystem = {
    particles: [],
    maxParticles: 500,

    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(deltaTime);
            if (this.particles[i].isDead()) {
                this.particles.splice(i, 1);
            }
        }
    },

    draw(ctx, cameraX, cameraY) {
        for (const particle of this.particles) {
            particle.draw(ctx, cameraX, cameraY);
        }
    },

    emit(x, y, config) {
        const count = config.count || 10;
        const colors = config.colors || ['#ffffff'];
        const speed = config.speed || 100;
        const size = config.size || 5;
        const life = config.life || 0.5;
        const spread = config.spread || Math.PI * 2;
        const angle = config.angle || 0;
        const gravity = config.gravity || 0;

        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) break;

            const particleAngle = angle + (Math.random() - 0.5) * spread;
            const particleSpeed = speed * (0.5 + Math.random() * 0.5);
            const vx = Math.cos(particleAngle) * particleSpeed;
            const vy = Math.sin(particleAngle) * particleSpeed;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const particleSize = size * (0.5 + Math.random() * 0.5);
            const particleLife = life * (0.8 + Math.random() * 0.4);

            this.particles.push(new Particle(
                x + (Math.random() - 0.5) * 10,
                y + (Math.random() - 0.5) * 10,
                vx, vy, color, particleSize, particleLife, gravity
            ));
        }
    },

    // Pre-defined effects
    explosion(x, y, color = '#ff6600') {
        this.emit(x, y, {
            count: 20,
            colors: [color, '#ffaa00', '#ff4400', '#ffffff'],
            speed: 150,
            size: 8,
            life: 0.4,
            gravity: 200
        });
    },

    sparkle(x, y) {
        this.emit(x, y, {
            count: 8,
            colors: ['#ffffff', '#ffff00', '#00ffff', '#ff00ff'],
            speed: 80,
            size: 4,
            life: 0.3
        });
    },

    blood(x, y) {
        this.emit(x, y, {
            count: 12,
            colors: ['#ff0000', '#cc0000', '#990000'],
            speed: 100,
            size: 5,
            life: 0.5,
            gravity: 400
        });
    },

    dust(x, y) {
        this.emit(x, y, {
            count: 6,
            colors: ['#aa9988', '#887766', '#665544'],
            speed: 50,
            size: 6,
            life: 0.4,
            spread: Math.PI,
            angle: -Math.PI / 2,
            gravity: -50
        });
    },

    magic(x, y) {
        this.emit(x, y, {
            count: 15,
            colors: ['#ff69b4', '#ff1493', '#ffb6c1', '#ffffff', '#da70d6'],
            speed: 120,
            size: 6,
            life: 0.5
        });
    },

    fire(x, y) {
        this.emit(x, y, {
            count: 10,
            colors: ['#ff4400', '#ff6600', '#ffaa00', '#ffff00'],
            speed: 80,
            size: 8,
            life: 0.4,
            spread: Math.PI / 2,
            angle: -Math.PI / 2,
            gravity: -100
        });
    },

    levelUp(x, y) {
        this.emit(x, y, {
            count: 30,
            colors: ['#ffd700', '#ffff00', '#ffffff'],
            speed: 200,
            size: 8,
            life: 1,
            gravity: -50
        });
    },

    trail(x, y, color) {
        this.emit(x, y, {
            count: 2,
            colors: [color],
            speed: 20,
            size: 4,
            life: 0.2
        });
    },

    rainbowBlast(x, y) {
        this.emit(x, y, {
            count: 30,
            colors: ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#0088ff', '#8800ff', '#ff00ff'],
            speed: 200,
            size: 8,
            life: 0.6,
            gravity: 100
        });
    },

    rainbowWave(x, y) {
        this.emit(x, y, {
            count: 60,
            colors: ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#0088ff', '#8800ff', '#ff69b4', '#ffffff'],
            speed: 350,
            size: 10,
            life: 0.8,
            gravity: -50
        });
    },

    confetti(x, y) {
        // Burst of colorful confetti particles across the screen area
        for (let i = 0; i < 8; i++) {
            const spawnX = x + (Math.random() - 0.5) * 600;
            const spawnY = y - 100 + Math.random() * 50;
            this.emit(spawnX, spawnY, {
                count: 12,
                colors: ['#ff0000', '#ff7700', '#ffff00', '#00ff00', '#0088ff', '#8800ff', '#ff69b4', '#ffffff', '#ffd700'],
                speed: 150,
                size: 6,
                life: 1.5,
                gravity: 200,
                spread: Math.PI * 2
            });
        }
    },

    clear() {
        this.particles = [];
    }
};

// Enemy classes for Milestone 2

class Enemy extends Sprite {
    constructor(x, y, width, height, type) {
        super(x, y, width, height);
        this.type = type;

        // Physics
        this.vx = 0;
        this.vy = 0;
        this.speed = 60;
        this.gravity = 1200;
        this.maxFallSpeed = 600;
        this.flying = false;

        // Combat
        this.health = 1;
        this.maxHealth = 1;
        this.damage = 1;
        this.attackRange = 50;
        this.attackCooldown = 0;
        this.isAttacking = false;

        // AI
        this.state = 'idle';
        this.stateTimer = 0;
        this.detectionRange = 200;
        this.patrolDirection = 1;
        this.patrolTimer = 0;
        this.patrolDuration = 2;

        // Death
        this.isDead = false;
        this.deathTimer = 0;
        this.markedForRemoval = false;

        // Hitbox
        this.hitboxOffsetX = 16;
        this.hitboxOffsetY = 16;
        this.hitboxWidth = 32;
        this.hitboxHeight = 32;

        // Score
        this.scoreValue = 100;

        // All enemy sprite sheets face left by default
        this.spriteFacesLeft = true;

        // Hurt state
        this.isHurt = false;
        this.hurtTimer = 0;
    }

    async loadAnimations() {
        const anims = await SpriteLoader.loadEnemyAnimations(this.type);
        this.addAnimation('idle', anims.idle, 8, true);
        this.addAnimation('walk', anims.walk, 10, true);
        this.addAnimation('attack', anims.attack, 12, false);
        this.addAnimation('hurt', anims.hurt, 10, false);
        this.addAnimation('death', anims.death, 8, false);
        this.playAnimation('idle');
    }

    update(deltaTime, level, player, projectiles) {
        if (this.isDead) {
            this.updateDeath(deltaTime);
            return;
        }

        if (this.isHurt) {
            this.hurtTimer -= deltaTime;
            if (this.hurtTimer <= 0) {
                this.isHurt = false;
            }
            super.update(deltaTime);
            return;
        }

        // Stun check (used by bosses)
        if (this.stunTimer > 0) {
            this.stunTimer -= deltaTime;
            this.vx = 0;
            if (this.flying) this.vy = 0;
            this.playAnimation('hurt');
            super.update(deltaTime);
            return;
        }

        this.updateAI(deltaTime, player, projectiles);

        if (!this.flying) {
            this.vy += this.gravity * deltaTime;
            if (this.vy > this.maxFallSpeed) this.vy = this.maxFallSpeed;
        }

        this.moveWithCollision(deltaTime, level);
        this.updateAnimation();
        super.update(deltaTime);
    }

    updateAI(deltaTime, player, projectiles) {
        // Override in subclasses
    }

    moveWithCollision(deltaTime, level) {
        this.x += this.vx * deltaTime;

        let hitbox = this.getHitbox();
        for (const platform of level.platforms) {
            if (this.rectIntersect(hitbox, platform)) {
                if (this.vx > 0) {
                    this.x = platform.x - this.hitboxWidth - this.hitboxOffsetX;
                    this.patrolDirection = -1;
                } else if (this.vx < 0) {
                    this.x = platform.x + platform.width - this.hitboxOffsetX;
                    this.patrolDirection = 1;
                }
                this.vx = 0;
                break;
            }
        }

        this.y += this.vy * deltaTime;

        hitbox = this.getHitbox();
        for (const platform of level.platforms) {
            if (this.rectIntersect(hitbox, platform)) {
                if (this.vy > 0) {
                    this.y = platform.y - this.hitboxHeight - this.hitboxOffsetY;
                    this.vy = 0;
                } else if (this.vy < 0) {
                    this.y = platform.y + platform.height - this.hitboxOffsetY;
                    this.vy = 0;
                }
                break;
            }
        }

        if (this.x < 0) { this.x = 0; this.patrolDirection = 1; }
        if (this.x + this.width > level.width) {
            this.x = level.width - this.width;
            this.patrolDirection = -1;
        }
    }

    rectIntersect(r1, r2) {
        return r1.x < r2.x + r2.width && r1.x + r1.width > r2.x &&
               r1.y < r2.y + r2.height && r1.y + r1.height > r2.y;
    }

    updateAnimation() {
        if (this.isHurt) this.playAnimation('hurt');
        else if (this.isAttacking) this.playAnimation('attack');
        else if (Math.abs(this.vx) > 0 || (this.flying && Math.abs(this.vy) > 0)) this.playAnimation('walk');
        else this.playAnimation('idle');
    }

    takeDamage(amount, isMelee = false) {
        if (this.isDead) return;
        this.health -= amount;
        this.isHurt = true;
        this.hurtTimer = 0.2;
        if (this.health <= 0) this.die();
    }

    die() {
        this.isDead = true;
        this.deathTimer = 0;
        this.playAnimation('death');
        this.vx = 0;
        this.vy = 0;

        // Boss death effects - wrapped in try-catch to prevent game freeze
        if (this.isBoss) {
            try {
                if (typeof SoundManager !== 'undefined') {
                    SoundManager.play('bossDeath');
                }
            } catch (e) {
                console.error('Boss death sound error:', e);
            }

            try {
                if (typeof ScreenEffects !== 'undefined') {
                    ScreenEffects.onBossDeath();
                }
            } catch (e) {
                console.error('Boss death effects error:', e);
            }

            try {
                if (typeof ParticleSystem !== 'undefined') {
                    const centerX = this.x + this.width / 2;
                    const centerY = this.y + this.height / 2;
                    for (let i = 0; i < 3; i++) {
                        const offsetX = (Math.random() - 0.5) * this.width;
                        const offsetY = (Math.random() - 0.5) * this.height;
                        ParticleSystem.explosion(centerX + offsetX, centerY + offsetY, '#ff4400');
                    }
                }
            } catch (e) {
                console.error('Boss death particles error:', e);
            }
        }
    }

    updateDeath(deltaTime) {
        this.deathTimer += deltaTime;
        // Update animation directly (Sprite.update)
        if (this.currentAnimation && this.animations[this.currentAnimation]) {
            this.animations[this.currentAnimation].update(deltaTime);
        }
        if (this.deathTimer > 1) this.markedForRemoval = true;
    }

    getHitbox() {
        return {
            x: this.x + this.hitboxOffsetX,
            y: this.y + this.hitboxOffsetY,
            width: this.hitboxWidth,
            height: this.hitboxHeight
        };
    }

    getDistanceToPlayer(player) {
        const mx = this.x + this.width / 2;
        const my = this.y + this.height / 2;
        const px = player.x + player.width / 2;
        const py = player.y + player.height / 2;
        return Math.sqrt((px - mx) ** 2 + (py - my) ** 2);
    }

    facePlayer(player) {
        this.facingRight = (player.x + player.width / 2) > (this.x + this.width / 2);
    }
}

// Baby Dragon - flies and hops toward player (replaces Slime)
class BabyDragon extends Enemy {
    constructor(x, y) {
        super(x, y, 80, 80, 'baby_dragon');
        this.health = 1;
        this.damage = 1;
        this.speed = 80;
        this.scoreValue = 100;
        this.hopCooldown = 0;
        this.hopForce = -300;
        this.hitboxOffsetX = 16;
        this.hitboxOffsetY = 24;
        this.hitboxWidth = 48;
        this.hitboxHeight = 44;
    }

    updateAI(deltaTime, player) {
        const dist = this.getDistanceToPlayer(player);
        if (this.hopCooldown > 0) this.hopCooldown -= deltaTime;

        if (dist < this.detectionRange) {
            this.facePlayer(player);
            if (this.hopCooldown <= 0 && this.vy === 0) {
                this.vy = this.hopForce;
                this.vx = this.facingRight ? this.speed * 2 : -this.speed * 2;
                this.hopCooldown = 1.5;
            }
        } else {
            this.vx = 0;
        }

        if (this.vy !== 0) this.vx *= 0.98;
        else this.vx = 0;
    }
}

// Goblin - walks and attacks (now uses goblin sprite sheet)
class Goblin extends Enemy {
    constructor(x, y) {
        super(x, y, 72, 72, 'goblin');
        this.health = 2;
        this.damage = 1;
        this.speed = 70;
        this.scoreValue = 150;
        this.attackRange = 60;
        this.attackCooldownMax = 1.5;
        this.hitboxOffsetX = 14;
        this.hitboxOffsetY = 12;
        this.hitboxWidth = 44;
        this.hitboxHeight = 52;
    }

    updateAI(deltaTime, player) {
        const dist = this.getDistanceToPlayer(player);
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
        if (this.isAttacking && this.isAnimationFinished()) this.isAttacking = false;

        if (this.isAttacking) { this.vx = 0; return; }

        if (dist < this.attackRange) {
            if (this.attackCooldown <= 0) {
                this.isAttacking = true;
                this.attackCooldown = this.attackCooldownMax;
                this.playAnimation('attack');
            }
            this.vx = 0;
            this.facePlayer(player);
        } else if (dist < this.detectionRange) {
            this.facePlayer(player);
            this.vx = this.facingRight ? this.speed : -this.speed;
        } else {
            this.patrolTimer += deltaTime;
            if (this.patrolTimer > this.patrolDuration) {
                this.patrolTimer = 0;
                this.patrolDirection *= -1;
            }
            this.vx = this.speed * 0.5 * this.patrolDirection;
            this.facingRight = this.patrolDirection > 0;
        }
    }

    canDealDamage() {
        return this.isAttacking && this.animations['attack'] &&
               this.animations['attack'].currentFrame >= 1 &&
               this.animations['attack'].currentFrame <= 2;
    }
}

// Flying Eye - flies in wave pattern (replaces Bat, uses flying_eye sprite)
class Bat extends Enemy {
    constructor(x, y) {
        super(x, y, 80, 80, 'bat');
        this.health = 1;
        this.damage = 1;
        this.speed = 100;
        this.scoreValue = 100;
        this.flying = true;
        this.baseY = y;
        this.waveOffset = Math.random() * Math.PI * 2;
        this.waveAmplitude = 30;
        this.waveSpeed = 3;
        this.hitboxOffsetX = 16;
        this.hitboxOffsetY = 16;
        this.hitboxWidth = 48;
        this.hitboxHeight = 48;
    }

    updateAI(deltaTime, player) {
        const dist = this.getDistanceToPlayer(player);
        this.waveOffset += deltaTime * this.waveSpeed;

        if (dist < this.detectionRange * 1.5) {
            this.facePlayer(player);
            this.vx = this.facingRight ? this.speed : -this.speed;
            const targetY = player.y - 50;
            this.vy = (targetY - this.y) * 2;
        } else {
            this.vx = this.speed * 0.5 * this.patrolDirection;
            this.facingRight = this.patrolDirection > 0;
            this.vy = Math.sin(this.waveOffset) * this.waveAmplitude;
        }
    }

    moveWithCollision(deltaTime, level) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        if (this.x < 0) { this.x = 0; this.patrolDirection = 1; }
        if (this.x + this.width > level.width) {
            this.x = level.width - this.width;
            this.patrolDirection = -1;
        }
        if (this.y < 50) this.y = 50;
        if (this.y > level.height - 150) this.y = level.height - 150;
    }
}

// Skeleton Warrior - walks and throws bones (uses skeleton_warrior sprite)
class Skeleton extends Enemy {
    constructor(x, y) {
        super(x, y, 72, 72, 'skeleton');
        this.health = 2;
        this.damage = 1;
        this.speed = 50;
        this.scoreValue = 200;
        this.attackRange = 250;
        this.attackCooldownMax = 2;
        this.hitboxOffsetX = 14;
        this.hitboxOffsetY = 8;
        this.hitboxWidth = 44;
        this.hitboxHeight = 56;
    }

    updateAI(deltaTime, player, projectiles) {
        const dist = this.getDistanceToPlayer(player);
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
        if (this.isAttacking && this.isAnimationFinished()) this.isAttacking = false;

        if (this.isAttacking) { this.vx = 0; return; }

        if (dist < this.attackRange && dist > 80) {
            this.facePlayer(player);
            if (this.attackCooldown <= 0) {
                this.isAttacking = true;
                this.attackCooldown = this.attackCooldownMax;
                this.playAnimation('attack');
                // Throw bone projectile
                const projX = this.facingRight ? this.x + this.width : this.x - 16;
                const projY = this.y + 20;
                const projVx = this.facingRight ? 200 : -200;
                if (projectiles) projectiles.push(new Projectile(projX, projY, projVx, 0, 'enemy', 'bone'));
            }
            this.vx = 0;
        } else if (dist < 80) {
            this.facePlayer(player);
            this.vx = this.facingRight ? -this.speed : this.speed; // Back away
        } else if (dist < this.detectionRange) {
            this.facePlayer(player);
            this.vx = this.facingRight ? this.speed : -this.speed;
        } else {
            this.patrolTimer += deltaTime;
            if (this.patrolTimer > this.patrolDuration) {
                this.patrolTimer = 0;
                this.patrolDirection *= -1;
            }
            this.vx = this.speed * 0.5 * this.patrolDirection;
            this.facingRight = this.patrolDirection > 0;
        }
    }
}

// Skeleton Mage - casts magic projectiles (uses skeleton_mage sprite sheet)
class SkeletonMage extends Enemy {
    constructor(x, y) {
        super(x, y, 100, 100, 'skeleton_mage');
        this.health = 3;
        this.damage = 1;
        this.speed = 40;
        this.scoreValue = 300;
        this.attackRange = 350;
        this.attackCooldownMax = 2.0;
        this.hitboxOffsetX = 25;
        this.hitboxOffsetY = 20;
        this.hitboxWidth = 50;
        this.hitboxHeight = 70;
    }

    updateAI(deltaTime, player, projectiles) {
        const dist = this.getDistanceToPlayer(player);
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
        if (this.isAttacking && this.isAnimationFinished()) this.isAttacking = false;

        if (this.isAttacking) { this.vx = 0; return; }

        if (dist < this.attackRange && dist > 100) {
            this.facePlayer(player);
            if (this.attackCooldown <= 0) {
                this.isAttacking = true;
                this.attackCooldown = this.attackCooldownMax;
                this.playAnimation('attack');
                // Cast magic projectile at player
                const projX = this.facingRight ? this.x + this.width : this.x - 16;
                const projY = this.y + 30;
                const dx = (player.x + player.width / 2) - projX;
                const dy = (player.y + player.height / 2) - projY;
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                const speed = 180;
                if (projectiles) projectiles.push(new Projectile(projX, projY, (dx / len) * speed, (dy / len) * speed, 'enemy', 'fireball'));
            }
            this.vx = 0;
        } else if (dist < 100) {
            this.facePlayer(player);
            this.vx = this.facingRight ? -this.speed : this.speed; // Back away
        } else if (dist < this.detectionRange) {
            this.facePlayer(player);
            this.vx = this.facingRight ? this.speed : -this.speed;
        } else {
            this.patrolTimer += deltaTime;
            if (this.patrolTimer > this.patrolDuration) {
                this.patrolTimer = 0;
                this.patrolDirection *= -1;
            }
            this.vx = this.speed * 0.5 * this.patrolDirection;
            this.facingRight = this.patrolDirection > 0;
        }
    }
}

// Lizardman - melee ground enemy (uses lizardman sprite sheet)
class Lizardman extends Enemy {
    constructor(x, y) {
        // Now uses Dwarf Warrior sprite (128x128 frames), displayed at 128x128
        super(x, y, 128, 128, 'lizardman');
        this.health = 3;
        this.damage = 1;
        this.speed = 70;
        this.scoreValue = 250;
        this.attackRange = 70;
        this.attackCooldownMax = 1.5;
        // Hitbox: character feet are at ~Y=76 in 128px sprite (doubled from 38)
        this.hitboxOffsetX = 24;
        this.hitboxOffsetY = 0;
        this.hitboxWidth = 80;
        this.hitboxHeight = 76;  // Matches where feet are in sprite
        this.spriteFacesLeft = true;  // Dwarf faces left in sprite
    }

    updateAI(deltaTime, player, projectiles) {
        const dist = this.getDistanceToPlayer(player);
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
        if (this.isAttacking && this.isAnimationFinished()) this.isAttacking = false;

        // Lock facing direction during attack
        if (this.isAttacking) { this.vx = 0; return; }

        if (dist < this.attackRange) {
            this.facePlayer(player);
            if (this.attackCooldown <= 0) {
                this.isAttacking = true;
                this.attackCooldown = this.attackCooldownMax;
                this.playAnimation('attack');
            }
            this.vx = 0;
        } else if (dist < this.detectionRange) {
            this.facePlayer(player);
            this.vx = this.facingRight ? this.speed : -this.speed;
        } else {
            this.patrolTimer += deltaTime;
            if (this.patrolTimer > this.patrolDuration) {
                this.patrolTimer = 0;
                this.patrolDirection *= -1;
            }
            this.vx = this.speed * 0.5 * this.patrolDirection;
            this.facingRight = this.patrolDirection > 0;
        }
    }

}

// Imp - flies and shoots fireballs (uses imp sprite sheet)
class Imp extends Enemy {
    constructor(x, y) {
        super(x, y, 128, 48, 'imp');  // Match native 128x48 aspect ratio
        this.health = 2;
        this.damage = 1;
        this.speed = 80;
        this.scoreValue = 200;
        this.flying = true;
        this.attackRange = 200;
        this.attackCooldownMax = 2.5;
        this.hitboxOffsetX = 32;
        this.hitboxOffsetY = 8;
        this.hitboxWidth = 64;
        this.hitboxHeight = 32;
        this.hoverOffset = Math.random() * Math.PI * 2;
    }

    updateAI(deltaTime, player, projectiles) {
        const dist = this.getDistanceToPlayer(player);
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
        if (this.isAttacking && this.isAnimationFinished()) this.isAttacking = false;

        this.hoverOffset += deltaTime * 2;

        if (dist < this.attackRange) {
            this.facePlayer(player);
            if (this.attackCooldown <= 0) {
                this.isAttacking = true;
                this.attackCooldown = this.attackCooldownMax;
                this.playAnimation('attack');
                // Shoot fireball
                const projX = this.facingRight ? this.x + this.width : this.x - 16;
                const projY = this.y + this.height / 2;
                const dx = (player.x + player.width / 2) - projX;
                const dy = (player.y + player.height / 2) - projY;
                const len = Math.sqrt(dx * dx + dy * dy);
                const projVx = (dx / len) * 180;
                const projVy = (dy / len) * 180;
                if (projectiles) projectiles.push(new Projectile(projX, projY, projVx, projVy, 'enemy', 'fireball'));
            }
            // Hover in place
            this.vx = 0;
            this.vy = Math.sin(this.hoverOffset) * 20;
        } else {
            this.vx = this.speed * 0.5 * this.patrolDirection;
            this.facingRight = this.patrolDirection > 0;
            this.vy = Math.sin(this.hoverOffset) * 30;
        }
    }

    moveWithCollision(deltaTime, level) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        if (this.x < 0) { this.x = 0; this.patrolDirection = 1; }
        if (this.x + this.width > level.width) {
            this.x = level.width - this.width;
            this.patrolDirection = -1;
        }
        if (this.y < 50) this.y = 50;
        if (this.y > level.height - 150) this.y = level.height - 150;
    }
}

// Harpy - flying enemy that swoops at player
class Harpy extends Enemy {
    constructor(x, y) {
        super(x, y, 80, 80, 'harpy');
        this.health = 2;
        this.damage = 1;
        this.speed = 110;
        this.scoreValue = 200;
        this.flying = true;
        this.baseY = y;
        this.waveOffset = Math.random() * Math.PI * 2;
        this.waveAmplitude = 40;
        this.waveSpeed = 2.5;
        this.hitboxOffsetX = 16;
        this.hitboxOffsetY = 16;
        this.hitboxWidth = 48;
        this.hitboxHeight = 48;
        this.swoopCooldown = 0;
        this.swooping = false;
        this.swoopTarget = null;
    }

    updateAI(deltaTime, player) {
        const dist = this.getDistanceToPlayer(player);
        this.waveOffset += deltaTime * this.waveSpeed;
        if (this.swoopCooldown > 0) this.swoopCooldown -= deltaTime;

        if (this.swooping) {
            // Swooping toward target
            if (this.swoopTarget) {
                const dx = this.swoopTarget.x - this.x;
                const dy = this.swoopTarget.y - this.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                if (len > 20) {
                    this.vx = (dx / len) * this.speed * 2;
                    this.vy = (dy / len) * this.speed * 2;
                } else {
                    this.swooping = false;
                    this.swoopTarget = null;
                    this.swoopCooldown = 3;
                }
            }
        } else if (dist < this.detectionRange * 1.5) {
            this.facePlayer(player);
            // Try to swoop at player
            if (this.swoopCooldown <= 0 && dist < 200) {
                this.swooping = true;
                this.swoopTarget = { x: player.x, y: player.y };
                this.isAttacking = true;
                this.playAnimation('attack');
            } else {
                // Circle above player
                this.vx = this.facingRight ? this.speed * 0.6 : -this.speed * 0.6;
                const targetY = player.y - 100;
                this.vy = (targetY - this.y) * 2 + Math.sin(this.waveOffset) * 20;
            }
        } else {
            this.vx = this.speed * 0.5 * this.patrolDirection;
            this.facingRight = this.patrolDirection > 0;
            this.vy = Math.sin(this.waveOffset) * this.waveAmplitude;
        }
    }

    moveWithCollision(deltaTime, level) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        if (this.x < 0) { this.x = 0; this.patrolDirection = 1; }
        if (this.x + this.width > level.width) {
            this.x = level.width - this.width;
            this.patrolDirection = -1;
        }
        if (this.y < 50) this.y = 50;
        if (this.y > level.height - 150) this.y = level.height - 150;
    }
}

// ============== BOSSES ==============

class Boss extends Enemy {
    constructor(x, y, width, height, type) {
        super(x, y, width, height, type);
        this.isBoss = true;
        this.phase = 1;
        this.phaseTimer = 0;
        this.stunTimer = 0;
    }

    stun(duration) {
        this.stunTimer = duration;
        this.vx = 0;
        this.vy = 0;
        this.isAttacking = false;
    }

    async loadAnimations() {
        const anims = await SpriteLoader.loadBossAnimations(this.type);
        this.addAnimation('idle', anims.idle, 8, true);
        this.addAnimation('walk', anims.walk, 10, true);
        this.addAnimation('attack', anims.attack, 12, false);
        this.addAnimation('hurt', anims.hurt, 10, false);
        this.addAnimation('death', anims.death, 8, false);
        // Add fly animation if available (dragon boss)
        if (anims.fly) {
            this.addAnimation('fly', anims.fly, 10, true);
        }
        this.playAnimation('idle');
    }

    updateDeath(deltaTime) {
        this.deathTimer += deltaTime;
        // Update animation directly (don't call super.update to avoid recursion)
        if (this.currentAnimation && this.animations[this.currentAnimation]) {
            this.animations[this.currentAnimation].update(deltaTime);
        }
        if (this.deathTimer > 2) this.markedForRemoval = true;
    }

    draw(ctx, cameraX, cameraY) {
        super.draw(ctx, cameraX, cameraY);
        if (this.isDead || !this.visible) return;

        // Draw health bar above boss
        const barWidth = 80;
        const barHeight = 8;
        const barX = Math.floor(this.x + this.width / 2 - barWidth / 2 - cameraX);
        const barY = Math.floor(this.y - 16 - cameraY);
        const healthRatio = this.health / this.maxHealth;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

        // Health fill — green to yellow to red
        let barColor;
        if (healthRatio > 0.5) {
            barColor = '#44dd44';
        } else if (healthRatio > 0.25) {
            barColor = '#ddaa22';
        } else {
            barColor = '#dd3333';
        }
        ctx.fillStyle = barColor;
        ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);

        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

        // "STUNNED" text when stunned
        if (this.stunTimer > 0) {
            const time = Date.now() / 1000;
            const flash = Math.sin(time * 8) > 0 ? 1 : 0.4;
            ctx.save();
            ctx.globalAlpha = flash;
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.fillStyle = '#ffdd00';
            const textX = Math.floor(this.x + this.width / 2 - cameraX);
            const textY = barY - 8;
            ctx.strokeText('STUNNED', textX, textY);
            ctx.fillText('STUNNED', textX, textY);
            ctx.restore();
        }
    }
}

// Dragon Boss - flies, breathes fire, dive attacks (uses dragon sprite sheet)
class Dragon extends Boss {
    constructor(x, y) {
        super(x, y, 160, 160, 'dragon');
        this.health = 35;
        this.maxHealth = 35;
        this.damage = 2;
        this.speed = 120;
        this.scoreValue = 2000;
        this.flying = true;
        this.attackCooldownMax = 1;  // Faster fire attacks (was 2)
        this.hitboxOffsetX = 24;
        this.hitboxOffsetY = 40;
        this.hitboxWidth = 112;
        this.hitboxHeight = 90;
        this.state = 'hover';
        this.stateTimer = 0;
        this.diveTarget = null;
        this.damageCooldown = 0;  // Prevent rapid damage
    }

    takeDamage(amount, isMelee = false) {
        if (this.isDead) return;
        if (this.damageCooldown > 0) return;  // Ignore damage during cooldown

        this.health -= amount;
        this.isHurt = true;
        this.hurtTimer = 0.3;
        this.damageCooldown = 0.5;  // 0.5 second damage cooldown

        if (this.health <= 0) this.die();
    }

    updateAI(deltaTime, player, projectiles) {
        // Update damage cooldown
        if (this.damageCooldown > 0) this.damageCooldown -= deltaTime;
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
        if (this.isAttacking && this.isAnimationFinished()) this.isAttacking = false;

        this.stateTimer += deltaTime;
        this.facePlayer(player);

        switch (this.state) {
            case 'hover':
                this.vy = Math.sin(this.stateTimer * 2) * 30;
                this.vx = (player.x > this.x ? 1 : -1) * 50;
                if (this.stateTimer > 3) {
                    this.state = Math.random() > 0.5 ? 'fire' : 'dive';
                    this.stateTimer = 0;
                }
                break;
            case 'fire':
                this.vx = 0;
                this.vy = 0;
                if (!this.isAttacking && this.attackCooldown <= 0) {
                    this.isAttacking = true;
                    this.attackCooldown = this.attackCooldownMax;
                    this.playAnimation('attack');
                    // Fire breath (3 fireballs)
                    for (let i = -1; i <= 1; i++) {
                        const projX = this.facingRight ? this.x + this.width : this.x - 16;
                        const projY = this.y + 50;
                        const projVx = this.facingRight ? 250 : -250;
                        const projVy = i * 50;
                        if (projectiles) projectiles.push(new Projectile(projX, projY, projVx, projVy, 'enemy', 'fireball'));
                    }
                }
                if (this.stateTimer > 1.5) {
                    this.state = 'hover';
                    this.stateTimer = 0;
                }
                break;
            case 'dive':
                if (!this.diveTarget) {
                    this.diveTarget = { x: player.x, y: player.y };
                }
                const dx = this.diveTarget.x - this.x;
                const dy = this.diveTarget.y - this.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                if (len > 20) {
                    this.vx = (dx / len) * this.speed * 2;
                    this.vy = (dy / len) * this.speed * 2;
                } else {
                    this.diveTarget = null;
                    this.state = 'recover';
                    this.stateTimer = 0;
                }
                if (this.stateTimer > 2) {
                    this.diveTarget = null;
                    this.state = 'recover';
                    this.stateTimer = 0;
                }
                break;
            case 'recover':
                this.vy = -80;
                this.vx = 0;
                if (this.y < 150 || this.stateTimer > 1.5) {
                    this.state = 'hover';
                    this.stateTimer = 0;
                }
                break;
        }
    }

    moveWithCollision(deltaTime, level) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        if (this.x < 50) this.x = 50;
        if (this.x + this.width > level.width - 50) this.x = level.width - 50 - this.width;
        if (this.y < 50) this.y = 50;
        if (this.y > level.height - 200) this.y = level.height - 200;
    }

    updateAnimation() {
        if (this.isHurt) {
            this.playAnimation('hurt');
        } else if (this.isAttacking) {
            this.playAnimation('attack');
        } else if (this.flying && (Math.abs(this.vx) > 0 || Math.abs(this.vy) > 0)) {
            // Flying and moving - use walk animation (has wing movement)
            this.playAnimation('walk');
        } else if (!this.flying && Math.abs(this.vx) > 0) {
            // On ground and moving - use walk animation
            this.playAnimation('walk');
        } else {
            this.playAnimation('idle');
        }
    }
}

// Gargoyle - stone guardian boss, swoops and throws rocks
class Gargoyle extends Boss {
    constructor(x, y) {
        // Sprite frames are 158x125, display at native size for boss
        super(x, y, 158, 125, 'gargoyle');
        this.health = 28;
        this.maxHealth = 28;
        this.damage = 2;
        this.speed = 100;
        this.scoreValue = 2500;
        this.flying = true;
        this.attackCooldownMax = 1.5;
        this.hitboxOffsetX = 30;
        this.hitboxOffsetY = 40;
        this.hitboxWidth = 98;
        this.hitboxHeight = 75;
        this.state = 'hover';
        this.stateTimer = 0;
        this.swoopTarget = null;
        this.damageCooldown = 0;
        this.spriteFacesLeft = true;
    }

    takeDamage(amount, isMelee = false) {
        if (this.isDead) return;
        if (this.damageCooldown > 0) return;

        this.health -= amount;
        this.isHurt = true;
        this.hurtTimer = 0.3;
        this.damageCooldown = 0.4;

        if (this.health <= 0) this.die();
    }

    updateAI(deltaTime, player, projectiles) {
        if (this.damageCooldown > 0) this.damageCooldown -= deltaTime;
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
        if (this.isAttacking && this.isAnimationFinished()) this.isAttacking = false;

        this.stateTimer += deltaTime;
        this.facePlayer(player);

        // Phase 2 at half health - faster and more aggressive
        const isPhase2 = this.health <= this.maxHealth / 2;
        const speedMult = isPhase2 ? 1.5 : 1;

        switch (this.state) {
            case 'hover':
                // Hover and track player
                this.vy = Math.sin(this.stateTimer * 2.5) * 40;
                this.vx = (player.x > this.x ? 1 : -1) * 60 * speedMult;
                if (this.stateTimer > 2.5) {
                    const actions = ['swoop', 'rock_throw', 'swipe'];
                    if (isPhase2) actions.push('swoop', 'swipe'); // More attacks in phase 2
                    this.state = actions[Math.floor(Math.random() * actions.length)];
                    this.stateTimer = 0;
                }
                break;

            case 'swipe':
                // Dive toward player for melee swipe attack - track player live
                if (!this.swoopTarget) {
                    this.swoopTarget = { x: player.x, y: player.y };
                } else {
                    // Update target to follow player's current position
                    this.swoopTarget.x = player.x;
                    this.swoopTarget.y = player.y;
                }
                const swipeDx = this.swoopTarget.x - this.x;
                const swipeDy = this.swoopTarget.y - this.y;
                const swipeLen = Math.sqrt(swipeDx * swipeDx + swipeDy * swipeDy);
                if (swipeLen > 50) {
                    // Approach player
                    this.vx = (swipeDx / swipeLen) * this.speed * 1.8 * speedMult;
                    this.vy = (swipeDy / swipeLen) * this.speed * 1.8 * speedMult;
                } else {
                    // Close enough - do swipe attack
                    this.vx = 0;
                    this.vy = 0;
                    if (!this.isAttacking && this.attackCooldown <= 0) {
                        this.isAttacking = true;
                        this.attackCooldown = this.attackCooldownMax;
                        this.playAnimation('attack');
                        // No projectiles - melee only (handled by collision system)
                    }
                    if (this.isAnimationFinished() || this.stateTimer > 1.5) {
                        this.swoopTarget = null;
                        this.state = 'recover';
                        this.stateTimer = 0;
                    }
                }
                if (this.stateTimer > 2.5) {
                    this.swoopTarget = null;
                    this.state = 'recover';
                    this.stateTimer = 0;
                }
                break;

            case 'rock_throw':
                this.vx = 0;
                this.vy = 0;
                if (!this.isAttacking && this.attackCooldown <= 0) {
                    this.isAttacking = true;
                    this.attackCooldown = this.attackCooldownMax;
                    this.playAnimation('attack');
                    // Throw rocks in arc
                    const rockCount = isPhase2 ? 3 : 2;
                    for (let i = 0; i < rockCount; i++) {
                        const projX = this.facingRight ? this.x + this.width : this.x;
                        const projY = this.y + 40;
                        const baseVx = this.facingRight ? 180 : -180;
                        const projVx = baseVx + (i - 1) * 40;
                        const projVy = -100 + i * 30;
                        if (projectiles) projectiles.push(new Projectile(projX, projY, projVx, projVy, 'enemy', 'rock'));
                    }
                }
                if (this.stateTimer > 1.2) {
                    this.state = 'hover';
                    this.stateTimer = 0;
                }
                break;

            case 'swoop':
                if (!this.swoopTarget) {
                    this.swoopTarget = { x: player.x, y: player.y + 20 };
                    this.isAttacking = true;
                    this.playAnimation('attack');
                }
                const dx = this.swoopTarget.x - this.x;
                const dy = this.swoopTarget.y - this.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                if (len > 30) {
                    this.vx = (dx / len) * this.speed * 2.2 * speedMult;
                    this.vy = (dy / len) * this.speed * 2.2 * speedMult;
                } else {
                    this.swoopTarget = null;
                    this.isAttacking = false;
                    this.state = 'recover';
                    this.stateTimer = 0;
                }
                if (this.stateTimer > 2) {
                    this.swoopTarget = null;
                    this.isAttacking = false;
                    this.state = 'recover';
                    this.stateTimer = 0;
                }
                break;

            case 'recover':
                // Fly back up
                this.vy = -100 * speedMult;
                this.vx = 0;
                if (this.y < 120 || this.stateTimer > 1.5) {
                    this.state = 'hover';
                    this.stateTimer = 0;
                }
                break;
        }
    }

    moveWithCollision(deltaTime, level) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        if (this.x < 50) this.x = 50;
        if (this.x + this.width > level.width - 50) this.x = level.width - 50 - this.width;
        if (this.y < 50) this.y = 50;
        if (this.y > level.height - 180) this.y = level.height - 180;
    }

    updateAnimation() {
        if (this.isHurt) {
            this.playAnimation('hurt');
        } else if (this.isAttacking) {
            this.playAnimation('attack');
        } else if (this.flying && (Math.abs(this.vx) > 0 || Math.abs(this.vy) > 0)) {
            this.playAnimation('walk');
        } else {
            this.playAnimation('idle');
        }
    }
}

// Demon Lord - teleports, summons imps, fire waves (uses demon_boss sprite)
class DemonLord extends Boss {
    constructor(x, y) {
        super(x, y, 160, 160, 'demon_lord');
        this.health = 45;      // +50% (was 30)
        this.maxHealth = 45;   // +50% (was 30)
        this.damage = 1;
        this.speed = 130;
        this.scoreValue = 5000;
        this.attackCooldownMax = 5.0;  // Doubled from 2.5
        this.hitboxOffsetX = 28;
        this.hitboxOffsetY = 20;
        this.hitboxWidth = 104;
        this.hitboxHeight = 120;
        this.state = 'idle';
        this.stateTimer = 0;
        this.teleportCooldown = 0;
        this.spawnImpRequested = false;  // Flag for game.js to spawn imp on hit
        this.consecutiveHits = 0;
        this.reactiveTeleport = false;  // Flag to teleport away after too many hits
    }

    takeDamage(amount, isMelee = false) {
        if (this.isDead) return;
        super.takeDamage(amount, isMelee);
        if (!this.isDead) {
            this.spawnImpRequested = true;
            this.consecutiveHits++;
            if (this.consecutiveHits > 2) {
                this.reactiveTeleport = true;
                this.consecutiveHits = 0;
            }
        }
    }

    updateAI(deltaTime, player, projectiles) {
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
        if (this.teleportCooldown > 0) this.teleportCooldown -= deltaTime;
        if (this.isAttacking && this.isAnimationFinished()) this.isAttacking = false;

        // Reactive teleport: escape after being hit more than twice in a row
        if (this.reactiveTeleport) {
            this.reactiveTeleport = false;
            const side = Math.random() > 0.5 ? 1 : -1;
            this.x = player.x + side * (200 + Math.random() * 100);
            this.y = player.y - 50;
            this.teleportCooldown = this.phase === 2 ? 1.2 : 2;  // Doubled
            ParticleSystem.magic(this.x + this.width / 2, this.y + this.height / 2);
            this.state = 'firewave';
            this.stateTimer = 0;
            return;
        }

        this.stateTimer += deltaTime;
        this.facePlayer(player);

        // Reset consecutive hit counter when attacking (player stopped hitting)
        if (this.stateTimer > 1.5) {
            this.consecutiveHits = 0;
        }

        // Change phase based on health (half of 45)
        if (this.health <= 22 && this.phase === 1) {
            this.phase = 2;
            this.attackCooldownMax = 3.0;  // Doubled from 1.5
            this.speed = 160;
        }

        switch (this.state) {
            case 'idle':
                // Aggressively chase player even in idle
                this.facePlayer(player);
                this.vx = this.facingRight ? this.speed * 0.5 : -this.speed * 0.5;
                if (this.stateTimer > (this.phase === 2 ? 1.0 : 2.0)) {
                    const actions = ['attack', 'attack', 'teleport', 'firewave'];
                    if (this.phase === 2) actions.push('teleport', 'firewave');
                    this.state = actions[Math.floor(Math.random() * actions.length)];
                    this.stateTimer = 0;
                }
                break;
            case 'attack':
                this.facePlayer(player);
                this.vx = this.facingRight ? this.speed * 1.5 : -this.speed * 1.5;
                if (this.getDistanceToPlayer(player) < 120 && this.attackCooldown <= 0) {
                    this.isAttacking = true;
                    this.attackCooldown = this.attackCooldownMax;
                    this.playAnimation('attack');
                }
                if (this.stateTimer > 2) {
                    this.state = 'teleport';
                    this.stateTimer = 0;
                }
                break;
            case 'teleport':
                if (this.teleportCooldown <= 0) {
                    // Teleport close to player
                    const side = Math.random() > 0.5 ? 1 : -1;
                    this.x = player.x + side * (80 + Math.random() * 80);
                    this.y = player.y - 30;
                    this.teleportCooldown = this.phase === 2 ? 1.2 : 2;  // Doubled
                    ParticleSystem.magic(this.x + this.width / 2, this.y + this.height / 2);
                }
                // Immediately attack after teleport
                this.state = 'attack';
                this.stateTimer = 0;
                break;
            case 'firewave':
                this.vx = 0;
                if (!this.isAttacking && this.attackCooldown <= 0) {
                    this.isAttacking = true;
                    this.attackCooldown = this.attackCooldownMax;
                    this.playAnimation('attack');
                    // Fire wave of projectiles
                    const fireCount = this.phase === 2 ? 7 : 5;
                    for (let i = 0; i < fireCount; i++) {
                        const angle = (Math.PI / 4) + (i * Math.PI / (fireCount + 1));
                        const projVx = Math.cos(angle) * 180 * (this.facingRight ? 1 : -1);
                        const projVy = -Math.sin(angle) * 180;
                        if (projectiles) projectiles.push(new Projectile(
                            this.x + this.width / 2, this.y + 40, projVx, projVy, 'enemy', 'fireball'
                        ));
                    }
                }
                if (this.stateTimer > 0.8) {
                    this.state = 'idle';
                    this.stateTimer = 0;
                }
                break;
            case 'summon':
                this.vx = 0;
                // Summon handled by game.js
                this.summonRequested = true;
                this.state = 'attack';
                this.stateTimer = 0;
                break;
        }
    }
}

// Minotaur Boss - charges and stomps, ground-based brute
class Minotaur extends Boss {
    constructor(x, y) {
        super(x, y, 140, 140, 'minotaur');
        this.health = 120;     // Tripled from 40
        this.maxHealth = 120;  // Tripled from 40
        this.damage = 2;
        this.speed = 100;
        this.scoreValue = 3000;
        this.flying = false;
        this.attackCooldownMax = 2;
        this.hitboxOffsetX = 20;
        this.hitboxOffsetY = 20;
        this.hitboxWidth = 100;
        this.hitboxHeight = 110;
        this.state = 'idle';
        this.stateTimer = 0;
        this.chargeSpeed = 400;
        this.stompDone = false;
        this.chargeFacingRight = true;  // Direction lock for charge

        // Stun bar system - 3 melee hits to stun for 5 seconds
        this.meleeHitCount = 0;
        this.maxMeleeHits = 3;
        this.stunDuration = 5;
        this.isStunned = false;
        this.stunBarTimer = 0;  // Time until stun bar resets if not hit

        // Phase 2 transition effect
        this.inPhaseTransition = false;
        this.phaseTransitionTimer = 0;
        this.phaseTransitionDuration = 3;  // Flash red for 3 seconds
    }

    takeDamage(amount, isMelee = false) {
        if (this.isDead) return;

        // Track melee hits for stun bar (only when not already stunned)
        if (isMelee && !this.isStunned) {
            this.meleeHitCount++;
            this.stunBarTimer = 3;  // Reset decay timer

            // Check if stunned
            if (this.meleeHitCount >= this.maxMeleeHits) {
                this.isStunned = true;
                this.stunTimer = this.stunDuration;
                this.meleeHitCount = 0;
                this.vx = 0;
                this.vy = 0;
                this.isAttacking = false;
                this.state = 'idle';
                this.stateTimer = 0;
                FloatingText.addBossAbility('STUNNED!', '#ff8800');
            }
        }

        // Deal damage but only flinch from melee hits — ranged attacks don't interrupt AI
        this.health -= amount;
        if (isMelee) {
            this.isHurt = true;
            this.hurtTimer = 0.2;
        }
        if (this.health <= 0) this.die();
    }

    updateAI(deltaTime, player, projectiles) {
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
        if (this.isAttacking && this.isAnimationFinished()) this.isAttacking = false;

        // Decay stun bar if not hit recently
        if (this.stunBarTimer > 0 && !this.isStunned) {
            this.stunBarTimer -= deltaTime;
            if (this.stunBarTimer <= 0) {
                this.meleeHitCount = 0;  // Reset melee hit counter
            }
        }

        // Handle stun state
        if (this.isStunned) {
            this.stunTimer -= deltaTime;
            this.vx = 0;
            this.isAttacking = false;
            if (this.stunTimer <= 0) {
                this.isStunned = false;
                this.stunTimer = 0;
                this.meleeHitCount = 0;
            }
            return;  // Don't do any AI while stunned
        }

        this.stateTimer += deltaTime;

        // Phase 2 transition - flash red and pause
        if (this.inPhaseTransition) {
            this.phaseTransitionTimer -= deltaTime;
            this.vx = 0;
            this.isAttacking = false;
            if (this.phaseTransitionTimer <= 0) {
                this.inPhaseTransition = false;
            }
            return;  // Don't do AI during transition
        }

        // Phase 2 at half health - trigger transition
        if (this.health <= this.maxHealth / 2 && this.phase === 1) {
            this.phase = 2;
            this.inPhaseTransition = true;
            this.phaseTransitionTimer = this.phaseTransitionDuration;
            this.chargeSpeed = 500;
            this.state = 'idle';
            this.stateTimer = 0;
            FloatingText.addBossAbility('PHASE 2!', '#ff4444');
            ScreenEffects.shake(10, 0.5);
            ScreenEffects.flash('#ff0000', 0.3);
            return;
        }

        // Determine idle duration - half in phase 2 (twice as frequent attacks)
        const idleDuration = this.phase === 2 ? 0.75 : 1.5;

        switch (this.state) {
            case 'idle':
                // Only face player when not charging
                this.facePlayer(player);
                // Chase player slowly
                this.vx = this.facingRight ? this.speed * 0.4 : -this.speed * 0.4;
                if (this.stateTimer > idleDuration) {
                    // Phase 2: only charge attacks
                    if (this.phase === 2) {
                        this.state = 'charge';
                    } else {
                        // Phase 1: charge or stomp
                        const actions = ['charge', 'stomp'];
                        this.state = actions[Math.floor(Math.random() * actions.length)];
                    }
                    this.stateTimer = 0;
                    // Lock facing direction at start of charge
                    this.chargeFacingRight = this.facingRight;
                }
                break;
            case 'charge':
                // Keep facing direction locked during entire charge
                this.facingRight = this.chargeFacingRight;
                if (this.stateTimer < 0.5) {
                    // Wind up - stop and telegraph
                    this.vx = 0;
                    this.isAttacking = true;
                    this.playAnimation('attack');
                } else {
                    // Full speed charge - keep attack animation
                    this.isAttacking = true;
                    this.vx = this.facingRight ? this.chargeSpeed : -this.chargeSpeed;
                }
                if (this.stateTimer > 2.5) {
                    this.state = 'idle';
                    this.stateTimer = 0;
                    this.attackCooldown = this.attackCooldownMax;
                    this.isAttacking = false;
                }
                break;
            case 'stomp':
                this.vx = 0;
                if (this.stateTimer < 0.3) {
                    this.vy = -500;
                } else if (this.vy >= 0 && !this.stompDone && this.stateTimer > 0.5) {
                    this.stompDone = true;
                    this.isAttacking = true;
                    this.playAnimation('attack');
                    // Shockwave projectiles
                    if (projectiles) {
                        const count = this.phase === 2 ? 6 : 4;
                        for (let i = 0; i < count; i++) {
                            const dir = i < count / 2 ? -1 : 1;
                            const speed = 150 + (i % (count / 2)) * 80;
                            projectiles.push(new Projectile(
                                this.x + this.width / 2, this.y + this.height - 10,
                                dir * speed, -50, 'enemy', 'fireball'
                            ));
                        }
                    }
                    ScreenEffects.shake(8, 0.3);
                }
                if (this.stateTimer > 2) {
                    this.state = 'idle';
                    this.stateTimer = 0;
                    this.stompDone = false;
                    this.attackCooldown = this.attackCooldownMax;
                }
                break;
        }
    }

    draw(ctx, cameraX, cameraY) {
        // Phase transition red flash effect
        if (this.inPhaseTransition) {
            const time = Date.now() / 1000;
            const flash = Math.sin(time * 10) > 0;  // Fast flashing
            if (flash) {
                // Draw red tint overlay on sprite
                ctx.save();
                ctx.globalCompositeOperation = 'source-atop';
            }
            super.draw(ctx, cameraX, cameraY);
            if (flash) {
                // Draw red overlay
                const drawX = Math.floor(this.x - cameraX);
                const drawY = Math.floor(this.y - cameraY);
                ctx.globalCompositeOperation = 'source-over';
                ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                ctx.fillRect(drawX, drawY, this.width, this.height);
                ctx.restore();
            }
        } else {
            // Normal draw
            super.draw(ctx, cameraX, cameraY);
        }

        if (this.isDead || !this.visible) return;

        // Draw stun bar below health bar (orange)
        const barWidth = 80;
        const barHeight = 6;
        const barX = Math.floor(this.x + this.width / 2 - barWidth / 2 - cameraX);
        const barY = Math.floor(this.y - 5 - cameraY);  // Below health bar
        const stunRatio = this.meleeHitCount / this.maxMeleeHits;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

        // Stun bar fill (orange) - fills as hits accumulate
        ctx.fillStyle = '#ff8800';
        ctx.fillRect(barX, barY, barWidth * stunRatio, barHeight);

        // Border
        ctx.strokeStyle = '#ffaa44';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

        // Draw "STUNNED!" text when stunned
        if (this.isStunned) {
            const time = Date.now() / 1000;
            const flash = Math.sin(time * 8) > 0 ? 1 : 0.4;
            ctx.save();
            ctx.globalAlpha = flash;
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.fillStyle = '#ff8800';
            const textX = Math.floor(this.x + this.width / 2 - cameraX);
            const textY = barY - 10;
            ctx.strokeText('STUNNED!', textX, textY);
            ctx.fillText('STUNNED!', textX, textY);
            ctx.restore();
        }

        // Draw "ENRAGED!" text during phase transition
        if (this.inPhaseTransition) {
            const time = Date.now() / 1000;
            const flash = Math.sin(time * 6) > 0 ? 1 : 0.6;
            ctx.save();
            ctx.globalAlpha = flash;
            ctx.font = 'bold 22px sans-serif';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 4;
            ctx.fillStyle = '#ff2222';
            const textX = Math.floor(this.x + this.width / 2 - cameraX);
            const textY = Math.floor(this.y - 30 - cameraY);
            ctx.strokeText('ENRAGED!', textX, textY);
            ctx.fillText('ENRAGED!', textX, textY);
            ctx.restore();
        }
    }
}

// Headless Horseman Boss - gallops, throws head, summons skeletons
class HeadlessHorseman extends Boss {
    constructor(x, y) {
        super(x, y, 140, 140, 'headless_horseman');
        this.health = 50;      // Doubled from 25
        this.maxHealth = 50;   // Doubled from 25
        this.damage = 2;
        this.speed = 150;
        this.scoreValue = 4000;
        this.flying = false;
        this.attackCooldownMax = 2;
        this.hitboxOffsetX = 20;
        this.hitboxOffsetY = 20;
        this.hitboxWidth = 100;
        this.hitboxHeight = 110;
        this.state = 'idle';
        this.stateTimer = 0;
        this.gallopDirection = 1;
        this.spawnSkeletonRequested = false;
        // Skeleton spawn timer - spawns every 5 seconds
        this.skeletonSpawnTimer = 0;
        this.skeletonSpawnInterval = 5;
    }

    updateAI(deltaTime, player, projectiles) {
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
        if (this.isAttacking && this.isAnimationFinished()) this.isAttacking = false;

        this.stateTimer += deltaTime;
        this.facePlayer(player);

        // Skeleton spawn timer - spawn every 5 seconds
        this.skeletonSpawnTimer += deltaTime;
        if (this.skeletonSpawnTimer >= this.skeletonSpawnInterval) {
            this.skeletonSpawnTimer = 0;
            this.spawnSkeletonRequested = true;
        }

        // Phase 2 at half health
        if (this.health <= 25 && this.phase === 1) {
            this.phase = 2;
            this.attackCooldownMax = 1.2;
            this.speed = 200;
            this.skeletonSpawnInterval = 3;  // Faster spawns in phase 2
        }

        switch (this.state) {
            case 'idle':
                this.vx = this.facingRight ? this.speed * 0.3 : -this.speed * 0.3;
                if (this.stateTimer > 1.5) {
                    const actions = ['gallop', 'throw_head'];
                    if (this.phase === 2) actions.push('gallop', 'throw_head');
                    this.state = actions[Math.floor(Math.random() * actions.length)];
                    this.stateTimer = 0;
                }
                break;
            case 'gallop':
                // Full speed charge across arena
                this.vx = this.gallopDirection * this.speed * 1.5;
                this.facingRight = this.gallopDirection > 0;
                if (this.stateTimer > 2) {
                    this.gallopDirection *= -1;
                    this.state = 'idle';
                    this.stateTimer = 0;
                    this.attackCooldown = this.attackCooldownMax;
                }
                break;
            case 'throw_head':
                this.vx = 0;
                if (!this.isAttacking && this.attackCooldown <= 0) {
                    this.isAttacking = true;
                    this.attackCooldown = this.attackCooldownMax;
                    this.playAnimation('attack');
                    // Throw skull projectile(s)
                    if (projectiles) {
                        const dx = (player.x + player.width / 2) - (this.x + this.width / 2);
                        const dy = (player.y + player.height / 2) - (this.y + this.height / 2);
                        const len = Math.sqrt(dx * dx + dy * dy) || 1;
                        const speed = 220;
                        projectiles.push(new Projectile(
                            this.x + this.width / 2, this.y + 30,
                            (dx / len) * speed, (dy / len) * speed - 60, 'enemy', 'skull'
                        ));
                        // Phase 2: spread shot
                        if (this.phase === 2) {
                            projectiles.push(new Projectile(
                                this.x + this.width / 2, this.y + 30,
                                (dx / len) * speed + 60, (dy / len) * speed - 80, 'enemy', 'skull'
                            ));
                            projectiles.push(new Projectile(
                                this.x + this.width / 2, this.y + 30,
                                (dx / len) * speed - 60, (dy / len) * speed - 80, 'enemy', 'skull'
                            ));
                        }
                    }
                }
                if (this.stateTimer > 1) {
                    this.state = 'idle';
                    this.stateTimer = 0;
                }
                break;
            case 'summon':
                this.vx = 0;
                if (this.stateTimer < 0.5) {
                    this.isAttacking = true;
                    this.playAnimation('attack');
                } else {
                    this.spawnSkeletonRequested = true;
                    ScreenEffects.shake(4, 0.2);
                    this.state = 'idle';
                    this.stateTimer = 0;
                    this.attackCooldown = this.attackCooldownMax;
                }
                break;
        }
    }
}

// Pyromancer Boss - flying fire mage, casts fire spells
// Uses a SINGLE STATIC SPRITE - no animation at all to prevent flickering
class Pyromancer extends Boss {
    constructor(x, y) {
        super(x, y, 206, 206, 'pyromancer');  // 25% larger than original (150 * 1.375 ≈ 206)
        this.health = 25;
        this.maxHealth = 25;
        this.damage = 2;
        this.speed = 150;  // Speed for running away
        this.scoreValue = 5000;
        this.flying = true;
        this.attackCooldownMax = 1.0;
        this.hitboxOffsetX = 55;  // Scaled up proportionally
        this.hitboxOffsetY = 41;
        this.hitboxWidth = 96;
        this.hitboxHeight = 137;
        this.stateTimer = 0;
        this.facingRight = false;
        this.hoverPhase = 0;
        // Static sprite - NO animation
        this.staticSprite = null;
        this.spriteLoaded = false;
        // Gem-based vulnerability - starts floating, falls when gems destroyed
        this.isFloating = true;
        this.fallSpeed = 0;
        this.groundY = 294;  // Where to land (500 - 206 = 294)
        this.gemsDestroyed = false;
    }

    async loadAnimations() {
        // Load ONLY a single static image - no animation system at all
        try {
            const img = await Utils.loadImage('assets/sprites/evil_wizard/idle.png');
            // Extract just the first frame from the sprite sheet
            const config = SpriteLoader.spriteSheetConfigs.evil_wizard;
            const canvas = document.createElement('canvas');
            canvas.width = config.frameWidth;
            canvas.height = config.frameHeight;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            // Draw only the first frame (x=0)
            ctx.drawImage(img, 0, 0, config.frameWidth, config.frameHeight, 0, 0, config.frameWidth, config.frameHeight);
            // Convert to image
            const frameImg = new Image();
            frameImg.src = canvas.toDataURL();
            await new Promise(resolve => { frameImg.onload = resolve; });
            this.staticSprite = frameImg;
            this.spriteLoaded = true;
            console.log('Pyromancer static sprite loaded successfully');
        } catch (e) {
            console.warn('Failed to load Pyromancer sprite:', e);
        }
    }

    updateAI(deltaTime, player, projectiles) {
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
        this.stateTimer += deltaTime;
        this.hoverPhase += deltaTime * 2;

        // Check if all gems are destroyed (set by game.js)
        if (this.gemsDestroyed && this.isFloating) {
            this.isFloating = false;
            FloatingText.addBossAbility('POWER SOURCE DESTROYED!', '#44ff44');
            ScreenEffects.shake(8, 0.3);
        }

        if (this.isFloating) {
            // Follow player horizontally while floating
            const targetX = player.x + player.width / 2 - this.width / 2;
            this.x += (targetX - this.x) * 2 * deltaTime;
            // Float at top with gentle hover
            this.y = 60 + Math.sin(this.hoverPhase) * 8;
            this.vx = 0;
            this.vy = 0;
        } else {
            // Fall to ground first
            if (this.y < this.groundY) {
                this.fallSpeed += 400 * deltaTime;  // Gravity
                this.y += this.fallSpeed * deltaTime;
                if (this.y >= this.groundY) {
                    this.y = this.groundY;
                    this.fallSpeed = 0;
                    ScreenEffects.shake(10, 0.2);
                    FloatingText.addBossAbility('VULNERABLE!', '#ff4444');
                }
                this.vx = 0;
                this.vy = 0;
            } else {
                // On ground - run away from player!
                const playerCenterX = player.x + player.width / 2;
                const myCenterX = this.x + this.width / 2;

                // Run in opposite direction of player
                if (playerCenterX < myCenterX) {
                    this.vx = this.speed;  // Run right (away from player on left)
                    this.facingRight = true;
                } else {
                    this.vx = -this.speed;  // Run left (away from player on right)
                    this.facingRight = false;
                }

                // Keep on screen / within level bounds
                if (this.x < 50) {
                    this.x = 50;
                    this.vx = this.speed;  // Bounce back
                } else if (this.x > 1750) {
                    this.x = 1750;
                    this.vx = -this.speed;  // Bounce back
                }

                // Apply movement
                this.x += this.vx * deltaTime;
                this.vy = 0;
            }
        }

        // Phase 2 at half health
        if (this.health <= 12 && this.phase === 1) {
            this.phase = 2;
            this.attackCooldownMax = 0.6;
        }

        // Fire spells on cooldown (only while floating or on ground)
        if (this.attackCooldown <= 0 && projectiles) {
            this.attackCooldown = this.attackCooldownMax;
            const attackType = Math.random();

            if (attackType < 0.4) {
                const count = this.phase === 2 ? 5 : 3;
                for (let i = 0; i < count; i++) {
                    const angle = Math.PI / 2 + (i - (count - 1) / 2) * 0.3;
                    projectiles.push(new Projectile(
                        this.x + this.width / 2, this.y + this.height / 2,
                        Math.cos(angle) * 180, Math.sin(angle) * 180,
                        'enemy', 'fireball'
                    ));
                }
            } else if (attackType < 0.7) {
                const pillars = this.phase === 2 ? 5 : 3;
                for (let i = 0; i < pillars; i++) {
                    const px = player.x + (i - Math.floor(pillars / 2)) * 100;
                    projectiles.push(new Projectile(px, -20, 0, 220, 'enemy', 'fireball'));
                }
                ScreenEffects.shake(3, 0.15);
            } else {
                const count = this.phase === 2 ? 6 : 4;
                for (let i = 0; i < count; i++) {
                    const mx = player.x - 250 + Math.random() * 500;
                    projectiles.push(new Projectile(
                        mx, -20 - i * 30, (Math.random() - 0.5) * 30, 180 + Math.random() * 80,
                        'enemy', 'fireball'
                    ));
                }
                ScreenEffects.shake(4, 0.2);
            }
        }
    }

    moveWithCollision(deltaTime, level) {}

    // Override update - handle essential state, call AI, but skip animation cycling
    update(deltaTime, level, player, projectiles) {
        // Handle death
        if (this.isDead) {
            this.deathTimer += deltaTime;
            if (this.deathTimer > 1) {
                this.markedForRemoval = true;
            }
            return;
        }

        // Handle hurt timer (so hurt state clears properly)
        if (this.isHurt) {
            this.hurtTimer -= deltaTime;
            if (this.hurtTimer <= 0) {
                this.isHurt = false;
            }
        }

        // Handle stun timer
        if (this.stunTimer > 0) {
            this.stunTimer -= deltaTime;
            return; // Don't do AI when stunned
        }

        // Call AI update - this handles movement and attacking
        this.updateAI(deltaTime, player, projectiles);

        // Track attack state for visual feedback
        if (this.attackCooldown > this.attackCooldownMax - 0.3) {
            this.isAttacking = true;
        } else {
            this.isAttacking = false;
        }

        // NO animation updates - we use a static sprite
    }

    updateAnimation() {
        // Do nothing - no animation
    }

    // Custom draw that uses static sprite directly - no animation system
    draw(ctx, cameraX, cameraY) {
        const drawX = Math.floor(this.x - cameraX);
        const drawY = Math.floor(this.y - cameraY);

        ctx.save();

        // Death fade out
        if (this.isDead) {
            ctx.globalAlpha = Math.max(0, 1 - this.deathTimer);
        }
        // Hurt flash - blink effect
        else if (this.isHurt) {
            ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.02) * 0.3;
        }

        // Attack glow effect
        if (this.isAttacking && !this.isDead) {
            ctx.shadowColor = '#ff4400';
            ctx.shadowBlur = 20;
        }

        // Draw static sprite directly - no animation involved
        if (this.staticSprite) {
            ctx.drawImage(this.staticSprite, drawX, drawY, this.width, this.height);
        } else {
            // Fallback: draw a simple colored rectangle if sprite not loaded
            ctx.fillStyle = '#ff4400';
            ctx.fillRect(drawX, drawY, this.width, this.height);
        }

        ctx.restore();

        // Draw health bar centered above the character's head (not when dead)
        if (!this.isDead) {
            const barWidth = 100;
            const barHeight = 8;
            // Center the bar over the sprite
            const barX = Math.floor(drawX + this.width / 2 - barWidth / 2);
            // Position bar above the sprite
            const barY = Math.floor(drawY - 15);
            const healthRatio = this.health / this.maxHealth;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

            ctx.fillStyle = healthRatio > 0.5 ? '#44dd44' : healthRatio > 0.25 ? '#ddaa22' : '#dd3333';
            ctx.fillRect(barX, barY, barWidth * healthRatio, barHeight);
        }
    }
}

// Factory function
function createEnemy(type, x, y) {
    switch (type) {
        case 'slime':
        case 'baby_dragon': return new BabyDragon(x, y);
        case 'goblin': return new Goblin(x, y);
        case 'bat':
        case 'flying_eye': return new Bat(x, y);
        case 'skeleton': return new Skeleton(x, y);
        case 'skeleton_mage': return new SkeletonMage(x, y);
        case 'lizardman': return new Lizardman(x, y);
        case 'imp': return new Imp(x, y);
        case 'harpy': return new Harpy(x, y);
        case 'dragon': return new Dragon(x, y);
        case 'gargoyle': return new Gargoyle(x, y);
        case 'demon_lord': return new DemonLord(x, y);
        case 'minotaur': return new Minotaur(x, y);
        case 'headless_horseman': return new HeadlessHorseman(x, y);
        case 'pyromancer': return new Pyromancer(x, y);
        default: return new BabyDragon(x, y);
    }
}

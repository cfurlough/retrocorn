// Player class

class Player extends Sprite {
    constructor(x, y) {
        // Player sprite is 96x96
        super(x, y, 96, 96);

        // Physics
        this.vx = 0;
        this.vy = 0;
        this.speed = 250;
        this.jumpForce = -450;
        this.gravity = 1200;
        this.maxFallSpeed = 600;

        // State
        this.isGrounded = false;
        this.isJumping = false;
        this.canJump = true;
        this.jumpHoldTime = 0;
        this.maxJumpHoldTime = 0.2;  // Variable jump height

        // Combat
        this.health = 6;           // 6 HP = 3 hearts
        this.maxHealth = 6;
        this.isAttacking = false;
        this.isShooting = false;
        this.attackCooldown = 0;
        this.shootCooldown = 0;
        this.attackDuration = 0;
        this.meleeDamage = 2;
        this.meleeRange = 40;
        this.projectileDamage = 1;

        // Power-up related
        this.hasShield = false;
        this.rapidFire = false;
        this.magnetActive = false;

        // Invincibility after taking damage
        this.invincible = false;
        this.invincibleTimer = 0;
        this.invincibleDuration = 1.5;
        this.flickerTimer = 0;

        // Death
        this.isDead = false;
        this.deathTimer = 0;

        // Hitbox - aligned with visual unicorn position in sprite
        this.hitboxOffsetX = 32;
        this.hitboxOffsetY = 12;
        this.hitboxWidth = 32;
        this.hitboxHeight = 48;

        // Moving platform tracking
        this.currentMovingPlatform = null;
    }

    async loadAnimations(variant = 'rainbow') {
        const anims = await SpriteLoader.loadPlayerAnimations(variant);

        this.addAnimation('idle', anims.idle, 6, true);
        this.addAnimation('run', anims.run, 10, true);
        this.addAnimation('jump', anims.jump, 12, false);  // Smoother jump animation
        this.addAnimation('fall', anims.fall, 10, true);
        this.addAnimation('attack', anims.attack, 15, false);
        this.addAnimation('shoot', anims.shoot, 12, false);
        this.addAnimation('hurt', anims.hurt, 10, false);
        this.addAnimation('death', anims.death, 6, false);

        this.playAnimation('idle');
    }

    update(deltaTime, level, projectiles) {
        if (this.isDead) {
            this.updateDeath(deltaTime);
            return;
        }

        // Update cooldowns
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
        if (this.shootCooldown > 0) this.shootCooldown -= deltaTime;
        if (this.attackDuration > 0) this.attackDuration -= deltaTime;

        // Update invincibility
        if (this.invincible) {
            this.invincibleTimer -= deltaTime;
            this.flickerTimer += deltaTime;

            // Flicker effect
            this.visible = Math.sin(this.flickerTimer * 20) > 0;

            if (this.invincibleTimer <= 0) {
                this.invincible = false;
                this.visible = true;
            }
        }

        // Handle input
        this.handleInput(deltaTime, projectiles);

        // Apply gravity
        this.vy += this.gravity * deltaTime;
        if (this.vy > this.maxFallSpeed) {
            this.vy = this.maxFallSpeed;
        }

        // Variable jump height - cut jump short if button released
        if (this.isJumping && !Input.jump) {
            if (this.vy < -200) {
                this.vy = -200;
            }
            this.isJumping = false;
        }

        // Move and handle collisions
        this.moveWithCollision(deltaTime, level);

        // Apply moving platform movement if standing on one
        if (this.isGrounded) {
            const movingPlat = level.getMovingPlatformUnderPlayer(this.getHitbox(), this.currentMovingPlatform);
            if (movingPlat && movingPlat.deltaX !== undefined) {
                this.currentMovingPlatform = movingPlat;

                // Apply platform movement
                this.x += movingPlat.deltaX;
                this.y += movingPlat.deltaY;

                // Keep player snapped to platform surface
                this.y = movingPlat.y - this.hitboxHeight - this.hitboxOffsetY;

                // Keep player within platform bounds horizontally
                const hitbox = this.getHitbox();
                if (hitbox.x < movingPlat.x) {
                    this.x = movingPlat.x - this.hitboxOffsetX;
                } else if (hitbox.x + hitbox.width > movingPlat.x + movingPlat.width) {
                    this.x = movingPlat.x + movingPlat.width - hitbox.width - this.hitboxOffsetX;
                }
            } else {
                this.currentMovingPlatform = null;
            }
        } else {
            this.currentMovingPlatform = null;
        }

        // Call parent update for animation frames first
        super.update(deltaTime);

        // Update animation state (after parent update so frame overrides stick)
        this.updateAnimation();
    }

    handleInput(deltaTime, projectiles) {
        // Don't allow movement during melee attack (but can still shoot)
        if (this.isAttacking && this.attackDuration > 0) {
            this.vx = 0;
            // Still allow shooting during melee cooldown
            if (Input.shoot && this.shootCooldown <= 0) {
                this.fireProjectile(projectiles);
            }
            return;
        }

        // Reset attack states when animations finish
        if (this.isAttacking && this.attackDuration <= 0) {
            this.isAttacking = false;
        }
        if (this.isShooting && this.isAnimationFinished()) {
            this.isShooting = false;
        }

        // Horizontal movement
        this.vx = 0;
        if (Input.left) {
            this.vx = -this.speed;
            this.facingRight = false;
        }
        if (Input.right) {
            this.vx = this.speed;
            this.facingRight = true;
        }

        // Jumping
        if (Input.jumpPressed && this.isGrounded && this.canJump) {
            this.vy = this.jumpForce;
            this.isGrounded = false;
            this.isJumping = true;
            this.canJump = false;
            this.jumpHoldTime = 0;
            SoundManager.play('jump');
            ParticleSystem.dust(this.x + this.width / 2, this.y + this.height);
        }

        // Extended jump (hold button)
        if (Input.jump && this.isJumping && this.jumpHoldTime < this.maxJumpHoldTime) {
            this.jumpHoldTime += deltaTime;
            this.vy = this.jumpForce;
        }

        // Reset jump ability when grounded
        if (this.isGrounded) {
            this.canJump = true;
            this.isJumping = false;
        }

        // Melee attack
        if (Input.melee && this.attackCooldown <= 0) {
            this.isAttacking = true;
            this.attackCooldown = 0.4;
            this.attackDuration = 0.25;
            this.playAnimation('attack');
            SoundManager.play('melee');
        }

        // Shoot - can move while shooting
        if (Input.shoot && this.shootCooldown <= 0) {
            this.fireProjectile(projectiles);
        }
    }

    fireProjectile(projectiles) {
        this.isShooting = true;
        this.shootCooldown = this.rapidFire ? 0.1 : 0.25;  // Rapid fire power-up
        this.playAnimation('shoot');
        SoundManager.play('shoot');

        // Create projectile - spawn near unicorn's horn (upper part of hitbox)
        const projX = this.facingRight ?
            this.x + this.width - 10 :
            this.x - 22;
        const projY = this.y + this.hitboxOffsetY + 4;  // Near top of hitbox (horn level)
        const projVx = this.facingRight ? 500 : -500;

        const proj = new Projectile(projX, projY, projVx, 0, 'player');
        proj.damage = this.projectileDamage;
        projectiles.push(proj);
    }

    moveWithCollision(deltaTime, level) {
        // Store previous position for unstuck logic
        const prevX = this.x;
        const prevY = this.y;

        // Move horizontally
        this.x += this.vx * deltaTime;

        // Check horizontal collisions
        let hitbox = this.getHitbox();
        for (const platform of level.getAllPlatforms()) {
            if (this.rectIntersect(hitbox, platform)) {
                if (this.vx > 0) {
                    this.x = platform.x - this.hitboxWidth - this.hitboxOffsetX;
                } else if (this.vx < 0) {
                    this.x = platform.x + platform.width - this.hitboxOffsetX;
                } else {
                    // Not moving - find smallest push direction
                    const hitboxCenterX = hitbox.x + hitbox.width / 2;
                    const platCenterX = platform.x + platform.width / 2;
                    if (hitboxCenterX < platCenterX) {
                        this.x = platform.x - this.hitboxWidth - this.hitboxOffsetX;
                    } else {
                        this.x = platform.x + platform.width - this.hitboxOffsetX;
                    }
                }
                this.vx = 0;
                break;
            }
        }

        // Move vertically
        this.y += this.vy * deltaTime;
        this.isGrounded = false;

        // Check vertical collisions
        hitbox = this.getHitbox();
        for (const platform of level.getAllPlatforms()) {
            if (this.rectIntersect(hitbox, platform)) {
                if (this.vy > 0) {
                    this.y = platform.y - this.hitboxHeight - this.hitboxOffsetY;
                    this.vy = 0;
                    this.isGrounded = true;
                } else if (this.vy < 0) {
                    this.y = platform.y + platform.height - this.hitboxOffsetY;
                    this.vy = 0;
                } else {
                    // Not moving vertically - push up
                    this.y = platform.y - this.hitboxHeight - this.hitboxOffsetY;
                    this.isGrounded = true;
                }
                break;
            }
        }

        // Final stuck check with smarter resolution
        hitbox = this.getHitbox();
        for (const platform of level.getAllPlatforms()) {
            if (this.rectIntersect(hitbox, platform)) {
                // Calculate overlaps in all directions
                const overlapLeft = (hitbox.x + hitbox.width) - platform.x;
                const overlapRight = (platform.x + platform.width) - hitbox.x;
                const overlapTop = (hitbox.y + hitbox.height) - platform.y;
                const overlapBottom = (platform.y + platform.height) - hitbox.y;

                // Find minimum overlap and push out that direction
                const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

                if (minOverlap === overlapTop) {
                    this.y = platform.y - this.hitboxHeight - this.hitboxOffsetY - 1;
                    this.isGrounded = true;
                    this.vy = 0;
                } else if (minOverlap === overlapBottom) {
                    this.y = platform.y + platform.height - this.hitboxOffsetY + 1;
                    this.vy = 0;
                } else if (minOverlap === overlapLeft) {
                    this.x = platform.x - this.hitboxWidth - this.hitboxOffsetX - 1;
                } else {
                    this.x = platform.x + platform.width - this.hitboxOffsetX + 1;
                }
                break;
            }
        }

        // Keep player in bounds
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > level.width) {
            this.x = level.width - this.width;
        }

        // Fall death
        if (this.y > level.height + 100) {
            this.takeDamage(this.health);
        }
    }

    // Simple rect intersection helper
    rectIntersect(r1, r2) {
        return r1.x < r2.x + r2.width &&
               r1.x + r1.width > r2.x &&
               r1.y < r2.y + r2.height &&
               r1.y + r1.height > r2.y;
    }

    updateAnimation() {
        if (this.isDead) return;

        // Priority: attack > shoot > hurt > jump/fall > run > idle
        if (this.isAttacking && this.attackDuration > 0) {
            return;
        }

        if (this.isShooting && !this.isAnimationFinished()) {
            return;
        }

        if (!this.isGrounded) {
            if (this.vy < 0) {
                this.playAnimation('jump');
                // Hold first frame only — simple static jump pose
                const anim = this.animations['jump'];
                if (anim) anim.currentFrame = 0;
            } else {
                this.playAnimation('fall');
                // Hold first frame only — simple static fall pose
                const anim = this.animations['fall'];
                if (anim) anim.currentFrame = 0;
            }
        } else if (Math.abs(this.vx) > 0) {
            this.playAnimation('run');
        } else {
            this.playAnimation('idle');
        }
    }

    takeDamage(amount) {
        // Invulnerable during melee attack, normal invincibility, or death
        if (this.invincible || this.isDead || (this.isAttacking && this.attackDuration > 0)) return;

        this.health -= amount;

        if (this.health <= 0) {
            this.health = 0;
            this.die();
        } else {
            // Become invincible
            this.invincible = true;
            this.invincibleTimer = this.invincibleDuration;
            this.flickerTimer = 0;

            // Knockback
            this.vy = -200;
        }
    }

    die() {
        this.isDead = true;
        this.deathTimer = 0;
        this.playAnimation('death');
        this.vx = 0;
        this.vy = 0;
        SoundManager.play('death');
        ParticleSystem.explosion(this.x + this.width / 2, this.y + this.height / 2, '#ff69b4');
    }

    updateDeath(deltaTime) {
        this.deathTimer += deltaTime;
        super.update(deltaTime);
    }

    isDeathAnimationComplete() {
        return this.isDead && this.deathTimer > 1.5;
    }

    heal(amount) {
        this.health = Math.min(this.health + amount, this.maxHealth);
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.health = this.maxHealth;
        this.isDead = false;
        this.deathTimer = 0;
        this.invincible = false;
        this.visible = true;
        this.isGrounded = false;
        this.isJumping = false;
        this.isAttacking = false;
        this.isShooting = false;

        // Reset power-up states
        this.hasShield = false;
        this.rapidFire = false;
        this.magnetActive = false;
        this.projectileDamage = 1;
        this.meleeDamage = 2;
        if (this.originalStats) {
            this.speed = this.originalStats.speed;
        }

        this.playAnimation('idle');
    }

    getHitbox() {
        return {
            x: this.x + this.hitboxOffsetX,
            y: this.y + this.hitboxOffsetY,
            width: this.hitboxWidth,
            height: this.hitboxHeight
        };
    }

    getMeleeHitbox() {
        const hitbox = this.getHitbox();
        if (this.facingRight) {
            return {
                x: hitbox.x + hitbox.width,
                y: hitbox.y,
                width: this.meleeRange,
                height: hitbox.height
            };
        } else {
            return {
                x: hitbox.x - this.meleeRange,
                y: hitbox.y,
                width: this.meleeRange,
                height: hitbox.height
            };
        }
    }

    isMeleeActive() {
        return this.isAttacking && this.attackDuration > 0.1;
    }

    draw(ctx, cameraX, cameraY) {
        // Draw shield effect if active
        if (this.hasShield) {
            const centerX = this.x + this.width / 2 - cameraX;
            const centerY = this.y + this.height / 2 - cameraY;
            const time = Date.now() / 1000;

            ctx.save();
            ctx.globalAlpha = 0.3 + Math.sin(time * 4) * 0.1;
            const gradient = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, 50);
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.5, '#00aaff');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Call parent draw
        super.draw(ctx, cameraX, cameraY);

        // Draw melee slash effect
        if (this.isMeleeActive()) {
            const hitbox = this.getHitbox();
            const progress = 1 - (this.attackDuration - 0.1) / 0.15; // 0→1 over active window
            const cx = (this.facingRight ?
                hitbox.x + hitbox.width + this.meleeRange * 0.3 :
                hitbox.x - this.meleeRange * 0.3) - cameraX;
            const cy = hitbox.y + hitbox.height * 0.5 - cameraY;

            ctx.save();
            ctx.globalAlpha = 0.7 * (1 - progress * 0.5);

            // Rainbow slash arc
            const startAngle = this.facingRight ? -Math.PI * 0.6 : Math.PI * 0.4;
            const sweep = this.facingRight ? Math.PI * 1.2 : -Math.PI * 1.2;
            const arcEnd = startAngle + sweep * Math.min(progress * 1.5, 1);
            const radius = this.meleeRange * 0.8;

            // Glow
            ctx.shadowColor = '#ff69b4';
            ctx.shadowBlur = 12;

            // Draw arc slash
            ctx.lineWidth = 6 - progress * 3;
            const gradient = ctx.createConicGradient(startAngle, cx, cy);
            gradient.addColorStop(0, '#ff0066');
            gradient.addColorStop(0.25, '#ff69b4');
            gradient.addColorStop(0.5, '#ffaadd');
            gradient.addColorStop(0.75, '#ff69b4');
            gradient.addColorStop(1, '#ff0066');
            ctx.strokeStyle = gradient;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, startAngle, arcEnd);
            ctx.stroke();

            // Inner bright line
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#ffffff';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(cx, cy, radius * 0.85, startAngle, arcEnd);
            ctx.stroke();

            ctx.restore();

            // Spawn a few sparkle particles at the slash tip
            if (Math.random() < 0.5) {
                const tipX = cx + cameraX + Math.cos(arcEnd) * radius;
                const tipY = cy + cameraY + Math.sin(arcEnd) * radius;
                ParticleSystem.trail(tipX, tipY, '#ff69b4');
            }
        }
    }
}

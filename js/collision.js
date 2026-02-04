// Collision detection and handling

const Collision = {
    // Check player vs enemies
    checkPlayerEnemyCollisions(player, enemies) {
        if (player.isDead || player.invincible) return;

        const playerHitbox = player.getHitbox();

        for (const enemy of enemies) {
            if (enemy.isDead) continue;

            const enemyHitbox = enemy.getHitbox();

            if (Utils.rectIntersect(playerHitbox, enemyHitbox)) {
                // Check if player has shield
                if (player.hasShield) {
                    player.hasShield = false;
                    SoundManager.play('hit');
                    ScreenEffects.shake(5, 0.1);
                    ParticleSystem.sparkle(player.x + player.width / 2, player.y + player.height / 2);
                    return;
                }

                // Player takes damage from contact
                player.takeDamage(enemy.damage);
                SoundManager.play('hurt');
                ScreenEffects.onPlayerHit();
                ParticleSystem.blood(player.x + player.width / 2, player.y + player.height / 2);
                GameStats.damageTaken += enemy.damage;
                return;  // Only take one hit per frame
            }

            // Check if goblin is attacking
            if (enemy.type === 'goblin' && enemy.canDealDamage && enemy.canDealDamage()) {
                // Check melee range
                const attackRange = {
                    x: enemy.facingRight ? enemyHitbox.x + enemyHitbox.width : enemyHitbox.x - 40,
                    y: enemyHitbox.y,
                    width: 40,
                    height: enemyHitbox.height
                };

                if (Utils.rectIntersect(playerHitbox, attackRange)) {
                    if (player.hasShield) {
                        player.hasShield = false;
                        SoundManager.play('hit');
                        ScreenEffects.shake(5, 0.1);
                        return;
                    }
                    player.takeDamage(enemy.damage);
                    SoundManager.play('hurt');
                    ScreenEffects.onPlayerHit();
                    ParticleSystem.blood(player.x + player.width / 2, player.y + player.height / 2);
                    GameStats.damageTaken += enemy.damage;
                    return;
                }
            }
        }
    },

    // Check player melee vs enemies
    checkPlayerMeleeCollisions(player, enemies) {
        if (!player.isMeleeActive()) return [];

        const meleeHitbox = player.getMeleeHitbox();
        const hitEnemies = [];

        for (const enemy of enemies) {
            if (enemy.isDead || enemy.isHurt) continue;

            const enemyHitbox = enemy.getHitbox();

            if (Utils.rectIntersect(meleeHitbox, enemyHitbox)) {
                enemy.takeDamage(player.meleeDamage, true);
                hitEnemies.push(enemy);

                // Effects
                const hitX = enemyHitbox.x + enemyHitbox.width / 2;
                const hitY = enemyHitbox.y + enemyHitbox.height / 2;
                SoundManager.play('hit');
                ParticleSystem.blood(hitX, hitY);
                GameStats.damageDealt += player.meleeDamage;

                if (enemy.isBoss) {
                    ScreenEffects.onBossHit();
                } else {
                    ScreenEffects.onEnemyHit();
                }
            }
        }

        return hitEnemies;
    },

    // Check projectiles vs enemies
    checkProjectileEnemyCollisions(projectiles, enemies) {
        const results = [];

        for (let i = projectiles.length - 1; i >= 0; i--) {
            const projectile = projectiles[i];
            if (projectile.owner !== 'player') continue;

            const projBounds = projectile.getBounds();

            for (const enemy of enemies) {
                if (enemy.isDead) continue;

                const enemyHitbox = enemy.getHitbox();

                if (Utils.rectIntersect(projBounds, enemyHitbox)) {
                    enemy.takeDamage(projectile.damage);
                    projectile.markedForRemoval = true;
                    results.push({ enemy, projectile });

                    // Effects
                    const hitX = projBounds.x + projBounds.width / 2;
                    const hitY = projBounds.y + projBounds.height / 2;
                    SoundManager.play('hit');
                    ParticleSystem.magic(hitX, hitY);
                    GameStats.damageDealt += projectile.damage;

                    if (enemy.isBoss) {
                        ScreenEffects.onBossHit();
                    } else {
                        ScreenEffects.onEnemyHit();
                    }

                    break;  // Projectile can only hit one enemy
                }
            }
        }

        return results;
    },

    // Check projectiles vs player
    checkProjectilePlayerCollisions(projectiles, player) {
        if (player.isDead || player.invincible) return [];

        const playerHitbox = player.getHitbox();
        const results = [];

        for (let i = projectiles.length - 1; i >= 0; i--) {
            const projectile = projectiles[i];
            if (projectile.owner !== 'enemy') continue;

            const projBounds = projectile.getBounds();

            if (Utils.rectIntersect(projBounds, playerHitbox)) {
                // Check if player has shield
                if (player.hasShield) {
                    player.hasShield = false;
                    projectile.markedForRemoval = true;
                    SoundManager.play('hit');
                    ScreenEffects.shake(5, 0.1);
                    ParticleSystem.sparkle(projBounds.x, projBounds.y);
                    results.push(projectile);
                    continue;
                }

                player.takeDamage(projectile.damage);
                projectile.markedForRemoval = true;
                results.push(projectile);

                // Effects
                SoundManager.play('hurt');
                ScreenEffects.onPlayerHit();
                ParticleSystem.blood(player.x + player.width / 2, player.y + player.height / 2);
                GameStats.damageTaken += projectile.damage;
            }
        }

        return results;
    },

    // Check projectiles vs platforms
    checkProjectilePlatformCollisions(projectiles, platforms) {
        for (const projectile of projectiles) {
            const projBounds = projectile.getBounds();

            for (const platform of platforms) {
                if (Utils.rectIntersect(projBounds, platform)) {
                    projectile.markedForRemoval = true;
                    break;
                }
            }
        }
    }
};

// Level class and data with parallax background

class Level {
    constructor(data) {
        this.name = data.name || 'Unknown';
        this.width = data.width;
        this.height = data.height;
        this.platforms = data.platforms || [];
        this.enemySpawns = data.enemySpawns || [];
        this.playerStart = data.playerStart || { x: 100, y: 100 };
        this.levelEnd = data.levelEnd || null;
        this.pickups = data.pickups || [];
        this.gemSpawns = data.gemSpawns || [];  // Power gems for Pyromancer fight
        this.hazards = data.hazards || [];  // Spike plants and other hazards
        this.movingPlatforms = (data.movingPlatforms || []).map(p => ({
            ...p,
            startX: p.x,
            startY: p.y,
            timer: p.startOffset || 0  // Allow staggered start
        }));
        this.isBossLevel = data.isBossLevel || false;
        this.isFinalLevel = data.isFinalLevel || false;
        this.hasBossIntro = data.hasBossIntro || false;
        this.theme = data.theme || 'forest';  // forest, dragon_cave, demon_throne, crypt, caves, labyrinth, graveyard, volcanic
        this.bossType = data.bossType || null;
        this.bossName = data.bossName || null;
        this.bossSubtitle = data.bossSubtitle || null;

        // Background layers
        this.bgLayers = [];
        this.bgLoaded = false;

        // Generate decorations for themed levels
        this.decorations = [];
        this.generateDecorations();

        // Load background assets
        this.loadBackgrounds();
    }

    generateDecorations() {
        if (this.theme === 'dragon_cave') {
            // Treasure piles
            for (let i = 0; i < 8; i++) {
                this.decorations.push({
                    type: 'treasure',
                    x: 100 + Math.random() * (this.width - 200),
                    y: this.height - 100,
                    size: 30 + Math.random() * 40
                });
            }
            // Stalactites from ceiling
            for (let i = 0; i < 15; i++) {
                this.decorations.push({
                    type: 'stalactite',
                    x: Math.random() * this.width,
                    y: 0,
                    size: 20 + Math.random() * 50
                });
            }
            // Skull decorations
            for (let i = 0; i < 5; i++) {
                this.decorations.push({
                    type: 'skull',
                    x: 50 + Math.random() * (this.width - 100),
                    y: this.height - 110 - Math.random() * 20,
                    size: 20 + Math.random() * 15
                });
            }
        } else if (this.theme === 'demon_throne') {
            // Flame pillars
            for (let i = 0; i < 6; i++) {
                this.decorations.push({
                    type: 'flame_pillar',
                    x: 150 + i * (this.width - 300) / 5,
                    y: this.height - 100,
                    size: 60 + Math.random() * 20
                });
            }
            // Demon statues
            this.decorations.push({ type: 'demon_statue', x: 80, y: this.height - 100, size: 80 });
            this.decorations.push({ type: 'demon_statue', x: this.width - 160, y: this.height - 100, size: 80 });
            // Chains from ceiling
            for (let i = 0; i < 8; i++) {
                this.decorations.push({
                    type: 'chain',
                    x: 100 + Math.random() * (this.width - 200),
                    y: 0,
                    size: 80 + Math.random() * 100
                });
            }
            // Skulls scattered
            for (let i = 0; i < 10; i++) {
                this.decorations.push({
                    type: 'skull',
                    x: Math.random() * this.width,
                    y: this.height - 105 - Math.random() * 15,
                    size: 15 + Math.random() * 10
                });
            }
        } else if (this.theme === 'labyrinth') {
            // Stone pillars
            for (let i = 0; i < 8; i++) {
                this.decorations.push({
                    type: 'stone_pillar',
                    x: 120 + Math.random() * (this.width - 240),
                    y: this.height - 100,
                    size: 50 + Math.random() * 30
                });
            }
            // Wall torches
            for (let i = 0; i < 6; i++) {
                this.decorations.push({
                    type: 'wall_torch',
                    x: 100 + i * (this.width - 200) / 5,
                    y: 80 + Math.random() * 40,
                    size: 20
                });
            }
            // Skulls and bones
            for (let i = 0; i < 6; i++) {
                this.decorations.push({
                    type: 'skull',
                    x: Math.random() * this.width,
                    y: this.height - 108 - Math.random() * 15,
                    size: 15 + Math.random() * 10
                });
            }
        } else if (this.theme === 'graveyard') {
            // Gravestones
            for (let i = 0; i < 12; i++) {
                this.decorations.push({
                    type: 'gravestone',
                    x: 80 + Math.random() * (this.width - 160),
                    y: this.height - 100,
                    size: 30 + Math.random() * 25
                });
            }
            // Dead trees
            for (let i = 0; i < 5; i++) {
                this.decorations.push({
                    type: 'dead_tree',
                    x: 100 + Math.random() * (this.width - 200),
                    y: this.height - 100,
                    size: 80 + Math.random() * 40
                });
            }
            // Skulls
            for (let i = 0; i < 8; i++) {
                this.decorations.push({
                    type: 'skull',
                    x: Math.random() * this.width,
                    y: this.height - 105 - Math.random() * 10,
                    size: 12 + Math.random() * 8
                });
            }
        } else if (this.theme === 'volcanic') {
            // Lava pools
            for (let i = 0; i < 6; i++) {
                this.decorations.push({
                    type: 'lava_pool',
                    x: 100 + Math.random() * (this.width - 200),
                    y: this.height - 95,
                    size: 40 + Math.random() * 30
                });
            }
            // Flame pillars
            for (let i = 0; i < 5; i++) {
                this.decorations.push({
                    type: 'flame_pillar',
                    x: 120 + i * (this.width - 240) / 4,
                    y: this.height - 100,
                    size: 50 + Math.random() * 25
                });
            }
            // Stalactites
            for (let i = 0; i < 10; i++) {
                this.decorations.push({
                    type: 'stalactite',
                    x: Math.random() * this.width,
                    y: 0,
                    size: 25 + Math.random() * 40
                });
            }
        }
    }

    async loadBackgrounds() {
        const basePath = 'MagicCliffsGodot/MagicCliffsGodot/World/';

        // Background layer definitions (drawn in order: sky first, then clouds, then hills)
        const layerDefs = [
            { name: 'sky', file: 'sky.png', parallax: 0 },
            { name: 'clouds', file: 'clouds.png', parallax: 0.1 },
            { name: 'hills', file: 'far-grounds.png', parallax: 0.3 }
        ];

        for (const def of layerDefs) {
            try {
                const img = new Image();
                img.src = basePath + def.file;

                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = () => {
                        console.warn(`Failed to load ${def.file}`);
                        resolve(); // Continue anyway
                    };
                });

                if (img.complete && img.naturalWidth > 0) {
                    this.bgLayers.push({
                        name: def.name,
                        image: img,
                        parallax: def.parallax,
                        width: img.width,
                        height: img.height
                    });
                }
            } catch (e) {
                console.warn(`Error loading ${def.file}:`, e);
            }
        }

        this.bgLoaded = true;
    }

    update(deltaTime) {
        // Update moving platforms and track their movement delta
        for (const plat of this.movingPlatforms) {
            // Store previous position
            plat.prevX = plat.x;
            plat.prevY = plat.y;

            plat.timer += deltaTime;
            // Oscillate horizontally
            if (plat.moveX) {
                plat.x = plat.startX + Math.sin(plat.timer * (plat.speed || 1)) * plat.moveX;
            }
            // Oscillate vertically
            if (plat.moveY) {
                plat.y = plat.startY + Math.sin(plat.timer * (plat.speed || 1)) * plat.moveY;
            }

            // Calculate delta for this frame, clamped to prevent teleportation
            plat.deltaX = plat.x - plat.prevX;
            plat.deltaY = plat.y - plat.prevY;

            // Clamp delta to reasonable values (prevents teleportation on frame hiccups)
            const maxDelta = 15; // Maximum pixels per frame
            plat.deltaX = Math.max(-maxDelta, Math.min(maxDelta, plat.deltaX));
            plat.deltaY = Math.max(-maxDelta, Math.min(maxDelta, plat.deltaY));
        }
    }

    // Check if player is standing on a moving platform and return it
    getMovingPlatformUnderPlayer(playerHitbox, currentPlatform = null) {
        // If player was on a platform, check if they're still on it (with generous tolerance)
        if (currentPlatform) {
            const feetY = playerHitbox.y + playerHitbox.height;
            const stillOnPlatform = feetY >= currentPlatform.y - 10 && feetY <= currentPlatform.y + 12 &&
                playerHitbox.x + playerHitbox.width > currentPlatform.x - 5 &&
                playerHitbox.x < currentPlatform.x + currentPlatform.width + 5;
            if (stillOnPlatform) {
                return currentPlatform;
            }
        }

        // Otherwise check for any platform under player
        for (const plat of this.movingPlatforms) {
            const feetY = playerHitbox.y + playerHitbox.height;
            // More generous tolerance for initial landing
            const onPlatform = feetY >= plat.y - 8 && feetY <= plat.y + 10 &&
                playerHitbox.x + playerHitbox.width > plat.x &&
                playerHitbox.x < plat.x + plat.width;
            if (onPlatform) {
                return plat;
            }
        }
        return null;
    }

    // Get all platforms including moving ones (for collision detection)
    getAllPlatforms() {
        return [...this.platforms, ...this.movingPlatforms];
    }

    draw(ctx, cameraX, cameraY, canvasWidth, canvasHeight) {
        // Draw background
        this.drawBackground(ctx, cameraX, canvasWidth, canvasHeight);

        // Draw platforms
        this.drawPlatforms(ctx, cameraX, cameraY, canvasWidth, canvasHeight);

        // Draw hazards (spike plants)
        this.drawHazards(ctx, cameraX, cameraY);

        // Draw level end zone
        this.drawLevelEnd(ctx, cameraX, cameraY);

        // Draw pickups
        this.drawPickups(ctx, cameraX, cameraY);
    }

    drawHazards(ctx, cameraX, cameraY) {
        const time = Date.now() / 1000;

        for (const hazard of this.hazards) {
            const x = Math.floor(hazard.x - cameraX);
            const y = Math.floor(hazard.y - cameraY);

            if (hazard.type === 'spike_plant') {
                ctx.save();

                // Soft glow underneath (danger indicator)
                const glowGrad = ctx.createRadialGradient(
                    x + hazard.width / 2, y + hazard.height,
                    0,
                    x + hazard.width / 2, y + hazard.height,
                    hazard.width * 0.6
                );
                glowGrad.addColorStop(0, 'rgba(100, 200, 50, 0.3)');
                glowGrad.addColorStop(1, 'rgba(100, 200, 50, 0)');
                ctx.fillStyle = glowGrad;
                ctx.fillRect(x - 10, y, hazard.width + 20, hazard.height + 10);

                // Leafy base cluster
                ctx.fillStyle = '#1a3d12';
                for (let i = 0; i < 5; i++) {
                    const leafX = x + hazard.width * (0.2 + i * 0.15);
                    const leafAngle = (i - 2) * 0.3;
                    ctx.beginPath();
                    ctx.ellipse(leafX, y + hazard.height - 3, 8, 12, leafAngle, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Main spikes with curved shape
                const spikeCount = Math.floor(hazard.width / 12);
                for (let i = 0; i < spikeCount; i++) {
                    const spikeX = x + 8 + i * (hazard.width - 16) / Math.max(1, spikeCount - 1);
                    const baseHeight = hazard.height * 0.85;
                    const spikeHeight = baseHeight * (0.8 + Math.sin(i * 1.2 + 0.5) * 0.2);
                    const sway = Math.sin(time * 2 + i * 0.8) * 2;  // Gentle sway animation

                    // Dark outline/shadow
                    ctx.fillStyle = '#0d2008';
                    ctx.beginPath();
                    ctx.moveTo(spikeX - 5, y + hazard.height - 2);
                    ctx.quadraticCurveTo(spikeX - 3 + sway, y + hazard.height - spikeHeight * 0.6, spikeX + sway, y + hazard.height - spikeHeight - 2);
                    ctx.quadraticCurveTo(spikeX + 3 + sway, y + hazard.height - spikeHeight * 0.6, spikeX + 5, y + hazard.height - 2);
                    ctx.closePath();
                    ctx.fill();

                    // Main spike body with gradient
                    const gradient = ctx.createLinearGradient(spikeX - 4, y + hazard.height, spikeX + 4, y + hazard.height - spikeHeight);
                    gradient.addColorStop(0, '#1a4510');
                    gradient.addColorStop(0.3, '#2d6a1e');
                    gradient.addColorStop(0.7, '#4a9a35');
                    gradient.addColorStop(1, '#6bc450');

                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.moveTo(spikeX - 4, y + hazard.height - 4);
                    ctx.quadraticCurveTo(spikeX - 2 + sway, y + hazard.height - spikeHeight * 0.5, spikeX + sway, y + hazard.height - spikeHeight);
                    ctx.quadraticCurveTo(spikeX + 2 + sway, y + hazard.height - spikeHeight * 0.5, spikeX + 4, y + hazard.height - 4);
                    ctx.closePath();
                    ctx.fill();

                    // Highlight edge
                    ctx.strokeStyle = '#8fe070';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(spikeX - 2, y + hazard.height - 6);
                    ctx.quadraticCurveTo(spikeX - 1 + sway, y + hazard.height - spikeHeight * 0.6, spikeX + sway, y + hazard.height - spikeHeight + 2);
                    ctx.stroke();

                    // Sharp tip glow
                    ctx.fillStyle = '#b0ff80';
                    ctx.beginPath();
                    ctx.arc(spikeX + sway, y + hazard.height - spikeHeight + 1, 2, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Small thorns at base
                ctx.fillStyle = '#3d7a2e';
                for (let i = 0; i < spikeCount * 2; i++) {
                    const thornX = x + 4 + i * (hazard.width - 8) / (spikeCount * 2 - 1);
                    const thornHeight = 6 + Math.random() * 4;
                    ctx.beginPath();
                    ctx.moveTo(thornX - 2, y + hazard.height - 2);
                    ctx.lineTo(thornX, y + hazard.height - thornHeight);
                    ctx.lineTo(thornX + 2, y + hazard.height - 2);
                    ctx.fill();
                }

                ctx.restore();
            }
        }
    }

    drawLevelEnd(ctx, cameraX, cameraY) {
        if (!this.levelEnd) return;

        const x = Math.floor(this.levelEnd.x - cameraX);
        const y = Math.floor(this.levelEnd.y - cameraY);
        const w = this.levelEnd.width;
        const h = this.levelEnd.height;
        const time = Date.now() / 1000;

        // Special treasure hoard for dragon's lair
        if (this.theme === 'dragon_cave') {
            this.drawTreasureHoard(ctx, x, y, w, h, time);
            return;
        }

        // Default portal for all levels
        const pulse = Math.sin(time * 3) * 0.3 + 0.7;

        ctx.save();
        ctx.globalAlpha = pulse;

        // Outer glow
        const gradient = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, w);
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 165, 0, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - w/2, y - h/4, w * 2, h * 1.5);

        // Portal shape
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.ellipse(x + w/2, y + h/2, w/2, h/2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(x + w/2, y + h/2, w/4, h/4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // Pixel-art style treasure hoard for dragon's lair (matching reference image)
    drawTreasureHoard(ctx, x, y, w, h, time) {
        const cx = x + w / 2;
        const baseY = y + h + 10;
        const p = 2;  // Pixel size for chunky retro look

        ctx.save();
        ctx.imageSmoothingEnabled = false;

        // Color palette matching reference
        const GOLD_DARK = '#996600';
        const GOLD_MID = '#CC9900';
        const GOLD_MAIN = '#DDAA00';
        const GOLD_LIGHT = '#FFCC00';
        const GOLD_HIGHLIGHT = '#FFEE66';

        // Helper for pixel rectangles
        const px = (rx, ry, rw, rh, color) => {
            ctx.fillStyle = color;
            ctx.fillRect(Math.floor(rx), Math.floor(ry), rw, rh);
        };

        // Draw an isometric gold coin (like in reference)
        const drawCoin = (coinX, coinY, scale = 1) => {
            const s = scale;
            // Coin edge (dark bottom)
            px(coinX, coinY + 6*s, 12*p*s, 4*p*s, GOLD_DARK);
            // Coin face (elliptical top)
            px(coinX + 1*p*s, coinY, 10*p*s, 6*p*s, GOLD_MAIN);
            px(coinX + 2*p*s, coinY - 1*p*s, 8*p*s, 2*p*s, GOLD_MAIN);
            // Highlight
            px(coinX + 3*p*s, coinY + 1*p*s, 4*p*s, 2*p*s, GOLD_HIGHLIGHT);
        };

        // Draw a gold bar/ingot (trapezoid shape like reference)
        const drawBar = (bx, by, scale = 1) => {
            const s = scale;
            // Bottom shadow
            px(bx + 2*p*s, by + 10*p*s, 28*p*s, 4*p*s, GOLD_DARK);
            // Main body
            px(bx, by + 4*p*s, 32*p*s, 8*p*s, GOLD_MID);
            // Top face (lighter)
            px(bx + 2*p*s, by, 28*p*s, 6*p*s, GOLD_MAIN);
            // Top highlight
            px(bx + 4*p*s, by + 1*p, 12*p*s, 2*p*s, GOLD_HIGHLIGHT);
        };

        // Draw a goblet/chalice
        const drawGoblet = (gx, gy) => {
            // Cup bowl
            px(gx, gy, 16*p, 10*p, GOLD_MAIN);
            px(gx + 2*p, gy + 2*p, 12*p, 6*p, GOLD_LIGHT);
            // Stem
            px(gx + 6*p, gy + 10*p, 4*p, 12*p, GOLD_MID);
            // Base
            px(gx + 2*p, gy + 22*p, 12*p, 4*p, GOLD_MAIN);
            px(gx + 4*p, gy + 22*p, 6*p, 2*p, GOLD_HIGHLIGHT);
        };

        // Draw a gem
        const drawGem = (gx, gy, color, highlightColor) => {
            px(gx, gy + 2*p, 8*p, 6*p, color);
            px(gx + 2*p, gy, 4*p, 2*p, color);
            px(gx + 2*p, gy + 2*p, 2*p, 2*p, highlightColor);
        };

        // Draw treasure chest
        const drawChest = (chestX, chestY) => {
            // Chest body
            px(chestX, chestY + 14*p, 40*p, 20*p, '#553311');
            px(chestX + 2*p, chestY + 16*p, 36*p, 16*p, '#774422');
            // Open lid
            px(chestX - 2*p, chestY, 44*p, 16*p, '#774422');
            px(chestX, chestY + 2*p, 40*p, 12*p, '#996633');
            // Gold trim on chest
            px(chestX + 16*p, chestY + 14*p, 8*p, 4*p, GOLD_MAIN);
            px(chestX + 14*p, chestY + 24*p, 12*p, 4*p, GOLD_MAIN);
            // Gold inside chest
            px(chestX + 4*p, chestY + 16*p, 32*p, 8*p, GOLD_MAIN);
            px(chestX + 8*p, chestY + 14*p, 24*p, 4*p, GOLD_LIGHT);
        };

        // Subtle glow
        const glowPulse = Math.sin(time * 2) * 0.1 + 0.9;
        ctx.globalAlpha = 0.25 * glowPulse;
        ctx.fillStyle = '#FFDD00';
        ctx.beginPath();
        ctx.ellipse(cx, baseY - 30, 100, 35, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // === BACK LAYER ===
        // Scattered coins (back)
        drawCoin(cx - 80, baseY - 20, 0.8);
        drawCoin(cx + 70, baseY - 18, 0.8);
        drawCoin(cx - 50, baseY - 15, 0.7);

        // Gold bars (back)
        drawBar(cx - 70, baseY - 40, 0.8);
        drawBar(cx + 30, baseY - 38, 0.7);

        // === MIDDLE LAYER ===
        // Treasure chest (left side)
        drawChest(cx - 60, baseY - 60);

        // Goblet (right side)
        drawGoblet(cx + 50, baseY - 55);

        // Coins around chest
        drawCoin(cx - 75, baseY - 30, 1);
        drawCoin(cx - 10, baseY - 35, 1);
        drawCoin(cx + 20, baseY - 32, 0.9);

        // === FRONT LAYER ===
        // Main gold bar pile (center)
        drawBar(cx - 30, baseY - 30, 1);
        drawBar(cx - 15, baseY - 22, 0.9);

        // Front coins (stacked)
        drawCoin(cx - 45, baseY - 22, 1);
        drawCoin(cx - 35, baseY - 18, 1);
        drawCoin(cx - 25, baseY - 14, 1);
        drawCoin(cx + 5, baseY - 20, 1);
        drawCoin(cx + 18, baseY - 16, 1);
        drawCoin(cx + 35, baseY - 22, 0.9);
        drawCoin(cx + 55, baseY - 18, 0.9);

        // Scattered gems
        drawGem(cx - 20, baseY - 45, '#DD3333', '#FF8888');  // Red ruby
        drawGem(cx + 40, baseY - 40, '#3333DD', '#8888FF');  // Blue sapphire
        drawGem(cx + 10, baseY - 50, '#33DD33', '#88FF88');  // Green emerald
        drawGem(cx - 55, baseY - 48, '#DD33DD', '#FF88FF');  // Purple amethyst
        drawGem(cx + 65, baseY - 35, '#33DDDD', '#88FFFF');  // Cyan diamond

        // More front coins
        drawCoin(cx - 60, baseY - 10, 0.8);
        drawCoin(cx - 5, baseY - 8, 0.8);
        drawCoin(cx + 45, baseY - 10, 0.8);
        drawCoin(cx + 70, baseY - 8, 0.7);

        // Sparkle effects
        const sparkles = [
            { x: -50, y: -55 }, { x: 35, y: -48 }, { x: -25, y: -38 },
            { x: 55, y: -52 }, { x: 5, y: -42 }, { x: -70, y: -35 }
        ];
        for (let i = 0; i < sparkles.length; i++) {
            const sparkle = sparkles[i];
            const sparklePhase = time * 3 + i * 1.2;
            const sparkleAlpha = (Math.sin(sparklePhase) + 1) / 2;

            if (sparkleAlpha > 0.5) {
                const sx = cx + sparkle.x;
                const sy = baseY + sparkle.y;

                ctx.globalAlpha = sparkleAlpha;
                ctx.fillStyle = '#FFFFFF';
                // Cross sparkle
                px(sx - 4, sy - 1, 8, 2, '#FFFFFF');
                px(sx - 1, sy - 4, 2, 8, '#FFFFFF');
                px(sx - 1, sy - 1, 2, 2, '#FFFFCC');
            }
        }

        ctx.globalAlpha = 1;
        ctx.restore();
    }

    drawPickups(ctx, cameraX, cameraY) {
        const time = Date.now() / 1000;

        for (const pickup of this.pickups) {
            if (pickup.collected) continue;

            const x = Math.floor(pickup.x - cameraX);
            const y = Math.floor(pickup.y - cameraY) + Math.sin(time * 4 + pickup.x) * 5;

            ctx.save();

            if (pickup.type === 'heart') {
                // Red heart for health
                this.drawHeart(ctx, x, y, 24, '#FF4444');
            } else if (pickup.type === 'star') {
                // Yellow star for score
                this.drawStar(ctx, x, y, 20, '#FFD700');
            } else if (pickup.type === 'crystal') {
                // Purple crystal for bonus
                this.drawCrystal(ctx, x, y, 24, '#AA44FF');
            }

            ctx.restore();
        }
    }

    drawHeart(ctx, x, y, size, color) {
        const w = size * 0.9;  // Width of heart
        const h = size * 0.85; // Height of heart
        const topY = y - h * 0.3;

        // Main heart shape
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y + h * 0.4);  // Bottom point

        // Left curve
        ctx.bezierCurveTo(
            x - w * 0.55, y + h * 0.1,   // Control 1
            x - w * 0.55, topY - h * 0.2, // Control 2
            x, topY + h * 0.15            // Top center
        );

        // Right curve
        ctx.bezierCurveTo(
            x + w * 0.55, topY - h * 0.2, // Control 1
            x + w * 0.55, y + h * 0.1,    // Control 2
            x, y + h * 0.4                // Back to bottom
        );

        ctx.closePath();
        ctx.fill();

        // Dark outline
        ctx.strokeStyle = '#AA0000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Shine highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.ellipse(x - w * 0.2, topY + h * 0.1, size * 0.12, size * 0.08, -0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    drawStar(ctx, x, y, size, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI / 5) - Math.PI / 2;
            const px = x + Math.cos(angle) * size;
            const py = y + Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Inner highlight
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawCrystal(ctx, x, y, size, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size * 0.5, y);
        ctx.lineTo(x, y + size * 0.6);
        ctx.lineTo(x - size * 0.5, y);
        ctx.closePath();
        ctx.fill();

        // Highlight facet
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x - size * 0.5, y);
        ctx.lineTo(x, y - size * 0.2);
        ctx.closePath();
        ctx.fill();
    }

    drawBackground(ctx, cameraX, canvasWidth, canvasHeight) {
        // Draw themed backgrounds
        if (this.theme === 'dragon_cave') {
            this.drawDragonCaveBackground(ctx, cameraX, canvasWidth, canvasHeight);
            return;
        } else if (this.theme === 'demon_throne') {
            this.drawDemonThroneBackground(ctx, cameraX, canvasWidth, canvasHeight);
            return;
        } else if (this.theme === 'crypt') {
            this.drawCryptBackground(ctx, cameraX, canvasWidth, canvasHeight);
            return;
        } else if (this.theme === 'caves') {
            this.drawCavesBackground(ctx, cameraX, canvasWidth, canvasHeight);
            return;
        } else if (this.theme === 'labyrinth') {
            this.drawLabyrinthBackground(ctx, cameraX, canvasWidth, canvasHeight);
            return;
        } else if (this.theme === 'graveyard') {
            this.drawGraveyardBackground(ctx, cameraX, canvasWidth, canvasHeight);
            return;
        } else if (this.theme === 'volcanic') {
            this.drawVolcanicBackground(ctx, cameraX, canvasWidth, canvasHeight);
            return;
        }

        // Draw each background layer properly (default forest theme)
        for (const layer of this.bgLayers) {
            if (!layer.image) continue;

            const img = layer.image;
            const offsetX = Math.floor(cameraX * layer.parallax);

            if (layer.name === 'sky') {
                // Sky: stretch to fill entire canvas
                ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
            } else if (layer.name === 'clouds') {
                // Clouds: tile horizontally at top, scale to fit nicely
                const scale = canvasHeight / img.height;
                const scaledW = img.width * scale;
                const startX = -(offsetX % scaledW);

                for (let x = startX - scaledW; x < canvasWidth + scaledW; x += scaledW) {
                    ctx.drawImage(img, Math.floor(x), 0, scaledW, canvasHeight);
                }
            } else if (layer.name === 'hills') {
                // Hills: position at bottom, tile horizontally
                const scale = 1.5;
                const scaledW = img.width * scale;
                const scaledH = img.height * scale;
                const yPos = canvasHeight - scaledH + 20;
                const startX = -(offsetX % scaledW);

                for (let x = startX - scaledW; x < canvasWidth + scaledW; x += scaledW) {
                    ctx.drawImage(img, Math.floor(x), yPos, scaledW, scaledH);
                }
            }
        }
    }

    drawDragonCaveBackground(ctx, cameraX, canvasWidth, canvasHeight) {
        const time = Date.now() / 1000;

        // Dark cave gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        gradient.addColorStop(0, '#1a0a0a');
        gradient.addColorStop(0.3, '#2d1515');
        gradient.addColorStop(0.7, '#3d1a1a');
        gradient.addColorStop(1, '#4a2020');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Lava glow at bottom
        const lavaGlow = ctx.createLinearGradient(0, canvasHeight - 150, 0, canvasHeight);
        lavaGlow.addColorStop(0, 'rgba(255, 80, 0, 0)');
        lavaGlow.addColorStop(0.5, 'rgba(255, 100, 0, 0.2)');
        lavaGlow.addColorStop(1, 'rgba(255, 60, 0, 0.4)');
        ctx.fillStyle = lavaGlow;
        ctx.fillRect(0, canvasHeight - 150, canvasWidth, 150);

        // Flickering lava light effect
        const flicker = Math.sin(time * 8) * 0.1 + Math.sin(time * 12) * 0.05;
        ctx.fillStyle = `rgba(255, 100, 0, ${0.1 + flicker})`;
        ctx.fillRect(0, canvasHeight - 80, canvasWidth, 80);

        // Draw cave walls (parallax)
        const wallOffset = cameraX * 0.2;

        // Back cave wall texture
        ctx.fillStyle = '#2a1010';
        for (let x = -wallOffset % 200 - 200; x < canvasWidth + 200; x += 200) {
            // Irregular rock shapes
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + 100, 50 + Math.sin(x * 0.02) * 30);
            ctx.lineTo(x + 200, 20);
            ctx.lineTo(x + 200, canvasHeight);
            ctx.lineTo(x, canvasHeight);
            ctx.closePath();
            ctx.fill();
        }

        // Draw decorations
        this.drawDecorations(ctx, cameraX, canvasHeight, time);

        // Atmospheric particles (embers)
        ctx.fillStyle = '#ff6600';
        for (let i = 0; i < 20; i++) {
            const px = ((i * 137 + time * 30) % (canvasWidth + 100)) - 50;
            const py = canvasHeight - 50 - ((i * 73 + time * 50) % (canvasHeight - 100));
            const size = 2 + Math.sin(time * 3 + i) * 1;
            ctx.globalAlpha = 0.5 + Math.sin(time * 5 + i * 2) * 0.3;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    drawDemonThroneBackground(ctx, cameraX, canvasWidth, canvasHeight) {
        const time = Date.now() / 1000;

        // Dark hellish gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        gradient.addColorStop(0, '#0a0008');
        gradient.addColorStop(0.4, '#1a0515');
        gradient.addColorStop(0.7, '#2a0a1a');
        gradient.addColorStop(1, '#3a1020');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Hellfire glow at bottom
        const fireGlow = ctx.createLinearGradient(0, canvasHeight - 200, 0, canvasHeight);
        fireGlow.addColorStop(0, 'rgba(150, 0, 50, 0)');
        fireGlow.addColorStop(0.5, 'rgba(200, 50, 0, 0.15)');
        fireGlow.addColorStop(1, 'rgba(255, 100, 0, 0.3)');
        ctx.fillStyle = fireGlow;
        ctx.fillRect(0, canvasHeight - 200, canvasWidth, 200);

        // Pulsing demonic energy
        const pulse = Math.sin(time * 2) * 0.1 + 0.1;
        ctx.fillStyle = `rgba(150, 0, 100, ${pulse})`;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw throne room pillars (parallax)
        const pillarOffset = cameraX * 0.15;
        ctx.fillStyle = '#1a0a10';
        for (let x = -pillarOffset % 300 - 100; x < canvasWidth + 300; x += 300) {
            // Stone pillars
            ctx.fillRect(x, 0, 60, canvasHeight);
            ctx.fillStyle = '#2a1520';
            ctx.fillRect(x + 5, 0, 50, canvasHeight);
            ctx.fillStyle = '#1a0a10';
            // Pillar caps
            ctx.fillRect(x - 10, 0, 80, 30);
            ctx.fillRect(x - 10, canvasHeight - 80, 80, 80);
        }

        // Draw decorations
        this.drawDecorations(ctx, cameraX, canvasHeight, time);

        // Floating demonic particles
        ctx.fillStyle = '#ff00aa';
        for (let i = 0; i < 25; i++) {
            const px = ((i * 123 + time * 20) % (canvasWidth + 100)) - 50;
            const py = ((i * 89 + time * 15 + Math.sin(time + i) * 50) % canvasHeight);
            const size = 1.5 + Math.sin(time * 4 + i) * 0.8;
            ctx.globalAlpha = 0.4 + Math.sin(time * 3 + i * 2) * 0.2;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    drawCryptBackground(ctx, cameraX, canvasWidth, canvasHeight) {
        const time = Date.now() / 1000;

        // Dark blue-grey stone gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        gradient.addColorStop(0, '#0a0a14');
        gradient.addColorStop(0.3, '#12121e');
        gradient.addColorStop(0.7, '#1a1a28');
        gradient.addColorStop(1, '#101018');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Stone wall texture (parallax)
        const wallOffset = cameraX * 0.15;
        ctx.fillStyle = '#16161f';
        for (let x = -wallOffset % 120 - 120; x < canvasWidth + 120; x += 120) {
            // Stone brick rows
            for (let row = 0; row < canvasHeight; row += 40) {
                const stagger = (Math.floor(row / 40) % 2) * 60;
                ctx.fillStyle = row % 80 === 0 ? '#141420' : '#18182a';
                ctx.fillRect(x + stagger, row, 118, 38);
                // Mortar lines
                ctx.fillStyle = '#0e0e16';
                ctx.fillRect(x + stagger, row + 38, 118, 2);
                ctx.fillRect(x + stagger + 118, row, 2, 40);
            }
        }

        // Eerie green torchlight glow from above
        for (let i = 0; i < 5; i++) {
            const tx = (i * 180 + 90) - (wallOffset * 1.2) % 900;
            const flicker = Math.sin(time * 6 + i * 1.7) * 15 + Math.sin(time * 9 + i * 3) * 8;
            const glowRadius = 100 + flicker;
            const glow = ctx.createRadialGradient(tx, 30, 5, tx, 30, glowRadius);
            glow.addColorStop(0, 'rgba(80, 200, 120, 0.25)');
            glow.addColorStop(0.4, 'rgba(60, 180, 100, 0.1)');
            glow.addColorStop(1, 'rgba(40, 150, 80, 0)');
            ctx.fillStyle = glow;
            ctx.fillRect(tx - glowRadius, 0, glowRadius * 2, glowRadius * 2);
        }

        // Fog along the ground
        const fogGrad = ctx.createLinearGradient(0, canvasHeight - 120, 0, canvasHeight);
        fogGrad.addColorStop(0, 'rgba(100, 120, 140, 0)');
        fogGrad.addColorStop(0.5, 'rgba(100, 120, 140, 0.08)');
        fogGrad.addColorStop(1, 'rgba(80, 100, 120, 0.15)');
        ctx.fillStyle = fogGrad;
        ctx.fillRect(0, canvasHeight - 120, canvasWidth, 120);

        // Floating dust/bone particles
        ctx.fillStyle = '#aaaacc';
        for (let i = 0; i < 15; i++) {
            const px = ((i * 157 + time * 10) % (canvasWidth + 80)) - 40;
            const py = ((i * 97 + Math.sin(time * 0.8 + i) * 40 + time * 8) % canvasHeight);
            const size = 1 + Math.sin(time * 2 + i * 1.5) * 0.5;
            ctx.globalAlpha = 0.2 + Math.sin(time * 1.5 + i * 2) * 0.1;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        this.drawDecorations(ctx, cameraX, canvasHeight, time);
    }

    drawCavesBackground(ctx, cameraX, canvasWidth, canvasHeight) {
        const time = Date.now() / 1000;

        // Deep dark red-brown cave gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        gradient.addColorStop(0, '#0d0508');
        gradient.addColorStop(0.3, '#1a0a10');
        gradient.addColorStop(0.6, '#24101a');
        gradient.addColorStop(1, '#2e1520');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Stalactites from ceiling (parallax)
        const rockOffset = cameraX * 0.2;
        ctx.fillStyle = '#1a0810';
        for (let i = 0; i < 20; i++) {
            const sx = (i * 153) - (rockOffset % (153 * 20));
            const sHeight = 40 + Math.sin(i * 2.3) * 25 + Math.sin(i * 5.1) * 15;
            const sWidth = 15 + Math.sin(i * 1.7) * 8;
            // Stalactite triangle
            ctx.beginPath();
            ctx.moveTo(sx - sWidth, 0);
            ctx.lineTo(sx, sHeight);
            ctx.lineTo(sx + sWidth, 0);
            ctx.closePath();
            ctx.fill();
        }

        // Stalagmites from floor
        ctx.fillStyle = '#180810';
        for (let i = 0; i < 15; i++) {
            const sx = (i * 197 + 80) - (rockOffset % (197 * 15));
            const sHeight = 30 + Math.sin(i * 3.1) * 20;
            const sWidth = 12 + Math.sin(i * 2.1) * 6;
            ctx.beginPath();
            ctx.moveTo(sx - sWidth, canvasHeight);
            ctx.lineTo(sx, canvasHeight - sHeight);
            ctx.lineTo(sx + sWidth, canvasHeight);
            ctx.closePath();
            ctx.fill();
        }

        // Magma/lava pools glow from below
        const lavaGlow = ctx.createLinearGradient(0, canvasHeight - 100, 0, canvasHeight);
        lavaGlow.addColorStop(0, 'rgba(200, 50, 0, 0)');
        lavaGlow.addColorStop(0.6, 'rgba(200, 60, 10, 0.12)');
        lavaGlow.addColorStop(1, 'rgba(220, 80, 0, 0.25)');
        ctx.fillStyle = lavaGlow;
        ctx.fillRect(0, canvasHeight - 100, canvasWidth, 100);

        // Scattered lava pools with flicker
        for (let i = 0; i < 6; i++) {
            const poolX = (i * 220 + 100) - (rockOffset * 0.8) % 1320;
            const poolW = 60 + Math.sin(i * 2.7) * 20;
            const flicker = Math.sin(time * 5 + i * 2) * 0.08;
            const poolGlow = ctx.createRadialGradient(poolX, canvasHeight - 10, 5, poolX, canvasHeight - 10, poolW);
            poolGlow.addColorStop(0, `rgba(255, 120, 20, ${0.3 + flicker})`);
            poolGlow.addColorStop(0.5, `rgba(200, 60, 0, ${0.15 + flicker})`);
            poolGlow.addColorStop(1, 'rgba(150, 30, 0, 0)');
            ctx.fillStyle = poolGlow;
            ctx.fillRect(poolX - poolW, canvasHeight - poolW, poolW * 2, poolW);
        }

        // Floating embers and ash
        for (let i = 0; i < 18; i++) {
            const px = ((i * 143 + time * 25) % (canvasWidth + 100)) - 50;
            const py = canvasHeight - 30 - ((i * 83 + time * 40) % (canvasHeight - 60));
            const size = 1.5 + Math.sin(time * 3 + i) * 0.8;
            const isEmber = i % 3 !== 0;
            ctx.fillStyle = isEmber ? '#ff6620' : '#888888';
            ctx.globalAlpha = isEmber ? (0.5 + Math.sin(time * 5 + i * 2) * 0.3) : 0.2;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Dim red ambient pulsing
        const pulse = Math.sin(time * 1.5) * 0.03 + 0.03;
        ctx.fillStyle = `rgba(180, 40, 20, ${pulse})`;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        this.drawDecorations(ctx, cameraX, canvasHeight, time);
    }

    drawLabyrinthBackground(ctx, cameraX, canvasWidth, canvasHeight) {
        const time = Date.now() / 1000;

        // Dark stone gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        gradient.addColorStop(0, '#0d0d12');
        gradient.addColorStop(0.3, '#1a1a24');
        gradient.addColorStop(0.7, '#22222e');
        gradient.addColorStop(1, '#181820');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Stone brick wall texture (parallax)
        const wallOffset = cameraX * 0.15;
        for (let x = -wallOffset % 100 - 100; x < canvasWidth + 100; x += 100) {
            for (let row = 0; row < canvasHeight; row += 50) {
                const stagger = (Math.floor(row / 50) % 2) * 50;
                ctx.fillStyle = row % 100 === 0 ? '#1e1e28' : '#222230';
                ctx.fillRect(x + stagger, row, 98, 48);
                ctx.fillStyle = '#14141c';
                ctx.fillRect(x + stagger, row + 48, 98, 2);
                ctx.fillRect(x + stagger + 98, row, 2, 50);
            }
        }

        // Dim orange torchlight glow
        for (let i = 0; i < 4; i++) {
            const tx = (i * 220 + 110) - (wallOffset * 1.1) % 880;
            const flicker = Math.sin(time * 7 + i * 2.1) * 12 + Math.sin(time * 11 + i * 4) * 6;
            const glowRadius = 90 + flicker;
            const glow = ctx.createRadialGradient(tx, 50, 5, tx, 50, glowRadius);
            glow.addColorStop(0, 'rgba(255, 160, 60, 0.2)');
            glow.addColorStop(0.5, 'rgba(200, 100, 30, 0.08)');
            glow.addColorStop(1, 'rgba(150, 60, 10, 0)');
            ctx.fillStyle = glow;
            ctx.fillRect(tx - glowRadius, 0, glowRadius * 2, glowRadius * 2);
        }

        // Ground fog
        const fogGrad = ctx.createLinearGradient(0, canvasHeight - 100, 0, canvasHeight);
        fogGrad.addColorStop(0, 'rgba(80, 80, 100, 0)');
        fogGrad.addColorStop(0.6, 'rgba(80, 80, 100, 0.06)');
        fogGrad.addColorStop(1, 'rgba(60, 60, 80, 0.12)');
        ctx.fillStyle = fogGrad;
        ctx.fillRect(0, canvasHeight - 100, canvasWidth, 100);

        // Dust particles
        ctx.fillStyle = '#999999';
        for (let i = 0; i < 12; i++) {
            const px = ((i * 131 + time * 8) % (canvasWidth + 60)) - 30;
            const py = ((i * 89 + Math.sin(time * 0.6 + i) * 30 + time * 5) % canvasHeight);
            ctx.globalAlpha = 0.15 + Math.sin(time * 1.2 + i * 2) * 0.08;
            ctx.beginPath();
            ctx.arc(px, py, 1.2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        this.drawDecorations(ctx, cameraX, canvasHeight, time);
    }

    drawGraveyardBackground(ctx, cameraX, canvasWidth, canvasHeight) {
        const time = Date.now() / 1000;

        // Dark blue-purple night sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        gradient.addColorStop(0, '#050510');
        gradient.addColorStop(0.2, '#0a0a1a');
        gradient.addColorStop(0.5, '#0f0f22');
        gradient.addColorStop(0.8, '#141428');
        gradient.addColorStop(1, '#0a0a18');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Moon
        const moonX = canvasWidth * 0.75 - cameraX * 0.05;
        const moonY = 60;
        ctx.fillStyle = 'rgba(200, 210, 255, 0.08)';
        ctx.beginPath();
        ctx.arc(moonX, moonY, 80, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#dde4ff';
        ctx.beginPath();
        ctx.arc(moonX, moonY, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#c8d0ee';
        ctx.beginPath();
        ctx.arc(moonX - 5, moonY + 5, 6, 0, Math.PI * 2);
        ctx.fill();

        // Stars
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 30; i++) {
            const sx = (i * 127 + 50) % canvasWidth;
            const sy = (i * 73 + 20) % (canvasHeight * 0.4);
            const twinkle = Math.sin(time * 2 + i * 1.3) * 0.4 + 0.6;
            ctx.globalAlpha = twinkle * 0.6;
            ctx.beginPath();
            ctx.arc(sx, sy, 1, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Distant hill silhouettes (parallax)
        const hillOffset = cameraX * 0.1;
        ctx.fillStyle = '#0c0c1a';
        ctx.beginPath();
        ctx.moveTo(0, canvasHeight);
        for (let x = 0; x <= canvasWidth + 50; x += 50) {
            const y = canvasHeight - 120 - Math.sin((x + hillOffset) * 0.008) * 40 - Math.sin((x + hillOffset) * 0.015) * 20;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(canvasWidth, canvasHeight);
        ctx.closePath();
        ctx.fill();

        // Ground-level fog
        const fogGrad = ctx.createLinearGradient(0, canvasHeight - 150, 0, canvasHeight);
        fogGrad.addColorStop(0, 'rgba(120, 130, 180, 0)');
        fogGrad.addColorStop(0.4, 'rgba(100, 110, 160, 0.06)');
        fogGrad.addColorStop(1, 'rgba(80, 90, 140, 0.15)');
        ctx.fillStyle = fogGrad;
        ctx.fillRect(0, canvasHeight - 150, canvasWidth, 150);

        // Eerie green glow from ground
        const eerieGlow = ctx.createLinearGradient(0, canvasHeight - 60, 0, canvasHeight);
        eerieGlow.addColorStop(0, 'rgba(40, 200, 80, 0)');
        eerieGlow.addColorStop(1, `rgba(40, 200, 80, ${0.04 + Math.sin(time * 1.5) * 0.02})`);
        ctx.fillStyle = eerieGlow;
        ctx.fillRect(0, canvasHeight - 60, canvasWidth, 60);

        // Ghost wisps
        ctx.fillStyle = 'rgba(150, 180, 255, 0.15)';
        for (let i = 0; i < 6; i++) {
            const wx = ((i * 167 + time * 15) % (canvasWidth + 100)) - 50;
            const wy = canvasHeight - 100 - Math.sin(time * 1.2 + i * 2) * 30;
            ctx.beginPath();
            ctx.ellipse(wx, wy, 8 + Math.sin(time * 2 + i) * 3, 12, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        this.drawDecorations(ctx, cameraX, canvasHeight, time);
    }

    drawVolcanicBackground(ctx, cameraX, canvasWidth, canvasHeight) {
        const time = Date.now() / 1000;

        // Deep red-orange gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        gradient.addColorStop(0, '#1a0500');
        gradient.addColorStop(0.2, '#2a0a02');
        gradient.addColorStop(0.5, '#3a1005');
        gradient.addColorStop(0.8, '#4a1808');
        gradient.addColorStop(1, '#5a200a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Volcanic rock formations (parallax)
        const rockOffset = cameraX * 0.2;
        ctx.fillStyle = '#2a0800';
        for (let i = 0; i < 15; i++) {
            const sx = (i * 173) - (rockOffset % (173 * 15));
            const sHeight = 50 + Math.sin(i * 2.7) * 30;
            const sWidth = 18 + Math.sin(i * 1.9) * 10;
            ctx.beginPath();
            ctx.moveTo(sx - sWidth, 0);
            ctx.lineTo(sx, sHeight);
            ctx.lineTo(sx + sWidth, 0);
            ctx.closePath();
            ctx.fill();
        }

        // Lava glow at bottom
        const lavaGlow = ctx.createLinearGradient(0, canvasHeight - 120, 0, canvasHeight);
        lavaGlow.addColorStop(0, 'rgba(255, 80, 0, 0)');
        lavaGlow.addColorStop(0.3, 'rgba(255, 100, 10, 0.15)');
        lavaGlow.addColorStop(0.7, 'rgba(255, 120, 20, 0.3)');
        lavaGlow.addColorStop(1, 'rgba(255, 80, 0, 0.5)');
        ctx.fillStyle = lavaGlow;
        ctx.fillRect(0, canvasHeight - 120, canvasWidth, 120);

        // Flickering lava light
        const flicker = Math.sin(time * 6) * 0.08 + Math.sin(time * 10) * 0.04;
        ctx.fillStyle = `rgba(255, 100, 0, ${0.12 + flicker})`;
        ctx.fillRect(0, canvasHeight - 60, canvasWidth, 60);

        // Lava bubbles
        for (let i = 0; i < 8; i++) {
            const bx = ((i * 193 + time * 20) % (canvasWidth + 80)) - 40;
            const bubblePhase = (time * 0.8 + i * 0.7) % 3;
            if (bubblePhase < 1) {
                const by = canvasHeight - 20 - bubblePhase * 40;
                const bsize = 3 + Math.sin(i * 2.3) * 1.5;
                ctx.fillStyle = `rgba(255, 200, 50, ${0.6 - bubblePhase * 0.4})`;
                ctx.beginPath();
                ctx.arc(bx, by, bsize, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Embers rising
        ctx.fillStyle = '#ff6600';
        for (let i = 0; i < 22; i++) {
            const px = ((i * 127 + time * 30) % (canvasWidth + 80)) - 40;
            const py = canvasHeight - 40 - ((i * 67 + time * 55) % (canvasHeight - 80));
            const size = 1.5 + Math.sin(time * 4 + i) * 0.8;
            ctx.globalAlpha = 0.6 + Math.sin(time * 5 + i * 2) * 0.3;
            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Heat distortion ambient pulse
        const pulse = Math.sin(time * 1.8) * 0.04 + 0.04;
        ctx.fillStyle = `rgba(255, 60, 0, ${pulse})`;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        this.drawDecorations(ctx, cameraX, canvasHeight, time);
    }

    drawDecorations(ctx, cameraX, canvasHeight, time) {
        for (const deco of this.decorations) {
            const x = deco.x - cameraX;
            const y = deco.y;

            // Skip if off screen
            if (x < -100 || x > 900) continue;

            switch (deco.type) {
                case 'treasure':
                    this.drawTreasure(ctx, x, y, deco.size, time);
                    break;
                case 'stalactite':
                    this.drawStalactite(ctx, x, y, deco.size);
                    break;
                case 'skull':
                    this.drawSkull(ctx, x, y, deco.size);
                    break;
                case 'flame_pillar':
                    this.drawFlamePillar(ctx, x, y, deco.size, time);
                    break;
                case 'demon_statue':
                    this.drawDemonStatue(ctx, x, y, deco.size);
                    break;
                case 'chain':
                    this.drawChain(ctx, x, y, deco.size, time);
                    break;
                case 'stone_pillar':
                    this.drawStonePillar(ctx, x, y, deco.size);
                    break;
                case 'wall_torch':
                    this.drawWallTorch(ctx, x, y, deco.size, time);
                    break;
                case 'gravestone':
                    this.drawGravestone(ctx, x, y, deco.size);
                    break;
                case 'dead_tree':
                    this.drawDeadTree(ctx, x, y, deco.size);
                    break;
                case 'lava_pool':
                    this.drawLavaPool(ctx, x, y, deco.size, time);
                    break;
            }
        }
    }

    drawTreasure(ctx, x, y, size, time) {
        // Gold pile base
        ctx.fillStyle = '#8B7500';
        ctx.beginPath();
        ctx.ellipse(x, y, size, size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Gold coins
        ctx.fillStyle = '#FFD700';
        for (let i = 0; i < 8; i++) {
            const cx = x + (Math.random() - 0.5) * size * 1.5;
            const cy = y - Math.random() * size * 0.3;
            ctx.beginPath();
            ctx.ellipse(cx, cy, 6, 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Sparkle effect
        const sparkle = Math.sin(time * 5 + x) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 200, ${sparkle * 0.8})`;
        ctx.beginPath();
        ctx.arc(x + size * 0.3, y - size * 0.2, 3, 0, Math.PI * 2);
        ctx.fill();

        // Gems
        const gemColors = ['#ff0044', '#00ff88', '#4488ff'];
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = gemColors[i];
            const gx = x + (i - 1) * size * 0.4;
            const gy = y - size * 0.1;
            ctx.beginPath();
            ctx.moveTo(gx, gy - 8);
            ctx.lineTo(gx + 5, gy);
            ctx.lineTo(gx, gy + 4);
            ctx.lineTo(gx - 5, gy);
            ctx.closePath();
            ctx.fill();
        }
    }

    drawStalactite(ctx, x, y, size) {
        ctx.fillStyle = '#3a2a2a';
        ctx.beginPath();
        ctx.moveTo(x - size * 0.3, y);
        ctx.lineTo(x + size * 0.3, y);
        ctx.lineTo(x + size * 0.1, y + size * 0.7);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x - size * 0.1, y + size * 0.7);
        ctx.closePath();
        ctx.fill();

        // Highlight
        ctx.fillStyle = '#4a3a3a';
        ctx.beginPath();
        ctx.moveTo(x - size * 0.2, y);
        ctx.lineTo(x, y);
        ctx.lineTo(x - size * 0.05, y + size * 0.8);
        ctx.closePath();
        ctx.fill();
    }

    drawSkull(ctx, x, y, size) {
        // Skull base
        ctx.fillStyle = '#d0c8b0';
        ctx.beginPath();
        ctx.ellipse(x, y - size * 0.3, size * 0.5, size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Jaw
        ctx.beginPath();
        ctx.ellipse(x, y + size * 0.1, size * 0.35, size * 0.2, 0, 0, Math.PI);
        ctx.fill();

        // Eye sockets
        ctx.fillStyle = '#1a0a0a';
        ctx.beginPath();
        ctx.ellipse(x - size * 0.2, y - size * 0.35, size * 0.12, size * 0.15, 0, 0, Math.PI * 2);
        ctx.ellipse(x + size * 0.2, y - size * 0.35, size * 0.12, size * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nose hole
        ctx.beginPath();
        ctx.moveTo(x, y - size * 0.15);
        ctx.lineTo(x - size * 0.08, y);
        ctx.lineTo(x + size * 0.08, y);
        ctx.closePath();
        ctx.fill();
    }

    drawFlamePillar(ctx, x, y, size, time) {
        // Stone base
        ctx.fillStyle = '#2a1a1a';
        ctx.fillRect(x - size * 0.3, y - size, size * 0.6, size);
        ctx.fillStyle = '#3a2525';
        ctx.fillRect(x - size * 0.25, y - size + 5, size * 0.5, size - 10);

        // Fire bowl
        ctx.fillStyle = '#1a1010';
        ctx.beginPath();
        ctx.ellipse(x, y - size, size * 0.35, size * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Animated flames
        for (let i = 0; i < 5; i++) {
            const flameHeight = size * 0.4 + Math.sin(time * 8 + i * 2) * size * 0.15;
            const flameWidth = size * 0.15 + Math.sin(time * 6 + i * 3) * size * 0.05;
            const offsetX = (i - 2) * size * 0.12;

            const flameGradient = ctx.createLinearGradient(x + offsetX, y - size, x + offsetX, y - size - flameHeight);
            flameGradient.addColorStop(0, '#ff4400');
            flameGradient.addColorStop(0.5, '#ff8800');
            flameGradient.addColorStop(1, 'rgba(255, 200, 0, 0)');
            ctx.fillStyle = flameGradient;

            ctx.beginPath();
            ctx.moveTo(x + offsetX - flameWidth, y - size);
            ctx.quadraticCurveTo(x + offsetX, y - size - flameHeight, x + offsetX + flameWidth, y - size);
            ctx.closePath();
            ctx.fill();
        }
    }

    drawDemonStatue(ctx, x, y, size) {
        // Base
        ctx.fillStyle = '#1a0a10';
        ctx.fillRect(x, y - size, size * 0.8, size);

        // Body
        ctx.fillStyle = '#2a1520';
        ctx.beginPath();
        ctx.moveTo(x + size * 0.4, y - size);
        ctx.lineTo(x + size * 0.1, y - size * 0.3);
        ctx.lineTo(x + size * 0.7, y - size * 0.3);
        ctx.closePath();
        ctx.fill();

        // Head
        ctx.fillStyle = '#2a1520';
        ctx.beginPath();
        ctx.arc(x + size * 0.4, y - size * 0.75, size * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Horns
        ctx.fillStyle = '#1a0a10';
        ctx.beginPath();
        ctx.moveTo(x + size * 0.25, y - size * 0.85);
        ctx.lineTo(x + size * 0.1, y - size * 1.1);
        ctx.lineTo(x + size * 0.3, y - size * 0.8);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + size * 0.55, y - size * 0.85);
        ctx.lineTo(x + size * 0.7, y - size * 1.1);
        ctx.lineTo(x + size * 0.5, y - size * 0.8);
        ctx.fill();

        // Glowing eyes
        ctx.fillStyle = '#ff0044';
        ctx.beginPath();
        ctx.arc(x + size * 0.35, y - size * 0.77, 3, 0, Math.PI * 2);
        ctx.arc(x + size * 0.45, y - size * 0.77, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawChain(ctx, x, y, size, time) {
        const sway = Math.sin(time * 2 + x * 0.01) * 10;

        ctx.strokeStyle = '#4a4a4a';
        ctx.lineWidth = 4;

        // Chain links
        for (let i = 0; i < size; i += 12) {
            const linkX = x + sway * (i / size);
            ctx.beginPath();
            ctx.ellipse(linkX, y + i, 5, 8, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Hook at bottom
        ctx.fillStyle = '#3a3a3a';
        ctx.beginPath();
        ctx.arc(x + sway, y + size, 8, 0, Math.PI, false);
        ctx.fill();
    }

    drawStonePillar(ctx, x, y, size) {
        // Main pillar
        ctx.fillStyle = '#3a3a44';
        ctx.fillRect(x - size * 0.25, y - size, size * 0.5, size);

        // Pillar details
        ctx.fillStyle = '#4a4a55';
        ctx.fillRect(x - size * 0.2, y - size + 5, size * 0.4, size - 10);

        // Top cap
        ctx.fillStyle = '#2a2a34';
        ctx.fillRect(x - size * 0.35, y - size - 10, size * 0.7, 15);

        // Cracks
        ctx.strokeStyle = '#1a1a24';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - size * 0.1, y - size * 0.8);
        ctx.lineTo(x, y - size * 0.5);
        ctx.lineTo(x + size * 0.05, y - size * 0.2);
        ctx.stroke();
    }

    drawWallTorch(ctx, x, y, size, time) {
        // Torch bracket
        ctx.fillStyle = '#3a2a20';
        ctx.fillRect(x - 3, y, 6, 20);

        // Torch head
        ctx.fillStyle = '#2a1a10';
        ctx.beginPath();
        ctx.moveTo(x - 8, y + 20);
        ctx.lineTo(x + 8, y + 20);
        ctx.lineTo(x + 5, y + 35);
        ctx.lineTo(x - 5, y + 35);
        ctx.closePath();
        ctx.fill();

        // Flame
        const flameHeight = size * 1.2 + Math.sin(time * 10) * 4;
        const flameGrad = ctx.createLinearGradient(x, y + 20, x, y + 20 - flameHeight);
        flameGrad.addColorStop(0, '#ff6600');
        flameGrad.addColorStop(0.5, '#ffaa00');
        flameGrad.addColorStop(1, 'rgba(255, 200, 50, 0)');
        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.moveTo(x - 6, y + 20);
        ctx.quadraticCurveTo(x, y + 20 - flameHeight, x + 6, y + 20);
        ctx.closePath();
        ctx.fill();
    }

    drawGravestone(ctx, x, y, size) {
        // Base
        ctx.fillStyle = '#3a3a40';
        ctx.fillRect(x - size * 0.4, y - 5, size * 0.8, 8);

        // Stone body
        ctx.fillStyle = '#4a4a55';
        ctx.beginPath();
        ctx.moveTo(x - size * 0.35, y - 5);
        ctx.lineTo(x - size * 0.35, y - size * 0.7);
        ctx.quadraticCurveTo(x, y - size, x + size * 0.35, y - size * 0.7);
        ctx.lineTo(x + size * 0.35, y - 5);
        ctx.closePath();
        ctx.fill();

        // Cross or RIP text
        ctx.fillStyle = '#2a2a34';
        ctx.fillRect(x - 2, y - size * 0.75, 4, size * 0.4);
        ctx.fillRect(x - size * 0.15, y - size * 0.65, size * 0.3, 4);

        // Moss
        ctx.fillStyle = '#2a3a2a';
        ctx.beginPath();
        ctx.ellipse(x - size * 0.2, y - 6, size * 0.12, 4, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawDeadTree(ctx, x, y, size) {
        // Trunk
        ctx.fillStyle = '#2a1a15';
        ctx.beginPath();
        ctx.moveTo(x - size * 0.1, y);
        ctx.lineTo(x - size * 0.15, y - size * 0.6);
        ctx.lineTo(x + size * 0.15, y - size * 0.6);
        ctx.lineTo(x + size * 0.1, y);
        ctx.closePath();
        ctx.fill();

        // Branches
        ctx.strokeStyle = '#2a1a15';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x, y - size * 0.5);
        ctx.lineTo(x - size * 0.4, y - size * 0.8);
        ctx.moveTo(x - size * 0.25, y - size * 0.65);
        ctx.lineTo(x - size * 0.35, y - size * 0.55);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, y - size * 0.55);
        ctx.lineTo(x + size * 0.35, y - size * 0.75);
        ctx.moveTo(x + size * 0.2, y - size * 0.65);
        ctx.lineTo(x + size * 0.4, y - size * 0.6);
        ctx.stroke();

        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y - size * 0.6);
        ctx.lineTo(x - size * 0.15, y - size);
        ctx.lineTo(x + size * 0.1, y - size * 0.85);
        ctx.stroke();
    }

    drawLavaPool(ctx, x, y, size, time) {
        // Lava glow
        const glowSize = size * 1.5;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
        glow.addColorStop(0, 'rgba(255, 100, 0, 0.3)');
        glow.addColorStop(0.5, 'rgba(255, 60, 0, 0.15)');
        glow.addColorStop(1, 'rgba(200, 40, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.ellipse(x, y, glowSize, glowSize * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Lava surface
        ctx.fillStyle = '#ff4400';
        ctx.beginPath();
        ctx.ellipse(x, y, size * 0.8, size * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bright center
        ctx.fillStyle = '#ff8800';
        ctx.beginPath();
        ctx.ellipse(x, y, size * 0.5, size * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bubbles
        const bubblePhase = (time * 2) % 2;
        if (bubblePhase < 1) {
            ctx.fillStyle = `rgba(255, 200, 50, ${0.6 - bubblePhase * 0.5})`;
            const bx = x + Math.sin(time * 3) * size * 0.3;
            ctx.beginPath();
            ctx.arc(bx, y - bubblePhase * 8, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawPlatforms(ctx, cameraX, cameraY, canvasWidth, canvasHeight) {
        // Draw static platforms
        for (const platform of this.platforms) {
            this.drawSinglePlatform(ctx, platform, cameraX, cameraY, canvasWidth, canvasHeight);
        }

        // Draw moving platforms
        for (const platform of this.movingPlatforms) {
            this.drawSinglePlatform(ctx, platform, cameraX, cameraY, canvasWidth, canvasHeight, true);
        }
    }

    drawSinglePlatform(ctx, platform, cameraX, cameraY, canvasWidth, canvasHeight, isMoving = false) {
        // Skip if off screen
        if (platform.x + platform.width < cameraX ||
            platform.x > cameraX + canvasWidth ||
            platform.y + platform.height < cameraY ||
            platform.y > cameraY + canvasHeight) {
            return;
        }

        const x = Math.floor(platform.x - cameraX);
        const y = Math.floor(platform.y - cameraY);
        const w = platform.width;
        const h = platform.height;

        // Draw themed platforms for boss levels
        if (this.theme === 'dragon_cave') {
            if (platform.isGround) {
                this.drawCaveGroundPlatform(ctx, x, y, w, h);
            } else {
                this.drawCaveFloatingPlatform(ctx, x, y, w, h);
            }
        } else if (this.theme === 'demon_throne') {
            if (platform.isGround) {
                this.drawDemonGroundPlatform(ctx, x, y, w, h);
            } else {
                this.drawDemonFloatingPlatform(ctx, x, y, w, h);
            }
        } else if (this.theme === 'labyrinth') {
            if (platform.isGround) {
                this.drawLabyrinthGroundPlatform(ctx, x, y, w, h);
            } else {
                this.drawLabyrinthFloatingPlatform(ctx, x, y, w, h);
            }
        } else if (this.theme === 'graveyard') {
            if (platform.isGround) {
                this.drawGraveyardGroundPlatform(ctx, x, y, w, h);
            } else {
                this.drawGraveyardFloatingPlatform(ctx, x, y, w, h);
            }
        } else if (this.theme === 'volcanic') {
            if (platform.isGround) {
                this.drawVolcanicGroundPlatform(ctx, x, y, w, h);
            } else {
                this.drawVolcanicFloatingPlatform(ctx, x, y, w, h);
            }
        } else {
            if (platform.isGround) {
                this.drawGroundPlatform(ctx, x, y, w, h);
            } else {
                this.drawFloatingPlatform(ctx, x, y, w, h);
            }
        }

        // Add glow effect for moving platforms
        if (isMoving) {
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = '#ff6600';
            ctx.lineWidth = 2;
            ctx.strokeRect(x - 1, y - 1, w + 2, h + 2);
            ctx.restore();
        }
    }

    drawGroundPlatform(ctx, x, y, w, h) {
        // Dirt body
        ctx.fillStyle = '#4A3728';
        ctx.fillRect(x, y, w, h);

        // Dirt texture
        ctx.fillStyle = '#3D2D20';
        for (let dx = 8; dx < w - 8; dx += 20) {
            ctx.fillRect(x + dx, y + 16, 8, h - 24);
        }

        // Grass top
        ctx.fillStyle = '#5DAA32';
        ctx.fillRect(x, y, w, 14);

        // Grass highlight
        ctx.fillStyle = '#7EC850';
        ctx.fillRect(x, y, w, 6);

        // Grass edge tufts
        ctx.fillStyle = '#8FD860';
        for (let dx = 6; dx < w - 10; dx += 18) {
            ctx.beginPath();
            ctx.moveTo(x + dx, y);
            ctx.lineTo(x + dx + 5, y - 6);
            ctx.lineTo(x + dx + 10, y);
            ctx.fill();
        }

        // Dark bottom edge
        ctx.fillStyle = '#2A1A10';
        ctx.fillRect(x, y + h - 4, w, 4);

        // Side edges
        ctx.fillStyle = '#3A2818';
        ctx.fillRect(x, y + 14, 3, h - 18);
        ctx.fillRect(x + w - 3, y + 14, 3, h - 18);
    }

    drawFloatingPlatform(ctx, x, y, w, h) {
        // Rock body
        ctx.fillStyle = '#5D4837';
        ctx.beginPath();
        ctx.roundRect(x, y + 10, w, h - 10, 6);
        ctx.fill();

        // Rock highlight
        ctx.fillStyle = '#6D5847';
        ctx.fillRect(x + 4, y + 14, w - 8, h - 22);

        // Dark bottom
        ctx.fillStyle = '#3D2817';
        ctx.beginPath();
        ctx.roundRect(x + 2, y + h - 8, w - 4, 8, [0, 0, 4, 4]);
        ctx.fill();

        // Grass top
        ctx.fillStyle = '#5DAA32';
        ctx.beginPath();
        ctx.roundRect(x, y, w, 14, [6, 6, 0, 0]);
        ctx.fill();

        // Grass highlight
        ctx.fillStyle = '#7EC850';
        ctx.beginPath();
        ctx.roundRect(x + 2, y, w - 4, 6, [4, 4, 0, 0]);
        ctx.fill();

        // Small tufts
        ctx.fillStyle = '#8FD860';
        for (let dx = 10; dx < w - 14; dx += 22) {
            ctx.beginPath();
            ctx.moveTo(x + dx, y);
            ctx.lineTo(x + dx + 4, y - 5);
            ctx.lineTo(x + dx + 8, y);
            ctx.fill();
        }
    }

    // Dragon Cave themed platforms
    drawCaveGroundPlatform(ctx, x, y, w, h) {
        // Dark rocky ground
        ctx.fillStyle = '#3a2820';
        ctx.fillRect(x, y, w, h);

        // Rock texture variation
        ctx.fillStyle = '#2a1a15';
        for (let dx = 5; dx < w - 5; dx += 25) {
            ctx.fillRect(x + dx, y + 12, 12, h - 20);
        }

        // Top rocky edge (no grass - it's a cave!)
        ctx.fillStyle = '#4a3830';
        ctx.fillRect(x, y, w, 12);

        // Cracks/highlights
        ctx.fillStyle = '#5a4840';
        ctx.fillRect(x + 2, y + 2, w - 4, 4);

        // Glowing cracks (lava underneath)
        ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
        for (let dx = 15; dx < w - 20; dx += 40) {
            ctx.fillRect(x + dx, y + h - 6, 8, 6);
        }

        // Dark edges
        ctx.fillStyle = '#1a0a05';
        ctx.fillRect(x, y + h - 4, w, 4);
        ctx.fillRect(x, y + 12, 3, h - 16);
        ctx.fillRect(x + w - 3, y + 12, 3, h - 16);
    }

    drawCaveFloatingPlatform(ctx, x, y, w, h) {
        // Rocky floating platform
        ctx.fillStyle = '#3a2820';
        ctx.beginPath();
        ctx.roundRect(x, y + 8, w, h - 8, 4);
        ctx.fill();

        // Rock highlight
        ctx.fillStyle = '#4a3830';
        ctx.fillRect(x + 3, y + 12, w - 6, h - 18);

        // Top surface
        ctx.fillStyle = '#5a4840';
        ctx.beginPath();
        ctx.roundRect(x, y, w, 12, [4, 4, 0, 0]);
        ctx.fill();

        // Subtle highlight
        ctx.fillStyle = '#6a5850';
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, w - 4, 4, [2, 2, 0, 0]);
        ctx.fill();

        // Dark bottom
        ctx.fillStyle = '#2a1810';
        ctx.beginPath();
        ctx.roundRect(x + 2, y + h - 6, w - 4, 6, [0, 0, 3, 3]);
        ctx.fill();
    }

    // Demon Throne themed platforms
    drawDemonGroundPlatform(ctx, x, y, w, h) {
        // Dark obsidian-like ground
        ctx.fillStyle = '#1a0a10';
        ctx.fillRect(x, y, w, h);

        // Purple-ish rock texture
        ctx.fillStyle = '#2a1520';
        for (let dx = 8; dx < w - 8; dx += 30) {
            ctx.fillRect(x + dx, y + 14, 15, h - 22);
        }

        // Demonic rune-like top edge
        ctx.fillStyle = '#3a2030';
        ctx.fillRect(x, y, w, 14);

        // Glowing rune lines
        ctx.fillStyle = 'rgba(255, 0, 100, 0.4)';
        ctx.fillRect(x + 4, y + 4, w - 8, 2);

        // Occasional glowing rune marks
        for (let dx = 20; dx < w - 20; dx += 60) {
            ctx.fillStyle = 'rgba(255, 0, 100, 0.5)';
            ctx.beginPath();
            ctx.moveTo(x + dx, y + 8);
            ctx.lineTo(x + dx + 8, y + 12);
            ctx.lineTo(x + dx + 16, y + 8);
            ctx.stroke();
        }

        // Dark bottom with hellfire glow
        ctx.fillStyle = '#0a0005';
        ctx.fillRect(x, y + h - 5, w, 5);
        ctx.fillStyle = 'rgba(255, 50, 0, 0.2)';
        ctx.fillRect(x, y + h - 8, w, 8);
    }

    drawDemonFloatingPlatform(ctx, x, y, w, h) {
        // Dark demonic floating stone
        ctx.fillStyle = '#1a0a10';
        ctx.beginPath();
        ctx.roundRect(x, y + 6, w, h - 6, 4);
        ctx.fill();

        // Inner texture
        ctx.fillStyle = '#2a1520';
        ctx.fillRect(x + 3, y + 10, w - 6, h - 14);

        // Top surface with rune glow
        ctx.fillStyle = '#3a2030';
        ctx.beginPath();
        ctx.roundRect(x, y, w, 10, [4, 4, 0, 0]);
        ctx.fill();

        // Glowing edge
        ctx.fillStyle = 'rgba(255, 0, 100, 0.3)';
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, w - 4, 3, [2, 2, 0, 0]);
        ctx.fill();

        // Dark bottom
        ctx.fillStyle = '#0a0005';
        ctx.beginPath();
        ctx.roundRect(x + 2, y + h - 5, w - 4, 5, [0, 0, 2, 2]);
        ctx.fill();

        // Subtle hellfire underglow
        ctx.fillStyle = 'rgba(255, 50, 0, 0.15)';
        ctx.fillRect(x, y + h - 3, w, 3);
    }

    drawLabyrinthGroundPlatform(ctx, x, y, w, h) {
        // Dark stone floor
        ctx.fillStyle = '#2a2a34';
        ctx.fillRect(x, y, w, h);

        // Stone brick pattern
        for (let dx = 0; dx < w; dx += 40) {
            for (let dy = 10; dy < h - 5; dy += 25) {
                const stagger = (Math.floor(dy / 25) % 2) * 20;
                ctx.fillStyle = '#323240';
                ctx.fillRect(x + dx + stagger, y + dy, 38, 23);
                ctx.fillStyle = '#1a1a24';
                ctx.fillRect(x + dx + stagger, y + dy + 23, 38, 2);
            }
        }

        // Top edge - worn stone
        ctx.fillStyle = '#3a3a48';
        ctx.fillRect(x, y, w, 10);
        ctx.fillStyle = '#444455';
        ctx.fillRect(x, y, w, 4);

        // Dark bottom
        ctx.fillStyle = '#14141c';
        ctx.fillRect(x, y + h - 5, w, 5);
    }

    drawLabyrinthFloatingPlatform(ctx, x, y, w, h) {
        // Stone block platform
        ctx.fillStyle = '#2a2a34';
        ctx.beginPath();
        ctx.roundRect(x, y + 4, w, h - 4, 3);
        ctx.fill();

        // Inner stone texture
        ctx.fillStyle = '#323240';
        ctx.fillRect(x + 4, y + 8, w - 8, h - 12);

        // Top surface
        ctx.fillStyle = '#3a3a48';
        ctx.beginPath();
        ctx.roundRect(x, y, w, 8, [3, 3, 0, 0]);
        ctx.fill();

        // Highlight
        ctx.fillStyle = '#4a4a58';
        ctx.fillRect(x + 2, y + 2, w - 4, 2);

        // Dark bottom
        ctx.fillStyle = '#1a1a24';
        ctx.beginPath();
        ctx.roundRect(x + 2, y + h - 4, w - 4, 4, [0, 0, 2, 2]);
        ctx.fill();
    }

    drawGraveyardGroundPlatform(ctx, x, y, w, h) {
        // Dark earth
        ctx.fillStyle = '#1a1820';
        ctx.fillRect(x, y, w, h);

        // Dirt texture
        ctx.fillStyle = '#141218';
        for (let dx = 8; dx < w - 8; dx += 25) {
            ctx.fillRect(x + dx, y + 14, 12, h - 20);
        }

        // Dead grass top
        ctx.fillStyle = '#2a3025';
        ctx.fillRect(x, y, w, 12);
        ctx.fillStyle = '#3a4030';
        ctx.fillRect(x, y, w, 5);

        // Dead grass tufts
        ctx.fillStyle = '#3a3a30';
        for (let dx = 8; dx < w - 12; dx += 22) {
            ctx.beginPath();
            ctx.moveTo(x + dx, y);
            ctx.lineTo(x + dx + 4, y - 5);
            ctx.lineTo(x + dx + 8, y);
            ctx.fill();
        }

        // Dark bottom
        ctx.fillStyle = '#0a0810';
        ctx.fillRect(x, y + h - 5, w, 5);
    }

    drawGraveyardFloatingPlatform(ctx, x, y, w, h) {
        // Mossy stone
        ctx.fillStyle = '#2a2830';
        ctx.beginPath();
        ctx.roundRect(x, y + 5, w, h - 5, 4);
        ctx.fill();

        // Stone texture
        ctx.fillStyle = '#323038';
        ctx.fillRect(x + 4, y + 9, w - 8, h - 13);

        // Top with moss
        ctx.fillStyle = '#2a3428';
        ctx.beginPath();
        ctx.roundRect(x, y, w, 9, [4, 4, 0, 0]);
        ctx.fill();

        // Moss patches
        ctx.fillStyle = '#3a4535';
        ctx.fillRect(x + 3, y + 2, 15, 4);
        ctx.fillRect(x + w - 20, y + 3, 12, 3);

        // Dark bottom
        ctx.fillStyle = '#141218';
        ctx.beginPath();
        ctx.roundRect(x + 2, y + h - 4, w - 4, 4, [0, 0, 2, 2]);
        ctx.fill();
    }

    drawVolcanicGroundPlatform(ctx, x, y, w, h) {
        // Dark volcanic rock
        ctx.fillStyle = '#2a1810';
        ctx.fillRect(x, y, w, h);

        // Rock texture / cracks
        ctx.fillStyle = '#1a0a05';
        for (let dx = 12; dx < w - 10; dx += 30) {
            ctx.beginPath();
            ctx.moveTo(x + dx, y + 12);
            ctx.lineTo(x + dx + 5, y + h * 0.5);
            ctx.lineTo(x + dx - 3, y + h - 8);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#1a0a05';
            ctx.stroke();
        }

        // Scorched top
        ctx.fillStyle = '#3a2015';
        ctx.fillRect(x, y, w, 10);
        ctx.fillStyle = '#4a2818';
        ctx.fillRect(x, y, w, 4);

        // Lava glow cracks
        ctx.fillStyle = 'rgba(255, 100, 0, 0.25)';
        for (let dx = 20; dx < w - 20; dx += 60) {
            ctx.fillRect(x + dx, y + 10, 3, 15);
        }

        // Dark bottom with glow
        ctx.fillStyle = '#0a0500';
        ctx.fillRect(x, y + h - 6, w, 6);
        ctx.fillStyle = 'rgba(255, 80, 0, 0.2)';
        ctx.fillRect(x, y + h - 4, w, 4);
    }

    drawVolcanicFloatingPlatform(ctx, x, y, w, h) {
        // Volcanic rock
        ctx.fillStyle = '#2a1810';
        ctx.beginPath();
        ctx.roundRect(x, y + 5, w, h - 5, 4);
        ctx.fill();

        // Inner texture
        ctx.fillStyle = '#3a2218';
        ctx.fillRect(x + 4, y + 9, w - 8, h - 13);

        // Top surface
        ctx.fillStyle = '#4a2820';
        ctx.beginPath();
        ctx.roundRect(x, y, w, 9, [4, 4, 0, 0]);
        ctx.fill();

        // Hot edge glow
        ctx.fillStyle = 'rgba(255, 120, 0, 0.3)';
        ctx.fillRect(x + 2, y + 2, w - 4, 2);

        // Dark bottom with glow
        ctx.fillStyle = '#0a0500';
        ctx.beginPath();
        ctx.roundRect(x + 2, y + h - 5, w - 4, 5, [0, 0, 2, 2]);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 80, 0, 0.25)';
        ctx.fillRect(x + 4, y + h - 3, w - 8, 3);
    }
}

// Level data - 5 levels with increasing difficulty
const LEVELS = {
    // Level 1: Forest Meadow - Tutorial level with basic enemies
    level1: {
        name: "Forest Meadow",
        width: 2400,
        height: 600,
        playerStart: { x: 100, y: 380 },
        levelEnd: { x: 2300, y: 400, width: 80, height: 100 },
        platforms: [
            // Main ground sections
            { x: 0, y: 500, width: 550, height: 100, isGround: true },
            { x: 650, y: 500, width: 450, height: 100, isGround: true },
            { x: 1200, y: 500, width: 550, height: 100, isGround: true },
            { x: 1850, y: 500, width: 550, height: 100, isGround: true },

            // Floating platforms - first area
            { x: 180, y: 400, width: 120, height: 28 },
            { x: 400, y: 340, width: 100, height: 28 },
            { x: 280, y: 260, width: 110, height: 28 },

            // Bridge over gap
            { x: 570, y: 450, width: 60, height: 28 },

            // Middle area platforms
            { x: 720, y: 400, width: 100, height: 28 },
            { x: 900, y: 350, width: 120, height: 28 },
            { x: 1050, y: 400, width: 100, height: 28 },

            // Second area platforms
            { x: 1280, y: 400, width: 110, height: 28 },
            { x: 1450, y: 340, width: 130, height: 28 },

            // Final area
            { x: 1920, y: 380, width: 120, height: 28 },
            { x: 2100, y: 300, width: 150, height: 28 },
        ],
        enemySpawns: [
            { type: 'baby_dragon', x: 350, y: 430 },
            { type: 'baby_dragon', x: 480, y: 430 },
            { type: 'baby_dragon', x: 750, y: 430 },
            { type: 'goblin', x: 950, y: 420 },
            { type: 'baby_dragon', x: 1300, y: 430 },
            { type: 'goblin', x: 1500, y: 420 },
            { type: 'baby_dragon', x: 1980, y: 430 },
        ],
        pickups: [
            { type: 'heart', x: 300, y: 220 },
            { type: 'star', x: 920, y: 300 },
            { type: 'crystal', x: 2150, y: 250 },
        ]
    },

    // Level 2: Gargoyle's Lair - First boss level
    level2: {
        name: "Gargoyle's Lair",
        width: 1600,
        height: 600,
        playerStart: { x: 100, y: 380 },
        levelEnd: { x: 1500, y: 400, width: 80, height: 100 },
        isBossLevel: true,
        theme: 'castle',
        platforms: [
            // Continuous main arena ground - no holes
            { x: 0, y: 500, width: 1600, height: 100, isGround: true },

            // Stone platforms for dodging gargoyle swoops
            { x: 150, y: 400, width: 100, height: 32 },
            { x: 350, y: 320, width: 120, height: 32 },
            { x: 550, y: 380, width: 100, height: 32 },
            { x: 700, y: 280, width: 140, height: 32 },
            { x: 900, y: 350, width: 120, height: 32 },
            { x: 1100, y: 400, width: 100, height: 32 },
            { x: 1250, y: 300, width: 130, height: 32 },
            { x: 1400, y: 380, width: 100, height: 32 },
            // Higher platforms for aerial combat
            { x: 450, y: 200, width: 100, height: 28 },
            { x: 850, y: 180, width: 120, height: 28 },
        ],
        enemySpawns: [
            { type: 'skeleton', x: 300, y: 430 },
            { type: 'goblin', x: 600, y: 420 },
            { type: 'gargoyle', x: 1100, y: 200 }, // Boss
        ],
        pickups: [
            { type: 'heart', x: 770, y: 200 },
        ]
    },

    // Level 3: Skeleton Crypt - Ranged enemy focus
    level3: {
        name: "Skeleton Crypt",
        theme: 'crypt',
        width: 2800,
        height: 600,
        playerStart: { x: 100, y: 380 },
        levelEnd: { x: 2700, y: 400, width: 80, height: 100 },
        platforms: [
            // Ground sections with more gaps
            { x: 0, y: 500, width: 400, height: 100, isGround: true },
            { x: 500, y: 500, width: 350, height: 100, isGround: true },
            { x: 950, y: 500, width: 400, height: 100, isGround: true },
            { x: 1450, y: 500, width: 350, height: 100, isGround: true },
            { x: 1900, y: 500, width: 400, height: 100, isGround: true },
            { x: 2400, y: 500, width: 400, height: 100, isGround: true },

            // Multi-level platforms
            { x: 150, y: 380, width: 100, height: 28 },
            { x: 300, y: 280, width: 120, height: 28 },
            { x: 420, y: 420, width: 60, height: 28 },

            { x: 600, y: 380, width: 110, height: 28 },
            { x: 780, y: 300, width: 100, height: 28 },
            { x: 870, y: 420, width: 60, height: 28 },

            { x: 1050, y: 380, width: 120, height: 28 },
            { x: 1200, y: 280, width: 150, height: 28 },
            { x: 1370, y: 420, width: 60, height: 28 },

            { x: 1550, y: 350, width: 130, height: 28 },
            { x: 1700, y: 250, width: 120, height: 28 },
            { x: 1820, y: 420, width: 60, height: 28 },

            { x: 2000, y: 380, width: 100, height: 28 },
            { x: 2150, y: 300, width: 140, height: 28 },
            { x: 2320, y: 420, width: 60, height: 28 },

            { x: 2500, y: 350, width: 150, height: 28 },
            { x: 2650, y: 280, width: 100, height: 28 },
        ],
        enemySpawns: [
            { type: 'skeleton', x: 320, y: 210 },
            { type: 'goblin', x: 550, y: 420 },
            { type: 'skeleton', x: 800, y: 230 },
            { type: 'baby_dragon', x: 1000, y: 430 },
            { type: 'skeleton', x: 1220, y: 210 },
            { type: 'goblin', x: 1500, y: 420 },
            { type: 'skeleton', x: 1720, y: 180 },
            { type: 'harpy', x: 1950, y: 280 },
            { type: 'skeleton', x: 2170, y: 230 },
            { type: 'goblin', x: 2450, y: 420 },
        ],
        pickups: [
            { type: 'heart', x: 800, y: 250 },
            { type: 'star', x: 1550, y: 290 },
            { type: 'heart', x: 2170, y: 250 },
            { type: 'crystal', x: 2670, y: 230 },
        ]
    },

    // Level 4: Demon Caves - Flying enemy focus
    level4: {
        name: "Demon Caves",
        theme: 'caves',
        width: 3000,
        height: 600,
        playerStart: { x: 100, y: 380 },
        levelEnd: { x: 2900, y: 400, width: 80, height: 100 },
        platforms: [
            // Ground with large gaps
            { x: 0, y: 500, width: 350, height: 100, isGround: true },
            { x: 500, y: 500, width: 300, height: 100, isGround: true },
            { x: 1000, y: 500, width: 350, height: 100, isGround: true },
            { x: 1550, y: 500, width: 300, height: 100, isGround: true },
            { x: 2050, y: 500, width: 400, height: 100, isGround: true },
            { x: 2600, y: 500, width: 400, height: 100, isGround: true },

            // Vertical platforming sections
            { x: 200, y: 400, width: 100, height: 28 },
            { x: 100, y: 300, width: 100, height: 28 },
            { x: 250, y: 200, width: 100, height: 28 },

            { x: 380, y: 420, width: 80, height: 28 },
            { x: 420, y: 340, width: 80, height: 28 },

            { x: 600, y: 380, width: 100, height: 28 },
            { x: 750, y: 280, width: 120, height: 28 },
            { x: 880, y: 380, width: 80, height: 28 },

            { x: 1100, y: 380, width: 100, height: 28 },
            { x: 1250, y: 280, width: 150, height: 28 },
            { x: 1420, y: 350, width: 80, height: 28 },

            { x: 1600, y: 380, width: 100, height: 28 },
            { x: 1750, y: 280, width: 120, height: 28 },
            { x: 1900, y: 350, width: 100, height: 28 },

            { x: 2150, y: 380, width: 120, height: 28 },
            { x: 2300, y: 280, width: 140, height: 28 },
            { x: 2480, y: 350, width: 80, height: 28 },

            { x: 2700, y: 380, width: 100, height: 28 },
            { x: 2850, y: 300, width: 100, height: 28 },
        ],
        enemySpawns: [
            { type: 'imp', x: 200, y: 250 },
            { type: 'flying_eye', x: 350, y: 300 },
            { type: 'goblin', x: 550, y: 420 },
            { type: 'imp', x: 780, y: 200 },
            { type: 'harpy', x: 950, y: 320 },
            { type: 'skeleton', x: 1050, y: 430 },
            { type: 'imp', x: 1280, y: 200 },
            { type: 'flying_eye', x: 1500, y: 300 },
            { type: 'goblin', x: 1600, y: 420 },
            { type: 'imp', x: 1780, y: 200 },
            { type: 'skeleton', x: 2100, y: 430 },
            { type: 'harpy', x: 2250, y: 250 },
            { type: 'imp', x: 2500, y: 280 },
            { type: 'goblin', x: 2650, y: 420 },
        ],
        pickups: [
            { type: 'heart', x: 270, y: 150 },
            { type: 'star', x: 780, y: 230 },
            { type: 'heart', x: 1280, y: 230 },
            { type: 'star', x: 1780, y: 230 },
            { type: 'heart', x: 2330, y: 230 },
            { type: 'crystal', x: 2870, y: 250 },
        ]
    },

    // Level 5: Demon Lord's Throne - Final Boss level
    level5: {
        name: "Demon Lord's Throne",
        width: 1800,
        height: 600,
        playerStart: { x: 100, y: 380 },
        levelEnd: { x: 1700, y: 400, width: 80, height: 100 },
        isBossLevel: true,
        isFinalLevel: true,
        theme: 'demon_throne',
        bossType: 'demon_lord',
        bossName: 'DEMON LORD',
        bossSubtitle: '"Horns are SO overrated"',
        platforms: [
            // Arena ground
            { x: 0, y: 500, width: 500, height: 100, isGround: true },
            { x: 600, y: 500, width: 600, height: 100, isGround: true },
            { x: 1300, y: 500, width: 500, height: 100, isGround: true },

            // Elevated platforms for strategy
            { x: 150, y: 380, width: 120, height: 28 },
            { x: 350, y: 280, width: 100, height: 28 },

            { x: 520, y: 420, width: 60, height: 28 },

            { x: 700, y: 350, width: 150, height: 28 },
            { x: 900, y: 250, width: 180, height: 28 },
            { x: 1050, y: 350, width: 150, height: 28 },

            { x: 1220, y: 420, width: 60, height: 28 },

            { x: 1400, y: 380, width: 120, height: 28 },
            { x: 1550, y: 280, width: 100, height: 28 },
        ],
        hasBossIntro: true,  // Boss spawns via intro sequence, not at start
        enemySpawns: [
            { type: 'imp', x: 300, y: 360 },
            { type: 'imp', x: 500, y: 360 },
            { type: 'imp', x: 1200, y: 360 },
            { type: 'imp', x: 1450, y: 360 },
        ],
        pickups: [
            { type: 'heart', x: 370, y: 230 },
            { type: 'heart', x: 970, y: 200 },
            { type: 'heart', x: 1570, y: 230 },
        ]
    },

    // Pre-boss level 6a: Labyrinth Entrance - Lizardman enemies
    level6a: {
        name: "Labyrinth Entrance",
        width: 2000,
        height: 600,
        playerStart: { x: 100, y: 380 },
        levelEnd: { x: 1900, y: 400, width: 80, height: 100 },
        theme: 'labyrinth',
        platforms: [
            { x: 0, y: 500, width: 2000, height: 100, isGround: true },
        ],
        hazards: [
            { type: 'spike_plant', x: 350, y: 460, width: 60, height: 40, damage: 1 },
            { type: 'spike_plant', x: 800, y: 460, width: 55, height: 40, damage: 1 },
            { type: 'spike_plant', x: 1250, y: 460, width: 60, height: 40, damage: 1 },
            { type: 'spike_plant', x: 1650, y: 460, width: 55, height: 40, damage: 1 },
        ],
        enemySpawns: [
            { type: 'lizardman', x: 300, y: 420 },
            { type: 'lizardman', x: 550, y: 420 },
            { type: 'lizardman', x: 900, y: 420 },
            { type: 'lizardman', x: 1200, y: 420 },
            { type: 'lizardman', x: 1500, y: 420 },
            { type: 'lizardman', x: 1750, y: 420 },
        ],
        pickups: [
            { type: 'heart', x: 450, y: 450 },
            { type: 'star', x: 750, y: 450 },
            { type: 'heart', x: 1100, y: 450 },
            { type: 'star', x: 1400, y: 450 },
            { type: 'heart', x: 1650, y: 450 },
        ]
    },

    // Level 6: Minotaur's Labyrinth - Boss level (flat bridge arena)
    level6: {
        name: "Minotaur's Labyrinth",
        width: 2000,
        height: 600,
        playerStart: { x: 100, y: 380 },
        levelEnd: { x: 1900, y: 400, width: 80, height: 100 },
        isBossLevel: true,
        theme: 'labyrinth',
        bossType: 'minotaur',
        bossName: 'MINOTAUR',
        bossSubtitle: '"At least MY horn is useful"',
        hasBossIntro: true,
        platforms: [
            // Single flat bridge - no gaps, no elevated platforms
            { x: 0, y: 500, width: 2000, height: 100, isGround: true },
        ],
        hazards: [
            // Spike plants reduced by half (4 instead of 8)
            { type: 'spike_plant', x: 350, y: 460, width: 60, height: 40, damage: 1 },
            { type: 'spike_plant', x: 800, y: 460, width: 55, height: 40, damage: 1 },
            { type: 'spike_plant', x: 1250, y: 460, width: 60, height: 40, damage: 1 },
            { type: 'spike_plant', x: 1650, y: 460, width: 55, height: 40, damage: 1 },
        ],
        enemySpawns: [
            // No regular enemies - just the Minotaur boss
        ],
        pickups: [
            { type: 'heart', x: 550, y: 450 },
            { type: 'heart', x: 1000, y: 450 },
            { type: 'heart', x: 1450, y: 450 },
        ]
    },

    // Pre-boss level 7a: Graveyard Path - Skeleton enemies
    level7a: {
        name: "Graveyard Path",
        width: 2200,
        height: 600,
        playerStart: { x: 100, y: 380 },
        levelEnd: { x: 2100, y: 400, width: 80, height: 100 },
        theme: 'graveyard',
        platforms: [
            { x: 0, y: 500, width: 2200, height: 100, isGround: true },
            { x: 100, y: 380, width: 100, height: 28 },
            { x: 300, y: 300, width: 110, height: 28 },
            { x: 550, y: 350, width: 120, height: 28 },
            { x: 780, y: 280, width: 140, height: 28 },
            { x: 1050, y: 330, width: 130, height: 28 },
            { x: 1280, y: 260, width: 160, height: 28 },
            { x: 1500, y: 330, width: 130, height: 28 },
            { x: 1750, y: 280, width: 140, height: 28 },
            { x: 2000, y: 350, width: 100, height: 28 },
        ],
        enemySpawns: [
            { type: 'skeleton', x: 200, y: 430 },
            { type: 'skeleton', x: 450, y: 430 },
            { type: 'skeleton', x: 700, y: 430 },
            { type: 'skeleton', x: 950, y: 430 },
            { type: 'skeleton', x: 1200, y: 430 },
            { type: 'skeleton', x: 1450, y: 430 },
            { type: 'skeleton', x: 1700, y: 430 },
            { type: 'skeleton', x: 1950, y: 430 },
        ],
        pickups: [
            { type: 'heart', x: 340, y: 250 },
            { type: 'star', x: 830, y: 230 },
            { type: 'heart', x: 1340, y: 210 },
            { type: 'star', x: 1800, y: 230 },
        ]
    },

    // Level 7: Haunted Graveyard - Boss level
    level7: {
        name: "Haunted Graveyard",
        width: 2200,
        height: 600,
        playerStart: { x: 100, y: 380 },
        levelEnd: { x: 2100, y: 400, width: 80, height: 100 },
        isBossLevel: true,
        theme: 'graveyard',
        bossType: 'headless_horseman',
        bossName: 'HEADLESS HORSEMAN',
        bossSubtitle: '"I eat rainbow sparkles for breakfast"',
        hasBossIntro: true,
        platforms: [
            // Continuous ground - no holes
            { x: 0, y: 500, width: 2200, height: 100, isGround: true },

            // Floating tombstone platforms - raised higher to avoid blocking horseman
            { x: 100, y: 380, width: 100, height: 28 },
            { x: 300, y: 300, width: 110, height: 28 },

            { x: 550, y: 350, width: 120, height: 28 },
            { x: 780, y: 280, width: 140, height: 28 },

            { x: 1050, y: 330, width: 130, height: 28 },
            { x: 1280, y: 260, width: 160, height: 28 },
            { x: 1500, y: 330, width: 130, height: 28 },

            { x: 1750, y: 280, width: 140, height: 28 },
            { x: 2000, y: 350, width: 100, height: 28 },
        ],
        enemySpawns: [
            // Skeletons only (no bats or harpies)
            { type: 'skeleton', x: 200, y: 430 },
            { type: 'skeleton', x: 400, y: 430 },
            { type: 'skeleton', x: 650, y: 430 },
            { type: 'skeleton', x: 900, y: 430 },
            { type: 'skeleton', x: 1100, y: 430 },
            { type: 'skeleton', x: 1350, y: 430 },
            { type: 'skeleton', x: 1600, y: 430 },
            { type: 'skeleton', x: 1850, y: 430 },
        ],
        pickups: [
            { type: 'heart', x: 340, y: 250 },
            { type: 'star', x: 830, y: 230 },
            { type: 'heart', x: 1340, y: 210 },
            { type: 'crystal', x: 1800, y: 230 },
        ]
    },

    // Pre-boss level 8a: Forge Approach - Skeleton Mage enemies
    level8a: {
        name: "Forge Approach",
        width: 2000,
        height: 600,
        playerStart: { x: 100, y: 380 },
        levelEnd: { x: 1900, y: 400, width: 80, height: 100 },
        theme: 'volcanic',
        platforms: [
            { x: 0, y: 500, width: 2000, height: 100, isGround: true },
        ],
        enemySpawns: [
            { type: 'skeleton_mage', x: 300, y: 400 },
            { type: 'skeleton_mage', x: 600, y: 400 },
            { type: 'skeleton_mage', x: 900, y: 400 },
            { type: 'skeleton_mage', x: 1200, y: 400 },
            { type: 'skeleton_mage', x: 1500, y: 400 },
            { type: 'skeleton_mage', x: 1800, y: 400 },
        ],
        pickups: [
            { type: 'heart', x: 450, y: 350 },
            { type: 'star', x: 750, y: 350 },
            { type: 'heart', x: 1050, y: 350 },
            { type: 'star', x: 1350, y: 350 },
            { type: 'heart', x: 1700, y: 350 },
        ]
    },

    // Level 8: Volcanic Forge - Pyromancer boss (stationary with moving platforms)
    level8: {
        name: "Volcanic Forge",
        width: 2000,
        height: 600,
        playerStart: { x: 100, y: 380 },
        levelEnd: { x: 1900, y: 400, width: 80, height: 100 },
        isBossLevel: true,
        theme: 'volcanic',
        bossType: 'pyromancer',
        bossName: 'PYROMANCER',
        bossSubtitle: '"Time to make glue!"',
        hasBossIntro: true,
        platforms: [
            // Continuous ground - no holes
            { x: 0, y: 500, width: 2000, height: 100, isGround: true },
        ],
        movingPlatforms: [],
        enemySpawns: [],
        gemSpawns: [
            // 5 power gems on the floor - destroy all to bring down the Evil Wizard
            { x: 200, y: 436 },
            { x: 550, y: 436 },
            { x: 900, y: 436 },
            { x: 1250, y: 436 },
            { x: 1600, y: 436 },
        ],
        pickups: [
            { type: 'heart', x: 450, y: 350 },
            { type: 'heart', x: 1050, y: 350 },
            { type: 'heart', x: 1700, y: 350 },
        ]
    },

    // Keep test level for backwards compatibility
    test: {
        name: "Test Level",
        width: 2400,
        height: 600,
        playerStart: { x: 100, y: 380 },
        levelEnd: { x: 2300, y: 400, width: 80, height: 100 },
        platforms: [
            { x: 0, y: 500, width: 550, height: 100, isGround: true },
            { x: 650, y: 500, width: 450, height: 100, isGround: true },
            { x: 1200, y: 500, width: 550, height: 100, isGround: true },
            { x: 1850, y: 500, width: 550, height: 100, isGround: true },
            { x: 180, y: 400, width: 120, height: 28 },
            { x: 400, y: 340, width: 100, height: 28 },
            { x: 280, y: 260, width: 110, height: 28 },
            { x: 480, y: 200, width: 140, height: 28 },
            { x: 570, y: 450, width: 60, height: 28 },
            { x: 720, y: 400, width: 100, height: 28 },
            { x: 900, y: 350, width: 120, height: 28 },
            { x: 1050, y: 400, width: 100, height: 28 },
            { x: 1280, y: 400, width: 110, height: 28 },
            { x: 1450, y: 340, width: 130, height: 28 },
            { x: 1350, y: 250, width: 150, height: 28 },
            { x: 1580, y: 280, width: 120, height: 28 },
            { x: 1700, y: 200, width: 130, height: 28 },
            { x: 1920, y: 380, width: 120, height: 28 },
            { x: 2100, y: 300, width: 150, height: 28 },
            { x: 2280, y: 220, width: 100, height: 28 },
        ],
        enemySpawns: [
            { type: 'baby_dragon', x: 350, y: 430 },
            { type: 'goblin', x: 480, y: 420 },
            { type: 'baby_dragon', x: 500, y: 130 },
            { type: 'baby_dragon', x: 750, y: 430 },
            { type: 'goblin', x: 950, y: 420 },
            { type: 'baby_dragon', x: 1300, y: 430 },
            { type: 'goblin', x: 1480, y: 420 },
            { type: 'baby_dragon', x: 1600, y: 430 },
            { type: 'goblin', x: 1400, y: 180 },
            { type: 'baby_dragon', x: 1980, y: 430 },
            { type: 'goblin', x: 2150, y: 230 },
        ],
        pickups: []
    }
};

// Level order for progression
const LEVEL_ORDER = ['level1', 'level2', 'level6a', 'level6', 'level7a', 'level7', 'level8a', 'level8', 'level3', 'level5'];

function createLevel(levelName) {
    const data = LEVELS[levelName];
    if (!data) {
        console.error(`Level "${levelName}" not found`);
        return null;
    }
    return new Level(data);
}

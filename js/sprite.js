// Sprite and Animation system

class Animation {
    constructor(frames, frameRate = 10, loop = true) {
        this.frames = frames;        // Array of Image objects
        this.frameRate = frameRate;  // Frames per second
        this.loop = loop;
        this.currentFrame = 0;
        this.timer = 0;
        this.finished = false;
    }

    update(deltaTime) {
        if (this.finished && !this.loop) return;

        this.timer += deltaTime;
        const frameDuration = 1 / this.frameRate;

        if (this.timer >= frameDuration) {
            this.timer -= frameDuration;
            this.currentFrame++;

            if (this.currentFrame >= this.frames.length) {
                if (this.loop) {
                    this.currentFrame = 0;
                } else {
                    this.currentFrame = this.frames.length - 1;
                    this.finished = true;
                }
            }
        }
    }

    reset() {
        this.currentFrame = 0;
        this.timer = 0;
        this.finished = false;
    }

    getCurrentFrame() {
        return this.frames[this.currentFrame];
    }
}

class Sprite {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.animations = {};
        this.currentAnimation = null;
        this.facingRight = true;
        this.spriteFacesLeft = false;  // Set true if sprite artwork faces left
        this.alpha = 1;
        this.visible = true;
    }

    addAnimation(name, frames, frameRate = 10, loop = true) {
        this.animations[name] = new Animation(frames, frameRate, loop);
    }

    playAnimation(name) {
        if (this.currentAnimation !== name && this.animations[name]) {
            this.currentAnimation = name;
            this.animations[name].reset();
        }
    }

    update(deltaTime) {
        if (this.currentAnimation && this.animations[this.currentAnimation]) {
            this.animations[this.currentAnimation].update(deltaTime);
        }
    }

    draw(ctx, cameraX = 0, cameraY = 0) {
        if (!this.visible) return;

        const anim = this.animations[this.currentAnimation];
        if (!anim) return;

        const frame = anim.getCurrentFrame();
        if (!frame) return;

        ctx.save();
        ctx.globalAlpha = this.alpha;

        const drawX = Math.floor(this.x - cameraX);
        const drawY = Math.floor(this.y - cameraY);

        // If sprite artwork faces left, invert the flip logic
        const shouldFlip = this.spriteFacesLeft ? this.facingRight : !this.facingRight;

        if (shouldFlip) {
            ctx.translate(drawX + this.width, drawY);
            ctx.scale(-1, 1);
            ctx.drawImage(frame, 0, 0, this.width, this.height);
        } else {
            ctx.drawImage(frame, drawX, drawY, this.width, this.height);
        }

        ctx.restore();
    }

    isAnimationFinished() {
        if (!this.currentAnimation || !this.animations[this.currentAnimation]) {
            return true;
        }
        return this.animations[this.currentAnimation].finished;
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

// Asset loader for sprite animations
const SpriteLoader = {
    cache: {},
    sheetCache: {},

    async loadAnimation(basePath, name, frameCount) {
        const frames = [];
        for (let i = 0; i < frameCount; i++) {
            const path = `${basePath}/${name}_${i}.png`;
            if (this.cache[path]) {
                frames.push(this.cache[path]);
            } else {
                const img = await Utils.loadImage(path);
                this.cache[path] = img;
                frames.push(img);
            }
        }
        return frames;
    },

    // Load frames from a horizontal sprite sheet strip
    // frameWidth/frameHeight define the source frame size in the sheet
    async loadSpriteSheet(imagePath, frameWidth, frameHeight) {
        const cacheKey = imagePath;
        if (this.sheetCache[cacheKey]) {
            return this.sheetCache[cacheKey];
        }

        const img = await Utils.loadImage(imagePath);
        const frameCount = Math.round(img.width / frameWidth);
        const frames = [];

        for (let i = 0; i < frameCount; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = frameWidth;
            canvas.height = frameHeight;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, i * frameWidth, 0, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);

            // Convert canvas to image for consistency
            const frameImg = new Image();
            frameImg.src = canvas.toDataURL();
            await new Promise(resolve => { frameImg.onload = resolve; });
            frames.push(frameImg);
        }

        this.sheetCache[cacheKey] = frames;
        return frames;
    },

    // Sprite sheet configurations for new sprites
    // frameWidth/frameHeight are the actual pixel dimensions per frame in the sheet
    spriteSheetConfigs: {
        // Bosses
        dragon_boss: { path: 'assets/sprites/dragon_boss', frameWidth: 144, frameHeight: 96 },
        demon_boss: { path: 'assets/sprites/demon_boss', frameWidth: 162, frameHeight: 148 },
        headless_horseman: { path: 'assets/sprites/headless_horseman', frameWidth: 150, frameHeight: 150 },
        pyromancer: { path: 'assets/sprites/pyromancer', frameWidth: 80, frameHeight: 80 },
        minotaur: { path: 'assets/sprites/minotaur', frameWidth: 128, frameHeight: 128 },
        evil_wizard: { path: 'assets/sprites/evil_wizard', frameWidth: 150, frameHeight: 150 },
        // Enemies
        baby_dragon: { path: 'assets/sprites/baby_dragon', frameWidth: 158, frameHeight: 125 },
        imp_sprite: { path: 'assets/sprites/imp', frameWidth: 128, frameHeight: 48 },
        goblin_sprite: { path: 'assets/sprites/goblin', frameWidth: 115, frameHeight: 78 },
        skeleton_warrior: { path: 'assets/sprites/skeleton_warrior', frameWidth: 89, frameHeight: 78 },
        flying_eye: { path: 'assets/sprites/flying_eye', frameWidth: 150, frameHeight: 150 },
        harpy: { path: 'assets/sprites/harpy', frameWidth: 96, frameHeight: 96 },
        skeleton_mage: { path: 'assets/sprites/skeleton_mage', frameWidth: 128, frameHeight: 128 },
    },

    async loadSpriteSheetAnimations(spriteType) {
        const config = this.spriteSheetConfigs[spriteType];
        if (!config) {
            console.error(`No sprite sheet config for: ${spriteType}`);
            return null;
        }

        const anims = ['idle', 'walk', 'attack', 'hurt', 'death'];
        const result = {};

        for (const anim of anims) {
            try {
                result[anim] = await this.loadSpriteSheet(
                    `${config.path}/${anim}.png`,
                    config.frameWidth,
                    config.frameHeight
                );
            } catch (e) {
                console.warn(`Failed to load ${spriteType}/${anim}:`, e);
                // Create a 1-frame fallback
                const canvas = document.createElement('canvas');
                canvas.width = config.frameWidth;
                canvas.height = config.frameHeight;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ff00ff';
                ctx.fillRect(0, 0, config.frameWidth, config.frameHeight);
                const fallback = new Image();
                fallback.src = canvas.toDataURL();
                await new Promise(resolve => { fallback.onload = resolve; });
                result[anim] = [fallback];
            }
        }

        return result;
    },

    async loadPlayerAnimations(variant = 'rainbow') {
        const basePath = `assets/player/${variant}`;
        return {
            idle: await this.loadAnimation(basePath, 'idle', 4),
            run: await this.loadAnimation(basePath, 'run', 6),
            jump: await this.loadAnimation(basePath, 'jump', 4),
            fall: await this.loadAnimation(basePath, 'fall', 2),
            attack: await this.loadAnimation(basePath, 'attack', 4),
            shoot: await this.loadAnimation(basePath, 'shoot', 4),
            hurt: await this.loadAnimation(basePath, 'hurt', 2),
            death: await this.loadAnimation(basePath, 'death', 4)
        };
    },

    async loadEnemyAnimations(enemyType) {
        // Check if this enemy type uses sprite sheets
        const sheetType = {
            'baby_dragon': 'baby_dragon',
            'goblin': 'goblin_sprite',
            'skeleton': 'skeleton_warrior',
            'bat': 'flying_eye',
            'imp': 'imp_sprite',
            'harpy': 'harpy',
            'flying_eye': 'flying_eye',
            'skeleton_mage': 'skeleton_mage',
        }[enemyType];

        if (sheetType) {
            return await this.loadSpriteSheetAnimations(sheetType);
        }

        // Fallback to old individual frame loading
        const basePath = `assets/enemies/${enemyType}`;
        const frameCounts = {
            slime: { idle: 2, walk: 4, attack: 3, hurt: 1, death: 3 },
        };

        const counts = frameCounts[enemyType] || frameCounts.slime;

        return {
            idle: await this.loadAnimation(basePath, 'idle', counts.idle),
            walk: await this.loadAnimation(basePath, 'walk', counts.walk),
            attack: await this.loadAnimation(basePath, 'attack', counts.attack),
            hurt: await this.loadAnimation(basePath, 'hurt', counts.hurt),
            death: await this.loadAnimation(basePath, 'death', counts.death)
        };
    },

    async loadBossAnimations(bossType) {
        // Check if this boss uses sprite sheets
        const sheetType = {
            'dragon': 'dragon_boss',
            'demon_lord': 'demon_boss',
            'headless_horseman': 'headless_horseman',
            'pyromancer': 'evil_wizard',
            'minotaur': 'minotaur',
        }[bossType];

        if (sheetType) {
            return await this.loadSpriteSheetAnimations(sheetType);
        }

        // Load from individual frame files for bosses without sprite sheets
        const basePath = `assets/bosses/${bossType}`;
        const frameCounts = {
            minotaur: { idle: 2, walk: 2, attack: 4, hurt: 1, death: 2 },
        };

        const counts = frameCounts[bossType] || { idle: 2, walk: 2, attack: 4, hurt: 1, death: 2 };

        return {
            idle: await this.loadAnimation(basePath, 'idle', counts.idle),
            walk: await this.loadAnimation(basePath, 'walk', counts.walk),
            attack: await this.loadAnimation(basePath, 'attack', counts.attack),
            hurt: await this.loadAnimation(basePath, 'hurt', counts.hurt),
            death: await this.loadAnimation(basePath, 'death', counts.death)
        };
    }
};

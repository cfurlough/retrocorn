// Procedural sprite generator for bosses without sprite sheet assets
// Generates simple pixel-art style sprites using canvas drawing

const ProceduralSprites = {
    createFrame(width, height, drawFunc) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        drawFunc(ctx);
        return canvas;
    },

    createFrames(width, height, drawFunc, count) {
        const frames = [];
        for (let i = 0; i < count; i++) {
            frames.push(this.createFrame(width, height, (ctx) => drawFunc(ctx, i, count)));
        }
        return frames;
    },

    generateBossSprites(bossType) {
        switch (bossType) {
            case 'minotaur': return this.generateMinotaur();
            case 'headless_horseman': return this.generateHeadlessHorseman();
            case 'pyromancer': return this.generatePyromancer();
            default: return null;
        }
    },

    // ========== MINOTAUR ==========
    drawMinotaurBase(ctx, yOff, armAngle) {
        // Body
        ctx.fillStyle = '#6B4226';
        ctx.fillRect(16, 16 + yOff, 32, 30);
        ctx.fillStyle = '#8B6E4C';
        ctx.fillRect(20, 20 + yOff, 24, 16);

        // Head
        ctx.fillStyle = '#6B4226';
        ctx.beginPath();
        ctx.arc(32, 12 + yOff, 11, 0, Math.PI * 2);
        ctx.fill();
        // Snout
        ctx.fillStyle = '#5A3520';
        ctx.fillRect(26, 14 + yOff, 12, 7);
        // Nostrils
        ctx.fillStyle = '#3A1A08';
        ctx.fillRect(28, 17 + yOff, 2, 2);
        ctx.fillRect(34, 17 + yOff, 2, 2);
        // Eyes
        ctx.fillStyle = '#FF2200';
        ctx.fillRect(25, 8 + yOff, 4, 4);
        ctx.fillRect(35, 8 + yOff, 4, 4);
        // Horns
        ctx.fillStyle = '#CCCCAA';
        ctx.beginPath();
        ctx.moveTo(21, 8 + yOff); ctx.lineTo(10, -2 + yOff); ctx.lineTo(24, 6 + yOff);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(43, 8 + yOff); ctx.lineTo(54, -2 + yOff); ctx.lineTo(40, 6 + yOff);
        ctx.fill();

        // Arms
        ctx.fillStyle = '#5A3520';
        ctx.save();
        ctx.translate(14, 22 + yOff);
        ctx.rotate(armAngle || 0);
        ctx.fillRect(-4, 0, 6, 18);
        ctx.restore();
        ctx.fillRect(44, 22 + yOff, 6, 18);

        // Legs
        ctx.fillStyle = '#5A3520';
        ctx.fillRect(20, 46 + yOff, 10, 14);
        ctx.fillRect(34, 46 + yOff, 10, 14);
        // Hooves
        ctx.fillStyle = '#3A2210';
        ctx.fillRect(18, 56 + yOff, 14, 6);
        ctx.fillRect(32, 56 + yOff, 14, 6);
    },

    generateMinotaur() {
        const W = 64, H = 64;
        return {
            idle: this.createFrames(W, H, (ctx, i) => {
                this.drawMinotaurBase(ctx, (i === 1 || i === 2) ? -1 : 0, 0);
            }, 4),
            walk: this.createFrames(W, H, (ctx, i) => {
                this.drawMinotaurBase(ctx, 0, 0);
                ctx.fillStyle = '#5A3520';
                const legOff = i % 2 === 0 ? 4 : -4;
                ctx.fillRect(20 + legOff, 46, 10, 16);
                ctx.fillRect(34 - legOff, 46, 10, 14);
            }, 4),
            attack: this.createFrames(W, H, (ctx, i) => {
                const angles = [0, -0.8, -1.6, -0.4];
                this.drawMinotaurBase(ctx, 0, angles[i]);
                // Axe in left hand
                ctx.fillStyle = '#888888';
                ctx.save();
                ctx.translate(10, 22);
                ctx.rotate(angles[i]);
                ctx.fillRect(-3, -22, 5, 22);
                ctx.fillStyle = '#AAAAAA';
                ctx.fillRect(-8, -28, 14, 10);
                ctx.restore();
            }, 4),
            hurt: this.createFrames(W, H, (ctx) => {
                this.drawMinotaurBase(ctx, 0, 0);
                ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
                ctx.fillRect(0, 0, W, H);
            }, 2),
            death: this.createFrames(W, H, (ctx, i) => {
                ctx.save();
                ctx.globalAlpha = 1 - i * 0.22;
                ctx.translate(32, 32);
                ctx.rotate(i * 0.4);
                ctx.translate(-32, -32 + i * 8);
                this.drawMinotaurBase(ctx, 0, 0);
                ctx.restore();
            }, 4)
        };
    },

    // ========== HEADLESS HORSEMAN ==========
    drawHorsemanBase(ctx, yOff, headX, headY) {
        headX = headX || 8;
        headY = headY || 0;

        // Cape
        ctx.fillStyle = '#1A0820';
        ctx.beginPath();
        ctx.moveTo(18, 14 + yOff); ctx.lineTo(8, 52 + yOff);
        ctx.lineTo(56, 52 + yOff); ctx.lineTo(46, 14 + yOff);
        ctx.fill();

        // Body/armor
        ctx.fillStyle = '#2A1040';
        ctx.fillRect(18, 12 + yOff, 28, 28);
        ctx.fillStyle = '#3A2060';
        ctx.fillRect(22, 16 + yOff, 20, 10);
        // Shoulder pads
        ctx.fillStyle = '#4A3070';
        ctx.fillRect(14, 12 + yOff, 10, 10);
        ctx.fillRect(40, 12 + yOff, 10, 10);

        // Neck stump
        ctx.fillStyle = '#661133';
        ctx.fillRect(28, 6 + yOff, 8, 8);

        // Glowing green head in hand
        ctx.fillStyle = 'rgba(68, 255, 68, 0.25)';
        ctx.beginPath();
        ctx.arc(headX, 32 + yOff + headY, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22AA22';
        ctx.beginPath();
        ctx.arc(headX, 32 + yOff + headY, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(headX - 4, 30 + yOff + headY, 2, 3);
        ctx.fillRect(headX + 2, 30 + yOff + headY, 2, 3);
        // Mouth
        ctx.fillStyle = '#44FF44';
        ctx.fillRect(headX - 2, 35 + yOff + headY, 5, 1);

        // Legs
        ctx.fillStyle = '#1A0820';
        ctx.fillRect(22, 40 + yOff, 8, 16);
        ctx.fillRect(34, 40 + yOff, 8, 16);
        // Boots
        ctx.fillStyle = '#110618';
        ctx.fillRect(20, 52 + yOff, 12, 8);
        ctx.fillRect(32, 52 + yOff, 12, 8);
    },

    generateHeadlessHorseman() {
        const W = 64, H = 64;
        return {
            idle: this.createFrames(W, H, (ctx, i) => {
                const yOff = (i === 1 || i === 2) ? -1 : 0;
                this.drawHorsemanBase(ctx, yOff, 8, Math.sin(i * 1.5) * 2);
            }, 4),
            walk: this.createFrames(W, H, (ctx, i) => {
                this.drawHorsemanBase(ctx, 0, 8, 0);
                ctx.fillStyle = '#1A0820';
                const off = i % 2 === 0 ? 4 : -4;
                ctx.fillRect(22 + off, 40, 8, 18);
                ctx.fillRect(34 - off, 40, 8, 14);
            }, 4),
            attack: this.createFrames(W, H, (ctx, i) => {
                const headPos = [
                    { x: 8, y: 0 }, { x: 22, y: -10 },
                    { x: 42, y: -14 }, { x: 56, y: -8 }
                ];
                this.drawHorsemanBase(ctx, 0, headPos[i].x, headPos[i].y);
            }, 4),
            hurt: this.createFrames(W, H, (ctx) => {
                this.drawHorsemanBase(ctx, 0, 8, 0);
                ctx.fillStyle = 'rgba(100, 0, 200, 0.4)';
                ctx.fillRect(0, 0, W, H);
            }, 2),
            death: this.createFrames(W, H, (ctx, i) => {
                ctx.save();
                ctx.globalAlpha = 1 - i * 0.22;
                ctx.translate(32, 32);
                ctx.rotate(i * 0.3);
                ctx.translate(-32, -32 + i * 6);
                this.drawHorsemanBase(ctx, 0, 8, 0);
                // Ghost particles
                ctx.fillStyle = 'rgba(68, 255, 68, 0.5)';
                for (let j = 0; j < i * 3; j++) {
                    ctx.beginPath();
                    ctx.arc(32 + (j * 17 % 40) - 20, 32 + (j * 13 % 40) - 20, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }, 4)
        };
    },

    // ========== PYROMANCER ==========
    drawPyromancerBase(ctx, yOff, fireSize) {
        fireSize = fireSize || 6;

        // Staff
        ctx.fillStyle = '#664422';
        ctx.fillRect(46, 4 + yOff, 4, 50);
        // Fire on staff
        ctx.fillStyle = 'rgba(255, 100, 0, 0.2)';
        ctx.beginPath();
        ctx.arc(48, 4 + yOff, fireSize * 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FF6600';
        ctx.beginPath();
        ctx.arc(48, 4 + yOff, fireSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFAA00';
        ctx.beginPath();
        ctx.arc(48, 2 + yOff, fireSize * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Robe
        ctx.fillStyle = '#AA2200';
        ctx.beginPath();
        ctx.moveTo(16, 20 + yOff); ctx.lineTo(10, 58 + yOff);
        ctx.lineTo(50, 58 + yOff); ctx.lineTo(44, 20 + yOff);
        ctx.fill();
        ctx.fillStyle = '#CC3311';
        ctx.beginPath();
        ctx.moveTo(20, 24 + yOff); ctx.lineTo(16, 52 + yOff);
        ctx.lineTo(40, 52 + yOff); ctx.lineTo(38, 24 + yOff);
        ctx.fill();
        // Belt
        ctx.fillStyle = '#661100';
        ctx.fillRect(16, 36 + yOff, 28, 4);
        // Belt buckle
        ctx.fillStyle = '#FFAA00';
        ctx.fillRect(28, 35 + yOff, 4, 6);

        // Hood/hat
        ctx.fillStyle = '#881800';
        ctx.beginPath();
        ctx.moveTo(30, 0 + yOff); ctx.lineTo(14, 22 + yOff);
        ctx.lineTo(46, 22 + yOff);
        ctx.fill();
        // Face shadow
        ctx.fillStyle = '#220800';
        ctx.beginPath();
        ctx.arc(30, 16 + yOff, 8, 0, Math.PI * 2);
        ctx.fill();
        // Glowing eyes
        ctx.fillStyle = '#FF8800';
        ctx.fillRect(24, 14 + yOff, 4, 4);
        ctx.fillRect(32, 14 + yOff, 4, 4);
        // Eye glow
        ctx.fillStyle = 'rgba(255, 136, 0, 0.3)';
        ctx.fillRect(22, 12 + yOff, 8, 8);
        ctx.fillRect(30, 12 + yOff, 8, 8);
    },

    generatePyromancer() {
        const W = 64, H = 64;
        return {
            idle: this.createFrames(W, H, (ctx, i) => {
                this.drawPyromancerBase(ctx, (i === 1 || i === 2) ? -1 : 0, 6 + Math.sin(i * 1.5) * 2);
            }, 4),
            walk: this.createFrames(W, H, (ctx, i) => {
                this.drawPyromancerBase(ctx, i % 2 === 0 ? -2 : 0, 6);
            }, 4),
            attack: this.createFrames(W, H, (ctx, i) => {
                this.drawPyromancerBase(ctx, 0, 6 + i * 4);
                // Growing fire effect during cast
                if (i >= 2) {
                    ctx.fillStyle = `rgba(255, ${80 + i * 20}, 0, 0.25)`;
                    ctx.beginPath();
                    ctx.arc(30, 28, 14 + i * 6, 0, Math.PI * 2);
                    ctx.fill();
                }
            }, 4),
            hurt: this.createFrames(W, H, (ctx) => {
                this.drawPyromancerBase(ctx, 0, 6);
                ctx.fillStyle = 'rgba(255, 50, 0, 0.4)';
                ctx.fillRect(0, 0, W, H);
            }, 2),
            death: this.createFrames(W, H, (ctx, i) => {
                ctx.save();
                ctx.globalAlpha = 1 - i * 0.22;
                this.drawPyromancerBase(ctx, i * 5, Math.max(2, 10 - i * 2));
                // Fire explosion
                ctx.fillStyle = '#FF6600';
                for (let j = 0; j < i * 4; j++) {
                    ctx.beginPath();
                    ctx.arc(32 + (j * 19 % 48) - 24, 32 + (j * 11 % 48) - 24, 3 + j % 3, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }, 4)
        };
    }
};

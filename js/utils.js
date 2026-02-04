// Utility functions for the game

const Utils = {
    // Clamp a value between min and max
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },

    // Check if two rectangles overlap
    rectIntersect(r1, r2) {
        return !(r2.x > r1.x + r1.width ||
                 r2.x + r2.width < r1.x ||
                 r2.y > r1.y + r1.height ||
                 r2.y + r2.height < r1.y);
    },

    // Get distance between two points
    distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },

    // Linear interpolation
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    // Random integer between min and max (inclusive)
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // Random float between min and max
    randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    },

    // Load an image and return a promise
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
        });
    },

    // Load multiple images
    async loadImages(sources) {
        const images = {};
        const promises = Object.entries(sources).map(async ([key, src]) => {
            images[key] = await Utils.loadImage(src);
        });
        await Promise.all(promises);
        return images;
    }
};

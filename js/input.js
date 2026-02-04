// Input handling system with Mouse + Keyboard support

const Input = {
    keys: {},
    keysJustPressed: {},
    keysJustReleased: {},

    // Mouse state
    mouse: {
        x: 0,
        y: 0,
        leftDown: false,
        rightDown: false,
        leftJustPressed: false,
        rightJustPressed: false,
        leftJustReleased: false,
        rightJustReleased: false,
        leftClickQueue: 0,  // Queue rapid clicks
        rightClickQueue: 0
    },

    // Canvas reference for mouse position calculation
    canvas: null,

    init(canvas) {
        this.canvas = canvas || document.getElementById('game-canvas');

        // Keyboard events - listen on both window and document for better coverage
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
        window.addEventListener('blur', () => this.reset());

        // Mouse events on canvas
        if (this.canvas) {
            this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
            this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
            this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
            this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        }

        // Also listen on document for mouse events (better coverage)
        document.addEventListener('mousedown', (e) => {
            // Only handle if clicking on canvas or game container
            if (e.target === this.canvas || e.target.closest('#game-container')) {
                this.onMouseDown(e);
            }
        });
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));
        document.addEventListener('contextmenu', (e) => {
            if (e.target === this.canvas || e.target.closest('#game-container')) {
                e.preventDefault();
            }
        });
    },

    onKeyDown(e) {
        // Prevent default for game keys
        const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Enter',
                          'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'KeyJ', 'KeyK', 'KeyZ', 'KeyX'];
        if (gameKeys.includes(e.code)) {
            e.preventDefault();
        }

        if (!this.keys[e.code]) {
            this.keysJustPressed[e.code] = true;
        }
        this.keys[e.code] = true;
    },

    onKeyUp(e) {
        this.keys[e.code] = false;
        this.keysJustReleased[e.code] = true;
    },

    onMouseDown(e) {
        e.preventDefault();
        if (e.button === 0) {  // Left click
            // Limit queue to prevent buildup from rapid clicking
            if (this.mouse.leftClickQueue < 3) {
                this.mouse.leftClickQueue++;
            }
            this.mouse.leftDown = true;
        } else if (e.button === 2) {  // Right click
            if (this.mouse.rightClickQueue < 3) {
                this.mouse.rightClickQueue++;
            }
            this.mouse.rightDown = true;
        }
    },

    onMouseUp(e) {
        if (e.button === 0) {
            this.mouse.leftDown = false;
            this.mouse.leftJustReleased = true;
        } else if (e.button === 2) {
            this.mouse.rightDown = false;
            this.mouse.rightJustReleased = true;
        }
    },

    onMouseMove(e) {
        if (this.canvas) {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        }
    },

    // Call at end of each frame to clear "just pressed/released" state
    update() {
        this.keysJustPressed = {};
        this.keysJustReleased = {};
        // Process click queue - set justPressed if there are queued clicks
        this.mouse.leftJustPressed = this.mouse.leftClickQueue > 0;
        this.mouse.rightJustPressed = this.mouse.rightClickQueue > 0;
        // Consume one click from queue per frame
        if (this.mouse.leftClickQueue > 0) this.mouse.leftClickQueue--;
        if (this.mouse.rightClickQueue > 0) this.mouse.rightClickQueue--;
        this.mouse.leftJustReleased = false;
        this.mouse.rightJustReleased = false;
    },

    reset() {
        this.keys = {};
        this.keysJustPressed = {};
        this.keysJustReleased = {};
        this.mouse.leftDown = false;
        this.mouse.rightDown = false;
        this.mouse.leftJustPressed = false;
        this.mouse.rightJustPressed = false;
        this.mouse.leftJustReleased = false;
        this.mouse.rightJustReleased = false;
        this.mouse.leftClickQueue = 0;
        this.mouse.rightClickQueue = 0;
    },

    // Check if a key is currently held down
    isDown(key) {
        return this.keys[key] === true;
    },

    // Check if a key was just pressed this frame
    isJustPressed(key) {
        return this.keysJustPressed[key] === true;
    },

    // Check if a key was just released this frame
    isJustReleased(key) {
        return this.keysJustReleased[key] === true;
    },

    // ============== Game Controls ==============

    // Movement - WASD + Arrow keys
    get left() {
        return this.isDown('ArrowLeft') || this.isDown('KeyA');
    },

    get right() {
        return this.isDown('ArrowRight') || this.isDown('KeyD');
    },

    get up() {
        return this.isDown('ArrowUp') || this.isDown('KeyW');
    },

    get down() {
        return this.isDown('ArrowDown') || this.isDown('KeyS');
    },

    // Jump - W or Space (held for variable height)
    get jump() {
        return this.isDown('KeyW') || this.isDown('Space') || this.isDown('ArrowUp');
    },

    get jumpPressed() {
        return this.isJustPressed('KeyW') || this.isJustPressed('Space') || this.isJustPressed('ArrowUp');
    },

    // Shoot - Left Mouse Click
    get shoot() {
        return this.mouse.leftJustPressed;
    },

    get shootHeld() {
        return this.mouse.leftDown;
    },

    // Melee - Right Mouse Click
    get melee() {
        return this.mouse.rightJustPressed;
    },

    // Special ability - Q
    get special() {
        return this.isJustPressed('KeyQ');
    },

    // Interact - E
    get interact() {
        return this.isJustPressed('KeyE');
    },

    // Pause - Escape
    get pause() {
        return this.isJustPressed('Escape') || this.isJustPressed('KeyP');
    },

    // Restart (game over state)
    get restart() {
        return this.isJustPressed('Space') || this.mouse.leftJustPressed;
    },

    // Get mouse position relative to canvas
    getMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    },

    // Get mouse position in world coordinates
    getWorldMousePosition(cameraX, cameraY) {
        return {
            x: this.mouse.x + cameraX,
            y: this.mouse.y + cameraY
        };
    }
};

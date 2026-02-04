# Retrocorn

A retro-style 2D platformer shooter featuring a magical unicorn hero!

## How to Play

### Running the Game

1. **Using Python (recommended):**
   ```bash
   py -3 run_game.py
   ```
   This will start a local server and open the game in your browser.

2. **Using any HTTP server:**
   ```bash
   # Python
   python -m http.server 8000

   # Node.js
   npx serve

   # Or use VS Code Live Server extension
   ```
   Then open `http://localhost:8000` in your browser.

### Controls

| Action | Keys |
|--------|------|
| Move Left | A / Left Arrow |
| Move Right | D / Right Arrow |
| Jump | W / Up Arrow / Space |
| Shoot (magic) | J / Z |
| Melee (horn) | K / X |
| Pause | Escape / P |

### Tips

- **Variable Jump:** Hold the jump button longer for higher jumps!
- **Melee does more damage** than ranged attacks but requires getting close
- **Invincibility:** After taking damage, you're briefly invincible (flashing)
- **Debug Mode:** Press F1 to toggle hitbox visualization

## Current Status: Milestone 1 Complete

### Features Implemented:
- Player character (white unicorn) with full animations
- Movement: run, variable-height jump
- Combat: ranged magic projectiles + melee horn attack
- 2 enemy types: Slime (hopping) and Goblin (patrol + attack)
- Collision detection (platforms, enemies, projectiles)
- Health system with heart display
- Test level with multiple platforms
- Game over / restart functionality
- Camera system following player
- Pause functionality

### Coming in Milestone 2:
- Character select (Pink & Rainbow unicorns)
- All 5 enemy types
- 5 complete levels
- 2 boss fights (Dragon, Demon Lord)
- Scoring and pickups

## File Structure

```
Retro Game/
├── index.html          # Main game page
├── run_game.py         # Server script
├── README.md           # This file
├── GAME_SPEC.md        # Full game specification
├── css/
│   └── style.css
├── js/
│   ├── game.js         # Main game loop
│   ├── player.js       # Player class
│   ├── enemies.js      # Enemy classes
│   ├── projectile.js   # Projectile class
│   ├── level.js        # Level data
│   ├── collision.js    # Collision detection
│   ├── sprite.js       # Animation system
│   ├── input.js        # Input handling
│   ├── ui.js           # UI rendering
│   └── utils.js        # Utility functions
└── assets/
    ├── player/         # Unicorn sprites (white, pink, rainbow)
    ├── enemies/        # Enemy sprites
    └── bosses/         # Boss sprites
```

## Credits

Created with Claude Code

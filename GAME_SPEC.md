# Retrocorn - Game Design Specification

## Overview
**Retrocorn** is a retro-style 2D platformer shooter featuring a magical unicorn hero battling through fantasy worlds filled with classic enemies and epic bosses.

**Platform:** Web (HTML5/JavaScript with Canvas API)
**Genre:** 2D Platformer Shooter (Mario-style level progression)
**Target Scope:** 5 levels, 2 boss fights

---

## Core Requirements

### Player Character
- **Three selectable unicorn variants:** White, Pink, Rainbow
- **Movement:** Run left/right, jump (variable height based on button hold)
- **Combat:**
  - **Ranged Attack:** Shoot magic projectiles from horn
  - **Melee Attack:** Horn thrust for close combat (higher damage, shorter range)
- **Health:** 3 hearts (6 hit points, enemies deal 1-2 damage)
- **Lives:** 3 lives per game, respawn at checkpoint on death

### Controls
| Action | Keyboard | Alternative |
|--------|----------|-------------|
| Move Left | A / Left Arrow | - |
| Move Right | D / Right Arrow | - |
| Jump | W / Up Arrow / Space | - |
| Shoot | J / Z | - |
| Melee | K / X | - |
| Pause | Escape / P | - |

### Enemies
**Regular Enemies (5 types used):**
| Enemy | Behavior | Health | Damage |
|-------|----------|--------|--------|
| Slime | Hops toward player | 1 HP | 1 |
| Goblin | Walks, attacks with club when close | 2 HP | 1 |
| Bat | Flies in wave pattern | 1 HP | 1 |
| Skeleton | Walks, throws bones | 2 HP | 1 |
| Imp | Flies, shoots fireballs | 2 HP | 1 (contact), 1 (fireball) |

**Bosses (2):**
| Boss | Level | Behavior | Health |
|------|-------|----------|--------|
| Dragon | End of Level 3 | Flies, breathes fire, dive attacks | 15 HP |
| Demon Lord | End of Level 5 | Teleports, summons imps, fire waves | 20 HP |

### Level Structure
- **World 1: Enchanted Forest** (Levels 1-2)
  - Enemies: Slimes, Goblins
- **World 2: Dark Caverns** (Level 3 + Dragon Boss)
  - Enemies: Bats, Skeletons, Imps
- **World 3: Demon Realm** (Levels 4-5 + Demon Lord Boss)
  - Enemies: All types, increased difficulty

### Scoring System
- Slime: 100 points
- Goblin: 150 points
- Bat: 100 points
- Skeleton: 200 points
- Imp: 200 points
- Dragon Boss: 2000 points
- Demon Lord: 5000 points
- Level completion bonus: 1000 points
- Time bonus: +10 points per second under par

### Pickups
- **Heart:** Restores 1 heart (2 HP)
- **Star:** Temporary invincibility (5 seconds)
- **Magic Crystal:** +500 points

---

## Milestones

### Milestone 1: Core Gameplay (Playable Prototype)
**Goal:** Single level with full player mechanics and basic enemies.

**Features:**
- [x] Game canvas and rendering loop
- [ ] Player character (white unicorn) with all animations
- [ ] Full movement: run, jump (variable height)
- [ ] Ranged attack with projectiles
- [ ] Melee attack with hitbox
- [ ] 2 enemy types: Slime, Goblin (with AI)
- [ ] Collision detection (platforms, enemies, projectiles)
- [ ] Health system with hearts display
- [ ] Single test level with platforms
- [ ] Game over / restart functionality

**Deliverable:** Playable single level where player can move, jump, shoot, melee attack, defeat enemies, take damage, and die/restart.

---

### Milestone 2: Full Game Loop
**Goal:** Complete game with all 5 levels, 2 bosses, and progression.

**Features:**
- [ ] Character select screen (3 unicorn variants)
- [ ] All 5 enemy types implemented
- [ ] Both boss fights (Dragon, Demon Lord)
- [ ] All 5 levels designed and playable
- [ ] Level transitions and progression
- [ ] Checkpoints within levels
- [ ] Lives system (3 lives)
- [ ] Scoring system
- [ ] Pickup items (hearts, stars, crystals)
- [ ] Simple UI: score, lives, health, level indicator
- [ ] Win screen after defeating Demon Lord

**Deliverable:** Complete game playable from start to finish with all content.

---

### Milestone 3: Polish & Juice
**Goal:** Polished game with effects, sound, and quality-of-life features.

**Features:**
- [ ] Title screen with menu
- [ ] Sound effects (jump, shoot, hit, death, pickup)
- [ ] Background music (per world)
- [ ] Screen shake on damage/explosions
- [ ] Particle effects (magic sparkles, death poofs)
- [ ] Hit flash on enemies
- [ ] Parallax scrolling backgrounds
- [ ] High score persistence (localStorage)
- [ ] Pause menu
- [ ] Mobile touch controls (optional)
- [ ] Performance optimization

**Deliverable:** Fully polished game ready for release/sharing.

---

## Pixel Art Assets

### Player - Unicorn Variants
All player sprites are 128x128px (32x32 base, 4x scaled)

#### White Unicorn
| Animation | Frames | Files |
|-----------|--------|-------|
| Idle | 4 | `assets/player/white/idle_0.png` - `idle_3.png` |
| Run | 6 | `assets/player/white/run_0.png` - `run_5.png` |
| Jump | 4 | `assets/player/white/jump_0.png` - `jump_3.png` |
| Attack | 4 | `assets/player/white/attack_0.png` - `attack_3.png` |
| Shoot | 4 | `assets/player/white/shoot_0.png` - `shoot_3.png` |
| Hurt | 1 | `assets/player/white/hurt_0.png` |
| Death | 3 | `assets/player/white/death_0.png` - `death_2.png` |

#### Pink Unicorn
| Animation | Frames | Files |
|-----------|--------|-------|
| Idle | 4 | `assets/player/pink/idle_0.png` - `idle_3.png` |
| Run | 6 | `assets/player/pink/run_0.png` - `run_5.png` |
| Jump | 4 | `assets/player/pink/jump_0.png` - `jump_3.png` |
| Attack | 4 | `assets/player/pink/attack_0.png` - `attack_3.png` |
| Shoot | 4 | `assets/player/pink/shoot_0.png` - `shoot_3.png` |
| Hurt | 1 | `assets/player/pink/hurt_0.png` |
| Death | 3 | `assets/player/pink/death_0.png` - `death_2.png` |

#### Rainbow Unicorn
| Animation | Frames | Files |
|-----------|--------|-------|
| Idle | 4 | `assets/player/rainbow/idle_0.png` - `idle_3.png` |
| Run | 6 | `assets/player/rainbow/run_0.png` - `run_5.png` |
| Jump | 4 | `assets/player/rainbow/jump_0.png` - `jump_3.png` |
| Attack | 4 | `assets/player/rainbow/attack_0.png` - `attack_3.png` |
| Shoot | 4 | `assets/player/rainbow/shoot_0.png` - `shoot_3.png` |
| Hurt | 1 | `assets/player/rainbow/hurt_0.png` |
| Death | 3 | `assets/player/rainbow/death_0.png` - `death_2.png` |

---

### Enemies
All enemy sprites are 128x128px (32x32 base, 4x scaled)

#### Slime
| Animation | Frames | Files |
|-----------|--------|-------|
| Idle | 2 | `assets/enemies/slime/idle_0.png` - `idle_1.png` |
| Walk | 4 | `assets/enemies/slime/walk_0.png` - `walk_3.png` |
| Attack | 3 | `assets/enemies/slime/attack_0.png` - `attack_2.png` |
| Hurt | 1 | `assets/enemies/slime/hurt_0.png` |
| Death | 3 | `assets/enemies/slime/death_0.png` - `death_2.png` |

#### Goblin
| Animation | Frames | Files |
|-----------|--------|-------|
| Idle | 2 | `assets/enemies/goblin/idle_0.png` - `idle_1.png` |
| Walk | 4 | `assets/enemies/goblin/walk_0.png` - `walk_3.png` |
| Attack | 4 | `assets/enemies/goblin/attack_0.png` - `attack_3.png` |
| Hurt | 1 | `assets/enemies/goblin/hurt_0.png` |
| Death | 3 | `assets/enemies/goblin/death_0.png` - `death_2.png` |

#### Bat
| Animation | Frames | Files |
|-----------|--------|-------|
| Idle | 2 | `assets/enemies/bat/idle_0.png` - `idle_1.png` |
| Walk | 2 | `assets/enemies/bat/walk_0.png` - `walk_1.png` |
| Attack | 3 | `assets/enemies/bat/attack_0.png` - `attack_2.png` |
| Hurt | 1 | `assets/enemies/bat/hurt_0.png` |
| Death | 2 | `assets/enemies/bat/death_0.png` - `death_1.png` |

#### Skeleton
| Animation | Frames | Files |
|-----------|--------|-------|
| Idle | 2 | `assets/enemies/skeleton/idle_0.png` - `idle_1.png` |
| Walk | 4 | `assets/enemies/skeleton/walk_0.png` - `walk_3.png` |
| Attack | 4 | `assets/enemies/skeleton/attack_0.png` - `attack_3.png` |
| Hurt | 1 | `assets/enemies/skeleton/hurt_0.png` |
| Death | 2 | `assets/enemies/skeleton/death_0.png` - `death_1.png` |

#### Imp
| Animation | Frames | Files |
|-----------|--------|-------|
| Idle | 2 | `assets/enemies/imp/idle_0.png` - `idle_1.png` |
| Walk | 2 | `assets/enemies/imp/walk_0.png` - `walk_1.png` |
| Attack | 3 | `assets/enemies/imp/attack_0.png` - `attack_2.png` |
| Hurt | 1 | `assets/enemies/imp/hurt_0.png` |
| Death | 2 | `assets/enemies/imp/death_0.png` - `death_1.png` |

---

### Bosses
All boss sprites are 256x256px (64x64 base, 4x scaled)

#### Dragon (World 2 Boss)
| Animation | Frames | Files |
|-----------|--------|-------|
| Idle | 2 | `assets/bosses/dragon/idle_0.png` - `idle_1.png` |
| Walk | 2 | `assets/bosses/dragon/walk_0.png` - `walk_1.png` |
| Attack | 4 | `assets/bosses/dragon/attack_0.png` - `attack_3.png` |
| Hurt | 1 | `assets/bosses/dragon/hurt_0.png` |
| Death | 2 | `assets/bosses/dragon/death_0.png` - `death_1.png` |

#### Demon Lord (Final Boss)
| Animation | Frames | Files |
|-----------|--------|-------|
| Idle | 2 | `assets/bosses/demon_lord/idle_0.png` - `idle_1.png` |
| Walk | 2 | `assets/bosses/demon_lord/walk_0.png` - `walk_1.png` |
| Attack | 4 | `assets/bosses/demon_lord/attack_0.png` - `attack_3.png` |
| Hurt | 1 | `assets/bosses/demon_lord/hurt_0.png` |
| Death | 2 | `assets/bosses/demon_lord/death_0.png` - `death_1.png` |

---

### Additional Assets (To Be Created)
These assets will be created as needed during development:

| Asset | Size | Description |
|-------|------|-------------|
| Magic Projectile | 16x16 | Player's ranged attack |
| Fireball | 16x16 | Enemy/boss fire attack |
| Bone | 16x16 | Skeleton's thrown projectile |
| Heart Pickup | 16x16 | Health restore item |
| Star Pickup | 16x16 | Invincibility item |
| Crystal Pickup | 16x16 | Score bonus item |
| Platform Tiles | 32x32 | Ground, grass, stone, etc. |
| Background Layers | 640x480 | Parallax backgrounds per world |

---

### Reserve Assets (Available but not used in v1.0)
These enemy/boss assets exist and can be used for future content:

**Enemies:**
- `assets/enemies/gnome/` - Gnome enemy
- `assets/enemies/spider/` - Spider enemy
- `assets/enemies/mushroom/` - Mushroom creature
- `assets/enemies/evil_fairy/` - Evil fairy
- `assets/enemies/rat/` - Giant rat

**Bosses:**
- `assets/bosses/minotaur/` - Minotaur boss
- `assets/bosses/cyclops/` - Cyclops boss
- `assets/bosses/dark_wizard/` - Dark Wizard boss

---

## Technical Notes

### File Structure
```
Retro Game/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Game styling
├── js/
│   ├── game.js         # Main game loop
│   ├── player.js       # Player class
│   ├── enemies.js      # Enemy classes
│   ├── levels.js       # Level data
│   ├── collision.js    # Collision detection
│   └── ui.js           # UI rendering
├── assets/
│   ├── player/         # Unicorn sprites
│   ├── enemies/        # Enemy sprites
│   ├── bosses/         # Boss sprites
│   ├── tiles/          # Platform tiles (TBD)
│   ├── pickups/        # Item sprites (TBD)
│   ├── projectiles/    # Projectile sprites (TBD)
│   └── backgrounds/    # Background images (TBD)
├── audio/              # Sound effects & music (TBD)
├── GAME_SPEC.md        # This document
└── README.md           # Project readme
```

### Canvas Settings
- **Resolution:** 800x600 (scalable)
- **Target FPS:** 60
- **Pixel-perfect rendering:** Disable image smoothing

---

## Version History
| Version | Date | Description |
|---------|------|-------------|
| 0.1 | TBD | Milestone 1 - Core Gameplay |
| 0.5 | TBD | Milestone 2 - Full Game Loop |
| 1.0 | TBD | Milestone 3 - Polish & Release |

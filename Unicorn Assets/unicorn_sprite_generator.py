"""
Unicorn Pixel Art Sprite Generator
Generates a 32x32 pixel unicorn character with full platformer animations
"""

from PIL import Image, ImageDraw
import os

# Color palette - Rainbow unicorn theme
COLORS = {
    'transparent': (0, 0, 0, 0),
    'outline': (60, 50, 70, 255),
    'body': (255, 250, 245, 255),          # Cream white body
    'body_shadow': (230, 220, 225, 255),   # Body shadow
    'body_highlight': (255, 255, 255, 255), # Pure white highlight
    'horn': (255, 215, 100, 255),          # Golden horn
    'horn_highlight': (255, 240, 180, 255), # Horn shine
    'eye': (60, 50, 70, 255),              # Eye color
    'eye_shine': (255, 255, 255, 255),     # Eye highlight
    'hoof': (200, 180, 190, 255),          # Hooves
    # Rainbow mane colors
    'mane_red': (255, 100, 120, 255),
    'mane_orange': (255, 170, 100, 255),
    'mane_yellow': (255, 230, 100, 255),
    'mane_green': (150, 230, 150, 255),
    'mane_blue': (130, 180, 255, 255),
    'mane_purple': (200, 150, 255, 255),
    # Magic/projectile colors
    'magic_core': (255, 255, 200, 255),
    'magic_glow': (255, 200, 255, 255),
    'magic_outer': (200, 150, 255, 128),
    # Hit/damage
    'hit_flash': (255, 100, 100, 200),
}

MANE_COLORS = ['mane_red', 'mane_orange', 'mane_yellow', 'mane_green', 'mane_blue', 'mane_purple']

def create_sprite(width=32, height=32):
    """Create a new transparent sprite"""
    return Image.new('RGBA', (width, height), COLORS['transparent'])

def draw_pixel(img, x, y, color_name):
    """Draw a single pixel"""
    if color_name in COLORS:
        img.putpixel((x, y), COLORS[color_name])

def draw_unicorn_base(img, x_offset=0, y_offset=0):
    """Draw the base unicorn body"""
    # Body (main shape)
    body_pixels = [
        # Main body
        (12, 18), (13, 18), (14, 18), (15, 18), (16, 18), (17, 18), (18, 18),
        (11, 19), (12, 19), (13, 19), (14, 19), (15, 19), (16, 19), (17, 19), (18, 19), (19, 19),
        (11, 20), (12, 20), (13, 20), (14, 20), (15, 20), (16, 20), (17, 20), (18, 20), (19, 20),
        (11, 21), (12, 21), (13, 21), (14, 21), (15, 21), (16, 21), (17, 21), (18, 21), (19, 21),
        (12, 22), (13, 22), (14, 22), (15, 22), (16, 22), (17, 22), (18, 22),
    ]
    for px, py in body_pixels:
        draw_pixel(img, px + x_offset, py + y_offset, 'body')

    # Body shadow
    shadow_pixels = [
        (12, 21), (13, 21), (14, 21),
        (12, 22), (13, 22), (14, 22),
    ]
    for px, py in shadow_pixels:
        draw_pixel(img, px + x_offset, py + y_offset, 'body_shadow')

    # Head
    head_pixels = [
        (18, 13), (19, 13), (20, 13),
        (17, 14), (18, 14), (19, 14), (20, 14), (21, 14),
        (17, 15), (18, 15), (19, 15), (20, 15), (21, 15),
        (17, 16), (18, 16), (19, 16), (20, 16), (21, 16),
        (18, 17), (19, 17), (20, 17), (21, 17),
    ]
    for px, py in head_pixels:
        draw_pixel(img, px + x_offset, py + y_offset, 'body')

    # Horn
    horn_pixels = [
        (22, 10),
        (22, 11), (23, 11),
        (21, 12), (22, 12),
        (21, 13), (22, 13),
    ]
    for px, py in horn_pixels:
        draw_pixel(img, px + x_offset, py + y_offset, 'horn')
    draw_pixel(img, 23 + x_offset, 10 + y_offset, 'horn_highlight')
    draw_pixel(img, 22 + x_offset, 11 + y_offset, 'horn_highlight')

    # Eye
    draw_pixel(img, 20 + x_offset, 15 + y_offset, 'eye')
    draw_pixel(img, 20 + x_offset, 14 + y_offset, 'eye_shine')

    # Outline key points
    outline_pixels = [
        (21, 10), (22, 9), (23, 10), (24, 11),
        (22, 14), (22, 15), (22, 16), (22, 17),
        (21, 17), (20, 18), (19, 18),
        (10, 19), (10, 20), (10, 21),
        (11, 22), (11, 23),
        (19, 22), (20, 21), (20, 20),
    ]
    for px, py in outline_pixels:
        draw_pixel(img, px + x_offset, py + y_offset, 'outline')

    # Legs
    legs = [
        # Front legs
        [(13, 23), (13, 24), (13, 25), (13, 26)],
        [(16, 23), (16, 24), (16, 25), (16, 26)],
    ]
    for leg in legs:
        for px, py in leg:
            draw_pixel(img, px + x_offset, py + y_offset, 'body')
        # Hooves
        draw_pixel(img, leg[-1][0] + x_offset, leg[-1][1] + y_offset, 'hoof')

    # Rainbow mane
    mane_sections = [
        [(17, 12), (16, 13), (15, 14)],  # Top
        [(16, 14), (15, 15), (14, 16)],  # Upper mid
        [(15, 16), (14, 17), (13, 18)],  # Lower mid
        [(14, 18), (13, 19), (12, 20)],  # Bottom sections
        [(16, 12), (15, 13)],
        [(17, 13), (16, 15)],
    ]
    for i, section in enumerate(mane_sections):
        color = MANE_COLORS[i % len(MANE_COLORS)]
        for px, py in section:
            draw_pixel(img, px + x_offset, py + y_offset, color)

    # Rainbow tail
    tail_sections = [
        [(9, 19), (8, 20)],
        [(9, 20), (8, 21)],
        [(9, 21), (8, 22)],
        [(10, 21), (9, 22)],
        [(10, 22), (9, 23)],
        [(11, 22), (10, 23)],
    ]
    for i, section in enumerate(tail_sections):
        color = MANE_COLORS[i % len(MANE_COLORS)]
        for px, py in section:
            draw_pixel(img, px + x_offset, py + y_offset, color)

def create_idle_frames():
    """Create idle animation frames (breathing effect)"""
    frames = []

    for i in range(4):
        img = create_sprite()
        y_off = -1 if i in [1, 2] else 0  # Subtle bob
        draw_unicorn_base(img, 0, y_off)

        # Add sparkle effect on horn for some frames
        if i == 1:
            draw_pixel(img, 24, 9, 'magic_core')
        elif i == 3:
            draw_pixel(img, 25, 10, 'magic_core')

        frames.append(img)

    return frames

def create_run_frames():
    """Create run animation frames"""
    frames = []

    leg_positions = [
        # Frame 0: legs together
        [[(13, 23), (13, 24), (13, 25)], [(16, 23), (16, 24), (16, 25)]],
        # Frame 1: front leg forward
        [[(14, 23), (15, 24), (16, 25)], [(15, 23), (15, 24), (15, 25)]],
        # Frame 2: stretched
        [[(15, 23), (16, 24), (17, 24)], [(12, 23), (11, 24), (10, 24)]],
        # Frame 3: back leg forward
        [[(13, 23), (13, 24), (13, 25)], [(14, 23), (13, 24), (12, 25)]],
        # Frame 4: compressed
        [[(14, 24), (14, 25), (14, 26)], [(15, 24), (15, 25), (15, 26)]],
        # Frame 5: leap
        [[(12, 23), (11, 24), (10, 24)], [(17, 23), (18, 24), (19, 24)]],
    ]

    for i, legs in enumerate(leg_positions):
        img = create_sprite()
        y_off = -2 if i in [2, 5] else (-1 if i in [1, 3] else 0)

        # Draw body without default legs
        draw_unicorn_body_no_legs(img, 0, y_off)

        # Draw custom leg positions
        for leg in legs:
            for j, (px, py) in enumerate(leg):
                color = 'hoof' if j == len(leg) - 1 else 'body'
                draw_pixel(img, px, py + y_off, color)

        # Mane flowing back more in fast frames
        if i in [2, 5]:
            for mx in range(3):
                draw_pixel(img, 8 - mx, 14 + mx + y_off, MANE_COLORS[mx])

        frames.append(img)

    return frames

def draw_unicorn_body_no_legs(img, x_offset=0, y_offset=0):
    """Draw unicorn without legs for custom leg animations"""
    # Body
    body_pixels = [
        (12, 18), (13, 18), (14, 18), (15, 18), (16, 18), (17, 18), (18, 18),
        (11, 19), (12, 19), (13, 19), (14, 19), (15, 19), (16, 19), (17, 19), (18, 19), (19, 19),
        (11, 20), (12, 20), (13, 20), (14, 20), (15, 20), (16, 20), (17, 20), (18, 20), (19, 20),
        (11, 21), (12, 21), (13, 21), (14, 21), (15, 21), (16, 21), (17, 21), (18, 21), (19, 21),
        (12, 22), (13, 22), (14, 22), (15, 22), (16, 22), (17, 22), (18, 22),
    ]
    for px, py in body_pixels:
        draw_pixel(img, px + x_offset, py + y_offset, 'body')

    # Head
    head_pixels = [
        (18, 13), (19, 13), (20, 13),
        (17, 14), (18, 14), (19, 14), (20, 14), (21, 14),
        (17, 15), (18, 15), (19, 15), (20, 15), (21, 15),
        (17, 16), (18, 16), (19, 16), (20, 16), (21, 16),
        (18, 17), (19, 17), (20, 17), (21, 17),
    ]
    for px, py in head_pixels:
        draw_pixel(img, px + x_offset, py + y_offset, 'body')

    # Horn
    horn_pixels = [(22, 10), (22, 11), (23, 11), (21, 12), (22, 12), (21, 13), (22, 13)]
    for px, py in horn_pixels:
        draw_pixel(img, px + x_offset, py + y_offset, 'horn')
    draw_pixel(img, 23 + x_offset, 10 + y_offset, 'horn_highlight')

    # Eye
    draw_pixel(img, 20 + x_offset, 15 + y_offset, 'eye')
    draw_pixel(img, 20 + x_offset, 14 + y_offset, 'eye_shine')

    # Rainbow mane
    mane_sections = [
        [(17, 12), (16, 13), (15, 14)],
        [(16, 14), (15, 15), (14, 16)],
        [(15, 16), (14, 17), (13, 18)],
        [(14, 18), (13, 19), (12, 20)],
        [(16, 12), (15, 13)],
        [(17, 13), (16, 15)],
    ]
    for i, section in enumerate(mane_sections):
        color = MANE_COLORS[i % len(MANE_COLORS)]
        for px, py in section:
            draw_pixel(img, px + x_offset, py + y_offset, color)

    # Tail
    tail_sections = [
        [(9, 19), (8, 20)], [(9, 20), (8, 21)], [(9, 21), (8, 22)],
        [(10, 21), (9, 22)], [(10, 22), (9, 23)], [(11, 22), (10, 23)],
    ]
    for i, section in enumerate(tail_sections):
        color = MANE_COLORS[i % len(MANE_COLORS)]
        for px, py in section:
            draw_pixel(img, px + x_offset, py + y_offset, color)

def create_jump_frames():
    """Create jump animation frames"""
    frames = []

    # Frame 0: Crouch/prepare
    img = create_sprite()
    draw_unicorn_body_no_legs(img, 0, 2)
    for px, py in [(13, 25), (13, 26), (13, 27), (16, 25), (16, 26), (16, 27)]:
        draw_pixel(img, px, py, 'body' if py < 27 else 'hoof')
    frames.append(img)

    # Frame 1: Launch
    img = create_sprite()
    draw_unicorn_body_no_legs(img, 0, -2)
    # Legs tucked back
    for px, py in [(11, 22), (10, 23), (14, 22), (13, 23)]:
        draw_pixel(img, px, py, 'body')
    draw_pixel(img, 9, 24, 'hoof')
    draw_pixel(img, 12, 24, 'hoof')
    frames.append(img)

    # Frame 2: Apex
    img = create_sprite()
    draw_unicorn_body_no_legs(img, 0, -4)
    # Legs spread
    for px, py in [(10, 20), (9, 21), (15, 20), (16, 21)]:
        draw_pixel(img, px, py, 'body')
    draw_pixel(img, 8, 22, 'hoof')
    draw_pixel(img, 17, 22, 'hoof')
    frames.append(img)

    return frames

def create_fall_frames():
    """Create fall animation frames"""
    frames = []

    # Frame 0: Falling
    img = create_sprite()
    draw_unicorn_body_no_legs(img, 0, 0)
    # Legs dangling
    for px, py in [(12, 23), (11, 24), (11, 25), (16, 23), (17, 24), (17, 25)]:
        draw_pixel(img, px, py, 'body')
    draw_pixel(img, 10, 26, 'hoof')
    draw_pixel(img, 18, 26, 'hoof')
    # Mane/tail flowing up
    for i, (px, py) in enumerate([(15, 11), (14, 10), (13, 9)]):
        draw_pixel(img, px, py, MANE_COLORS[i])
    frames.append(img)

    # Frame 1: Fast fall
    img = create_sprite()
    draw_unicorn_body_no_legs(img, 0, 1)
    for px, py in [(12, 24), (11, 25), (11, 26), (16, 24), (17, 25), (17, 26)]:
        draw_pixel(img, px, py, 'body')
    draw_pixel(img, 10, 27, 'hoof')
    draw_pixel(img, 18, 27, 'hoof')
    frames.append(img)

    return frames

def create_attack_frames():
    """Create melee attack animation (horn thrust)"""
    frames = []

    # Frame 0: Wind up
    img = create_sprite()
    draw_unicorn_body_no_legs(img, -2, 0)
    # Legs planted
    for px, py in [(11, 23), (11, 24), (11, 25), (14, 23), (14, 24), (14, 25)]:
        draw_pixel(img, px, py, 'body')
    draw_pixel(img, 11, 26, 'hoof')
    draw_pixel(img, 14, 26, 'hoof')
    frames.append(img)

    # Frame 1: Thrust forward
    img = create_sprite()
    draw_unicorn_body_no_legs(img, 2, 0)
    # Extended horn glow
    for px, py in [(25, 10), (26, 9), (27, 8)]:
        draw_pixel(img, px, py, 'horn')
    draw_pixel(img, 28, 7, 'horn_highlight')
    draw_pixel(img, 28, 8, 'magic_core')
    draw_pixel(img, 27, 9, 'magic_glow')
    # Legs
    for px, py in [(15, 23), (15, 24), (15, 25), (18, 23), (18, 24), (18, 25)]:
        draw_pixel(img, px, py, 'body')
    draw_pixel(img, 15, 26, 'hoof')
    draw_pixel(img, 18, 26, 'hoof')
    frames.append(img)

    # Frame 2: Impact
    img = create_sprite()
    draw_unicorn_body_no_legs(img, 3, 0)
    # Horn with impact sparkles
    for px, py in [(26, 10), (27, 9), (28, 8)]:
        draw_pixel(img, px, py, 'horn')
    # Sparkle burst
    for px, py in [(29, 7), (30, 8), (29, 9), (28, 6)]:
        draw_pixel(img, px, py, 'magic_core')
    for px, py in [(30, 6), (31, 7), (30, 9), (28, 5)]:
        draw_pixel(img, px, py, 'magic_glow')
    # Legs
    for px, py in [(16, 23), (16, 24), (16, 25), (19, 23), (19, 24), (19, 25)]:
        draw_pixel(img, px, py, 'body')
    draw_pixel(img, 16, 26, 'hoof')
    draw_pixel(img, 19, 26, 'hoof')
    frames.append(img)

    # Frame 3: Recovery
    img = create_sprite()
    draw_unicorn_base(img, 0, 0)
    frames.append(img)

    return frames

def create_shoot_frames():
    """Create shooting animation (magic projectile from horn)"""
    frames = []

    # Frame 0: Charge up
    img = create_sprite()
    draw_unicorn_base(img, 0, 0)
    # Magic gathering at horn
    draw_pixel(img, 24, 9, 'magic_glow')
    draw_pixel(img, 25, 10, 'magic_glow')
    draw_pixel(img, 24, 11, 'magic_glow')
    draw_pixel(img, 24, 10, 'magic_core')
    frames.append(img)

    # Frame 1: More charge
    img = create_sprite()
    draw_unicorn_base(img, 0, 0)
    # Bigger magic orb
    for px, py in [(24, 8), (25, 9), (26, 10), (25, 11), (24, 10)]:
        draw_pixel(img, px, py, 'magic_glow')
    for px, py in [(24, 9), (25, 10), (24, 10)]:
        draw_pixel(img, px, py, 'magic_core')
    # Horn glow
    draw_pixel(img, 23, 10, 'horn_highlight')
    draw_pixel(img, 22, 11, 'horn_highlight')
    frames.append(img)

    # Frame 2: Release
    img = create_sprite()
    draw_unicorn_base(img, -1, 0)  # Slight recoil
    # Projectile launching
    for px, py in [(26, 9), (27, 9), (28, 9)]:
        draw_pixel(img, px, py, 'magic_core')
    for px, py in [(26, 8), (27, 8), (28, 8), (26, 10), (27, 10), (28, 10)]:
        draw_pixel(img, px, py, 'magic_glow')
    # Muzzle flash
    draw_pixel(img, 25, 9, 'magic_core')
    draw_pixel(img, 24, 8, 'mane_purple')
    draw_pixel(img, 24, 10, 'mane_blue')
    frames.append(img)

    # Frame 3: Follow through
    img = create_sprite()
    draw_unicorn_base(img, 0, 0)
    # Small sparkles remaining
    draw_pixel(img, 24, 10, 'magic_glow')
    draw_pixel(img, 25, 9, 'magic_glow')
    frames.append(img)

    return frames

def create_projectile_frames():
    """Create the magic projectile that gets shot"""
    frames = []

    for i in range(4):
        img = create_sprite(16, 16)  # Smaller sprite for projectile
        cx, cy = 8, 8

        # Rotating rainbow orb
        colors_offset = i
        # Core
        for px, py in [(cx, cy), (cx+1, cy), (cx, cy+1), (cx+1, cy+1)]:
            draw_pixel(img, px, py, 'magic_core')

        # Rotating color ring
        ring_positions = [
            (cx-1, cy-1), (cx, cy-2), (cx+1, cy-1), (cx+2, cy),
            (cx+2, cy+1), (cx+1, cy+2), (cx, cy+2), (cx-1, cy+1), (cx-1, cy)
        ]
        for j, (px, py) in enumerate(ring_positions):
            color_idx = (j + colors_offset) % len(MANE_COLORS)
            if 0 <= px < 16 and 0 <= py < 16:
                draw_pixel(img, px, py, MANE_COLORS[color_idx])

        # Sparkle trail
        trail_x = cx - 3 - (i % 2)
        if 0 <= trail_x < 16:
            draw_pixel(img, trail_x, cy, 'magic_glow')
            draw_pixel(img, trail_x - 1, cy - 1, 'mane_purple')
            draw_pixel(img, trail_x - 1, cy + 1, 'mane_blue')

        frames.append(img)

    return frames

def create_hit_frames():
    """Create hit/damage animation"""
    frames = []

    # Frame 0: Flash white
    img = create_sprite()
    draw_unicorn_base(img, 0, 0)
    # Overlay flash effect
    for x in range(32):
        for y in range(32):
            if img.getpixel((x, y))[3] > 0:  # If not transparent
                r, g, b, a = img.getpixel((x, y))
                # Brighten
                img.putpixel((x, y), (min(255, r + 100), min(255, g + 50), min(255, b + 50), a))
    frames.append(img)

    # Frame 1: Knockback
    img = create_sprite()
    draw_unicorn_base(img, -3, -1)
    frames.append(img)

    # Frame 2: Recovery
    img = create_sprite()
    draw_unicorn_base(img, -1, 0)
    frames.append(img)

    return frames

def create_death_frames():
    """Create death animation"""
    frames = []

    # Frame 0: Hit
    img = create_sprite()
    draw_unicorn_base(img, 0, 0)
    # Flash
    for x in range(32):
        for y in range(32):
            if img.getpixel((x, y))[3] > 0:
                r, g, b, a = img.getpixel((x, y))
                img.putpixel((x, y), (min(255, r + 80), g, b, a))
    frames.append(img)

    # Frame 1: Stagger
    img = create_sprite()
    draw_unicorn_body_no_legs(img, -2, 1)
    # Wobbly legs
    for px, py in [(10, 24), (9, 25), (9, 26), (14, 24), (13, 25), (13, 26)]:
        draw_pixel(img, px, py, 'body')
    draw_pixel(img, 8, 27, 'hoof')
    draw_pixel(img, 12, 27, 'hoof')
    frames.append(img)

    # Frame 2: Falling
    img = create_sprite()
    draw_unicorn_body_no_legs(img, -3, 4)
    # Collapsed legs
    for px, py in [(8, 27), (9, 27), (10, 27), (12, 27), (13, 27), (14, 27)]:
        draw_pixel(img, px, py, 'body')
    frames.append(img)

    # Frame 3: On ground
    img = create_sprite()
    # Lying down unicorn
    body_pixels = [
        (6, 24), (7, 24), (8, 24), (9, 24), (10, 24), (11, 24), (12, 24), (13, 24),
        (5, 25), (6, 25), (7, 25), (8, 25), (9, 25), (10, 25), (11, 25), (12, 25), (13, 25), (14, 25),
        (6, 26), (7, 26), (8, 26), (9, 26), (10, 26), (11, 26), (12, 26), (13, 26),
    ]
    for px, py in body_pixels:
        draw_pixel(img, px, py, 'body')
    # Head on ground
    for px, py in [(14, 23), (15, 23), (16, 23), (14, 24), (15, 24), (16, 24), (17, 24)]:
        draw_pixel(img, px, py, 'body')
    # Horn
    for px, py in [(17, 22), (18, 21), (18, 22)]:
        draw_pixel(img, px, py, 'horn')
    # Closed eye
    draw_pixel(img, 16, 23, 'outline')
    # Mane spread
    for i, (px, py) in enumerate([(13, 23), (12, 22), (11, 22), (10, 23), (9, 23)]):
        draw_pixel(img, px, py, MANE_COLORS[i % len(MANE_COLORS)])
    # Tail
    for i, (px, py) in enumerate([(4, 25), (3, 25), (3, 26), (4, 26)]):
        draw_pixel(img, px, py, MANE_COLORS[i % len(MANE_COLORS)])
    frames.append(img)

    # Frame 4: Fade (semi-transparent)
    img_fade = frames[-1].copy()
    for x in range(32):
        for y in range(32):
            r, g, b, a = img_fade.getpixel((x, y))
            if a > 0:
                img_fade.putpixel((x, y), (r, g, b, a // 2))
    frames.append(img_fade)

    return frames

def create_sprite_sheet(frames_dict, output_path):
    """Create a sprite sheet from animation frames"""
    # Calculate dimensions
    max_frames = max(len(frames) for frames in frames_dict.values())
    num_animations = len(frames_dict)

    sheet_width = max_frames * 32
    sheet_height = num_animations * 32

    sheet = Image.new('RGBA', (sheet_width, sheet_height), COLORS['transparent'])

    row = 0
    animation_info = []

    for anim_name, frames in frames_dict.items():
        for col, frame in enumerate(frames):
            sheet.paste(frame, (col * 32, row * 32))
        animation_info.append(f"{anim_name}: row {row}, {len(frames)} frames")
        row += 1

    sheet.save(output_path)
    return animation_info

def main():
    """Generate all sprites and create sprite sheet"""
    print("Generating Unicorn Sprite Sheet...")
    print("=" * 40)

    # Create output directory
    output_dir = os.path.dirname(os.path.abspath(__file__))

    # Generate all animations
    animations = {
        'idle': create_idle_frames(),
        'run': create_run_frames(),
        'jump': create_jump_frames(),
        'fall': create_fall_frames(),
        'attack': create_attack_frames(),
        'shoot': create_shoot_frames(),
        'hit': create_hit_frames(),
        'death': create_death_frames(),
    }

    # Create main sprite sheet
    sheet_path = os.path.join(output_dir, 'unicorn_spritesheet.png')
    info = create_sprite_sheet(animations, sheet_path)

    print(f"\nMain sprite sheet saved: {sheet_path}")
    print("\nAnimation layout:")
    for line in info:
        print(f"  {line}")

    # Create projectile sprite sheet separately
    projectile_frames = create_projectile_frames()
    projectile_sheet = Image.new('RGBA', (64, 16), COLORS['transparent'])
    for i, frame in enumerate(projectile_frames):
        projectile_sheet.paste(frame, (i * 16, 0))

    projectile_path = os.path.join(output_dir, 'unicorn_projectile.png')
    projectile_sheet.save(projectile_path)
    print(f"\nProjectile sprite sheet saved: {projectile_path}")
    print("  16x16 pixels, 4 frames")

    # Save individual animation strips for convenience
    strips_dir = os.path.join(output_dir, 'unicorn_strips')
    os.makedirs(strips_dir, exist_ok=True)

    for anim_name, frames in animations.items():
        strip = Image.new('RGBA', (len(frames) * 32, 32), COLORS['transparent'])
        for i, frame in enumerate(frames):
            strip.paste(frame, (i * 32, 0))
        strip_path = os.path.join(strips_dir, f'unicorn_{anim_name}.png')
        strip.save(strip_path)

    print(f"\nIndividual animation strips saved to: {strips_dir}")

    print("\n" + "=" * 40)
    print("Generation complete!")
    print("\nUsage tips:")
    print("- Each frame is 32x32 pixels")
    print("- Transparent background (PNG with alpha)")
    print("- Use nearest-neighbor scaling to preserve pixel art")
    print("- Recommended frame rate: 8-12 FPS for most animations")

if __name__ == '__main__':
    main()

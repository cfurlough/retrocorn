"""
Unicorn Player Sprite Generator
Creates 3 unicorn variants (rainbow, pink, white) with full animations:
- idle, run, jump, fall, attack, shoot, hurt, death
"""

from PIL import Image
import os

def create_sprite(width, height, pixel_data, palette):
    """Create a sprite from pixel data and color palette."""
    img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    pixels = img.load()
    for y, row in enumerate(pixel_data):
        if y >= height:
            break
        for x, color_idx in enumerate(row):
            if x >= width:
                break
            if color_idx != '.' and color_idx in palette:
                pixels[x, y] = palette[color_idx]
    return img

def scale_sprite(img, scale=4):
    return img.resize((img.width * scale, img.height * scale), Image.NEAREST)

# ============== COLOR PALETTES ==============

def get_white_palette():
    """Traditional white unicorn with golden horn."""
    return {
        'b': (255, 255, 255, 255),      # body white
        'B': (220, 220, 230, 255),      # body shadow
        'D': (180, 180, 195, 255),      # dark shadow
        'h': (255, 215, 0, 255),        # horn gold
        'H': (218, 165, 32, 255),       # horn dark gold
        'm': (200, 180, 220, 255),      # mane light purple
        'M': (150, 130, 180, 255),      # mane dark purple
        't': (200, 180, 220, 255),      # tail
        'T': (150, 130, 180, 255),      # tail dark
        'e': (80, 60, 120, 255),        # eye purple
        'E': (0, 0, 0, 255),            # eye pupil
        'n': (255, 200, 200, 255),      # nose pink
        'l': (60, 60, 70, 255),         # hoof
        'o': (40, 40, 50, 255),         # outline
        's': (255, 255, 100, 255),      # sparkle/magic
        'S': (255, 200, 255, 255),      # magic glow
        'f': (255, 150, 50, 255),       # fire/blast
        'F': (255, 100, 30, 255),       # fire dark
        'x': (255, 255, 255, 255),      # hurt flash
    }

def get_pink_palette():
    """Pink themed unicorn with rose gold horn."""
    return {
        'b': (255, 182, 193, 255),      # body pink
        'B': (255, 150, 170, 255),      # body shadow
        'D': (220, 120, 150, 255),      # dark shadow
        'h': (255, 180, 180, 255),      # horn rose gold
        'H': (220, 150, 150, 255),      # horn dark
        'm': (255, 105, 180, 255),      # mane hot pink
        'M': (200, 80, 140, 255),       # mane dark
        't': (255, 105, 180, 255),      # tail
        'T': (200, 80, 140, 255),       # tail dark
        'e': (180, 50, 100, 255),       # eye
        'E': (0, 0, 0, 255),            # eye pupil
        'n': (255, 150, 180, 255),      # nose
        'l': (150, 80, 100, 255),       # hoof
        'o': (100, 50, 70, 255),        # outline
        's': (255, 200, 255, 255),      # sparkle
        'S': (255, 150, 200, 255),      # magic glow
        'f': (255, 100, 150, 255),      # blast
        'F': (255, 50, 100, 255),       # blast dark
        'x': (255, 255, 255, 255),      # hurt flash
    }

def get_rainbow_palette():
    """Rainbow themed unicorn - body shifts through rainbow colors."""
    return {
        'b': (255, 255, 255, 255),      # body base white
        'B': (220, 220, 230, 255),      # body shadow
        'D': (180, 180, 195, 255),      # dark shadow
        'h': (255, 255, 255, 255),      # horn (rainbow gradient applied)
        'H': (220, 220, 220, 255),      # horn shadow
        'm': (255, 100, 100, 255),      # mane red
        'M': (200, 50, 50, 255),        # mane dark red
        '1': (255, 150, 50, 255),       # orange
        '2': (255, 255, 100, 255),      # yellow
        '3': (100, 255, 100, 255),      # green
        '4': (100, 200, 255, 255),      # blue
        '5': (200, 100, 255, 255),      # purple
        't': (200, 100, 255, 255),      # tail purple
        'T': (150, 50, 200, 255),       # tail dark
        'e': (100, 50, 150, 255),       # eye
        'E': (0, 0, 0, 255),            # eye pupil
        'n': (255, 200, 200, 255),      # nose
        'l': (60, 60, 70, 255),         # hoof
        'o': (40, 40, 50, 255),         # outline
        's': (255, 255, 200, 255),      # sparkle
        'S': (255, 200, 255, 255),      # magic
        'f': (255, 200, 100, 255),      # blast
        'F': (255, 150, 50, 255),       # blast dark
        'x': (255, 255, 255, 255),      # hurt flash
    }

# ============== UNICORN FRAMES ==============

def get_idle_frames():
    """Idle animation - gentle breathing motion."""
    idle1 = [
        "................................",
        "................................",
        "................................",
        "................................",
        "...........oh.....................",
        "..........ohho...................",
        ".........ohhho...................",
        "........ohhhho....ommmmo.........",
        ".......ohhhho...omMmmmmmo........",
        "......ohhho...ommMmmmmmmo........",
        ".....ohho....ommmmmmmmmo.........",
        "....oho.oooobbbbbbbbbbo..........",
        "........obbbbbbbbbbbbbbbo........",
        ".......obbbbbeBbbbbbbbbbbo.......",
        "......obbbbbbbbbbbbbbbbbbbo......",
        ".....obbbbbbnbbBbbbbbbbbbbo......",
        ".....obbbbbbbbbbbbbbbbbbbo.......",
        "....obbbbbbbbbbbBbbbbbbbo........",
        "....oBBbbbbbbbbbbbbbbbbo...ottto.",
        "...oBBBbbbbbbbbbbbbbbbo...oTttto.",
        "...oBBbbbbbbbbbbbbbbbo...otTtto..",
        "....oBbbbbbbbbbbbbbbo...ottto....",
        "....obbbbbbbbbbbbbo....otto......",
        ".....obbbbooobbbo.....oo.........",
        ".....obbo.ol.obbo..................",
        ".....obo..ol..obo.................",
        ".....ol...ol...ol.................",
        ".....ol...ol...ol.................",
        "....oll..oll..oll.................",
        "....oo...oo...oo..................",
        "................................",
        "................................",
    ]

    idle2 = [
        "................................",
        "................................",
        "................................",
        "................................",
        "...........oh.....................",
        "..........ohho...................",
        ".........ohhho...................",
        "........ohhhho....ommmmo.........",
        ".......ohhhho...omMmmmmmo........",
        "......ohhho...ommMmmmmmmo........",
        ".....ohho....ommmmmmmmmo.........",
        "....oho.oooobbbbbbbbbbo..........",
        "........obbbbbbbbbbbbbbbo........",
        ".......obbbbbeBbbbbbbbbbbo.......",
        "......obbbbbbbbbbbbbbbbbbbo......",
        ".....obbbbbbnbbBbbbbbbbbbbo......",
        ".....obbbbbbbbbbbbbbbbbbbo.......",
        "....obbbbbbbbbbbBbbbbbbbo........",
        "....oBBbbbbbbbbbbbbbbbbo....ottto",
        "...oBBBbbbbbbbbbbbbbbbo....oTttto",
        "...oBBbbbbbbbbbbbbbbbo....otTtto.",
        "....oBbbbbbbbbbbbbbbo....ottto...",
        "....obbbbbbbbbbbbbo.....otto.....",
        ".....obbbbooobbbo......oo........",
        ".....obbo.ol.obbo..................",
        ".....obo..ol..obo.................",
        ".....ol...ol...ol.................",
        ".....ol...ol...ol.................",
        "....oll..oll..oll.................",
        "....oo...oo...oo..................",
        "................................",
        "................................",
    ]

    return [idle1, idle2, idle1, idle2]

def get_run_frames():
    """Running animation."""
    run1 = [
        "................................",
        "................................",
        "................................",
        "...........oh.....................",
        "..........ohho...................",
        ".........ohhho...................",
        "........ohhhho....ommmmo.........",
        ".......ohhhho...omMmmmmmo........",
        "......ohhho...ommMmmmmmmo........",
        ".....ohho....ommmmmmmmmo.........",
        "....oho.oooobbbbbbbbbbo..........",
        "........obbbbbbbbbbbbbbbo........",
        ".......obbbbbeBbbbbbbbbbbo.......",
        "......obbbbbbbbbbbbbbbbbbbo......",
        ".....obbbbbbnbbBbbbbbbbbbbo......",
        ".....obbbbbbbbbbbbbbbbbbbo.......",
        "....obbbbbbbbbbbBbbbbbbbo........",
        "....oBBbbbbbbbbbbbbbbbbo....ottto",
        "...oBBBbbbbbbbbbbbbbbbo....oTttto",
        "...oBBbbbbbbbbbbbbbbo.....otTtto.",
        "....oBbbbbbbbbbbbo.......ottto...",
        "....obbbbbbbbbbo.........oo......",
        ".....obbbooobo...................",
        "......ol...obo...................",
        ".....ol.....ol...................",
        "....ol......ol...................",
        "...ol.......ol...................",
        "...oll......oll..................",
        "...oo.......oo...................",
        "................................",
        "................................",
        "................................",
    ]

    run2 = [
        "................................",
        "................................",
        "................................",
        "...........oh.....................",
        "..........ohho...................",
        ".........ohhho...................",
        "........ohhhho....ommmmo.........",
        ".......ohhhho...omMmmmmmo........",
        "......ohhho...ommMmmmmmmo........",
        ".....ohho....ommmmmmmmmo.........",
        "....oho.oooobbbbbbbbbbo..........",
        "........obbbbbbbbbbbbbbbo........",
        ".......obbbbbeBbbbbbbbbbbo.......",
        "......obbbbbbbbbbbbbbbbbbbo......",
        ".....obbbbbbnbbBbbbbbbbbbbo......",
        ".....obbbbbbbbbbbbbbbbbbbo.......",
        "....obbbbbbbbbbbBbbbbbbbo........",
        "....oBBbbbbbbbbbbbbbbbbo......otto",
        "...oBBBbbbbbbbbbbbbbbbo.....oTtto",
        "...oBBbbbbbbbbbbbbbbo......otTto.",
        "....oBbbbbbbbbbbbbo.......otto...",
        "....obbbbbbbbbo...........oo.....",
        ".....obbooobo....................",
        ".....obo..ol.....................",
        ".....ol....ol....................",
        "......ol....ol...................",
        ".......ol....ol..................",
        ".......oll...oll.................",
        "........oo...oo..................",
        "................................",
        "................................",
        "................................",
    ]

    run3 = [
        "................................",
        "................................",
        "...........oh.....................",
        "..........ohho...................",
        ".........ohhho...................",
        "........ohhhho....ommmmo.........",
        ".......ohhhho...omMmmmmmo........",
        "......ohhho...ommMmmmmmmo........",
        ".....ohho....ommmmmmmmmo.........",
        "....oho.oooobbbbbbbbbbo..........",
        "........obbbbbbbbbbbbbbbo........",
        ".......obbbbbeBbbbbbbbbbbo.......",
        "......obbbbbbbbbbbbbbbbbbbo......",
        ".....obbbbbbnbbBbbbbbbbbbbo......",
        ".....obbbbbbbbbbbbbbbbbbbo.......",
        "....obbbbbbbbbbbBbbbbbbbo........",
        "....oBBbbbbbbbbbbbbbbbbo.....otto",
        "...oBBBbbbbbbbbbbbbbbbo.....oTtto",
        "...oBBbbbbbbbbbbbbbbbo.....otTto.",
        "....oBbbbbbbbbbbbbbo......otto...",
        "....obbbbbbbbbbbbo........oo.....",
        ".....obbbooobbbo.................",
        ".....ol....ol....................",
        "......ol..ol.....................",
        ".......ol.ol.....................",
        ".......olol......................",
        "........oll......................",
        "........oo.......................",
        "................................",
        "................................",
        "................................",
        "................................",
    ]

    run4 = [
        "................................",
        "................................",
        "................................",
        "...........oh.....................",
        "..........ohho...................",
        ".........ohhho...................",
        "........ohhhho....ommmmo.........",
        ".......ohhhho...omMmmmmmo........",
        "......ohhho...ommMmmmmmmo........",
        ".....ohho....ommmmmmmmmo.........",
        "....oho.oooobbbbbbbbbbo..........",
        "........obbbbbbbbbbbbbbbo........",
        ".......obbbbbeBbbbbbbbbbbo.......",
        "......obbbbbbbbbbbbbbbbbbbo......",
        ".....obbbbbbnbbBbbbbbbbbbbo......",
        ".....obbbbbbbbbbbbbbbbbbbo.......",
        "....obbbbbbbbbbbBbbbbbbbo........",
        "....oBBbbbbbbbbbbbbbbbbo.....otto",
        "...oBBBbbbbbbbbbbbbbbbo....oTttto",
        "...oBBbbbbbbbbbbbbbbbo....otTtto.",
        "....oBbbbbbbbbbbbbbbo....ottto...",
        "....obbbbbbbbbbbbbo......oo......",
        ".....obbbbooobbbo................",
        ".....obbo.ol.obbo................",
        ".....obo..ol..obo................",
        ".....ol...ol...ol................",
        ".....ol...ol...ol................",
        "....oll..oll..oll................",
        "....oo...oo...oo.................",
        "................................",
        "................................",
        "................................",
    ]

    return [run1, run2, run3, run4, run3, run2]

def get_jump_frames():
    """Jump animation - anticipation, rise, peak, fall."""
    # Crouch/anticipation
    jump1 = [
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "...........oh.....................",
        "..........ohho...................",
        ".........ohhho....ommmmo.........",
        "........ohhhho..omMmmmmmo........",
        ".......ohhho...ommMmmmmmmo.......",
        "......ohho....ommmmmmmmmo........",
        ".....oho.oooobbbbbbbbbbo..........",
        "........obbbbbbbbbbbbbbbo........",
        ".......obbbbbeBbbbbbbbbbbo.......",
        "......obbbbbbbbbbbbbbbbbbbo......",
        ".....obbbbbbnbbBbbbbbbbbbbo......",
        ".....obbbbbbbbbbbbbbbbbbbo.......",
        "....obbbbbbbbbbbBbbbbbbbo........",
        "....oBBbbbbbbbbbbbbbbbbo....ottto",
        "...oBBBbbbbbbbbbbbbbbbo....oTttto",
        "...oBBbbbbbbbbbbbbbbbo....otTtto.",
        "....oBbbbbbbbbbbbo.......ottto...",
        "....obbbbbbbbbo..........oo......",
        ".....obbolobbbo..................",
        ".....obo.ol.obo..................",
        "....oll..ol..oll.................",
        "....oo...oo...oo.................",
        "................................",
        "................................",
        "................................",
        "................................",
    ]

    # Rising
    jump2 = [
        "................................",
        "...........oh.....................",
        "..........ohho...................",
        ".........ohhho...................",
        "........ohhhho....ommmmo.........",
        ".......ohhhho...omMmmmmmo........",
        "......ohhho...ommMmmmmmmo........",
        ".....ohho....ommmmmmmmmo.........",
        "....oho.oooobbbbbbbbbbo..........",
        "........obbbbbbbbbbbbbbbo........",
        ".......obbbbbeBbbbbbbbbbbo.......",
        "......obbbbbbbbbbbbbbbbbbbo......",
        ".....obbbbbbnbbBbbbbbbbbbbo......",
        ".....obbbbbbbbbbbbbbbbbbbo.......",
        "....obbbbbbbbbbbBbbbbbbbo........",
        "....oBBbbbbbbbbbbbbbbbbo.........",
        "...oBBBbbbbbbbbbbbbbbbo..........",
        "...oBBbbbbbbbbbbbbbbbo...........",
        "....oBbbbbbbbbbbbbbbo...ottto....",
        "....obbbbbbbbbbbbo.....oTttto....",
        ".....obbbbooobbbo.....otTtto.....",
        ".....obbo....obbo.....ottto......",
        "......ol......ol......oo.........",
        "......ol......ol.................",
        ".......ol......ol................",
        ".......oll.....oll...............",
        "........oo......oo...............",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
    ]

    # Peak
    jump3 = [
        "...........oh.....................",
        "..........ohho...................",
        ".........ohhho...................",
        "........ohhhho....ommmmo.........",
        ".......ohhhho...omMmmmmmo........",
        "......ohhho...ommMmmmmmmo........",
        ".....ohho....ommmmmmmmmo.........",
        "....oho.oooobbbbbbbbbbo..........",
        "........obbbbbbbbbbbbbbbo........",
        ".......obbbbbeBbbbbbbbbbbo.......",
        "......obbbbbbbbbbbbbbbbbbbo......",
        ".....obbbbbbnbbBbbbbbbbbbbo......",
        ".....obbbbbbbbbbbbbbbbbbbo.......",
        "....obbbbbbbbbbbBbbbbbbbo........",
        "....oBBbbbbbbbbbbbbbbbbo.........",
        "...oBBBbbbbbbbbbbbbbbbo....ottto.",
        "...oBBbbbbbbbbbbbbbbbo....oTttto.",
        "....oBbbbbbbbbbbbbbbo....otTtto..",
        "....obbbbbbbbbbbbo.......ottto...",
        ".....obbbbooobbbo........oo......",
        ".....obbo....obbo................",
        "......ol......ol.................",
        "......ol......ol.................",
        ".......ol......ol................",
        ".......oll.....oll...............",
        "........oo......oo...............",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
    ]

    # Falling
    jump4 = [
        "................................",
        "................................",
        "...........oh.....................",
        "..........ohho...................",
        ".........ohhho...................",
        "........ohhhho....ommmmo.........",
        ".......ohhhho...omMmmmmmo........",
        "......ohhho...ommMmmmmmmo........",
        ".....ohho....ommmmmmmmmo.........",
        "....oho.oooobbbbbbbbbbo..........",
        "........obbbbbbbbbbbbbbbo........",
        ".......obbbbbeBbbbbbbbbbbo.......",
        "......obbbbbbbbbbbbbbbbbbbo......",
        ".....obbbbbbnbbBbbbbbbbbbbo......",
        ".....obbbbbbbbbbbbbbbbbbbo.......",
        "....obbbbbbbbbbbBbbbbbbbo........",
        "....oBBbbbbbbbbbbbbbbbbo.........",
        "...oBBBbbbbbbbbbbbbbbbo....ottto.",
        "...oBBbbbbbbbbbbbbbbbo...oTttto..",
        "....oBbbbbbbbbbbbbbbo...otTtto...",
        "....obbbbbbbbbbbbo......ottto....",
        ".....obbbbooobbbo.......oo.......",
        ".....obbo....obbo................",
        "......ol......ol.................",
        ".....ol........ol................",
        "....ol..........ol...............",
        "...oll..........oll..............",
        "...oo............oo..............",
        "................................",
        "................................",
        "................................",
        "................................",
    ]

    return [jump1, jump2, jump3, jump4]

def get_attack_frames():
    """Melee attack - horn thrust."""
    attack1 = [
        "................................",
        "................................",
        "................................",
        "................................",
        "...........oh.....................",
        "..........ohho...................",
        ".........ohhho...................",
        "........ohhhho....ommmmo.........",
        ".......ohhhho...omMmmmmmo........",
        "......ohhho...ommMmmmmmmo........",
        ".....ohho....ommmmmmmmmo.........",
        "....oho.oooobbbbbbbbbbo..........",
        "........obbbbbbbbbbbbbbbo........",
        ".......obbbbbeBbbbbbbbbbbo.......",
        "......obbbbbbbbbbbbbbbbbbbo......",
        ".....obbbbbbnbbBbbbbbbbbbbo......",
        ".....obbbbbbbbbbbbbbbbbbbo.......",
        "....obbbbbbbbbbbBbbbbbbbo........",
        "....oBBbbbbbbbbbbbbbbbbo...ottto.",
        "...oBBBbbbbbbbbbbbbbbbo...oTttto.",
        "...oBBbbbbbbbbbbbbbbbo...otTtto..",
        "....oBbbbbbbbbbbbbbbo...ottto....",
        "....obbbbbbbbbbbbbo....otto......",
        ".....obbbbooobbbo.....oo.........",
        ".....obbo.ol.obbo..................",
        ".....obo..ol..obo.................",
        ".....ol...ol...ol.................",
        ".....ol...ol...ol.................",
        "....oll..oll..oll.................",
        "....oo...oo...oo..................",
        "................................",
        "................................",
    ]

    attack2 = [
        "................................",
        "................................",
        "................................",
        ".......ohhhhhhhhho...............",
        "......ohhhhhhhhhho...............",
        ".....ohhhhhhhhho.................",
        "....ohhhhhho....ommmmo...........",
        "...ohhhho.....omMmmmmmo..........",
        "..ohhho......ommMmmmmmmo.........",
        ".ohho.......ommmmmmmmmo..........",
        "oho...oooobbbbbbbbbbo............",
        "......obbbbbbbbbbbbbbbo..........",
        ".....obbbbbeBbbbbbbbbbbo.........",
        "....obbbbbbbbbbbbbbbbbbbo........",
        "...obbbbbbnbbBbbbbbbbbbbo........",
        "...obbbbbbbbbbbbbbbbbbbo.........",
        "..obbbbbbbbbbbBbbbbbbbo..........",
        "..oBBbbbbbbbbbbbbbbbbo...ottto...",
        ".oBBBbbbbbbbbbbbbbbbo...oTttto...",
        ".oBBbbbbbbbbbbbbbbbo...otTtto....",
        "..oBbbbbbbbbbbbbbbo...ottto......",
        "..obbbbbbbbbbbbbo....otto........",
        "...obbbbooobbbo.....oo...........",
        "...obbo.ol.obbo..................",
        "...obo..ol..obo..................",
        "...ol...ol...ol..................",
        "...ol...ol...ol..................",
        "..oll..oll..oll..................",
        "..oo...oo...oo...................",
        "................................",
        "................................",
        "................................",
    ]

    attack3 = [
        "................................",
        "................................",
        ".ohhhhhhhhhhhhhhosss.............",
        "ohhhhhhhhhhhhhhosSss.............",
        ".ohhhhhhhhhhhoosSSs..............",
        "..ohhhhhho....osSs...............",
        "...ohhho....ommmmos..............",
        "....oho...omMmmmmmmo.............",
        "....o....ommMmmmmmmo.............",
        ".........ommmmmmmmmo.............",
        "....oooobbbbbbbbbbo..............",
        "....obbbbbbbbbbbbbbbo............",
        "...obbbbbeBbbbbbbbbbbo...........",
        "..obbbbbbbbbbbbbbbbbbbo..........",
        ".obbbbbbnbbBbbbbbbbbbbo..........",
        ".obbbbbbbbbbbbbbbbbbbo...........",
        "obbbbbbbbbbbBbbbbbbbo............",
        "oBBbbbbbbbbbbbbbbbbo...ottto.....",
        "oBBBbbbbbbbbbbbbbbbo..oTttto.....",
        "oBBbbbbbbbbbbbbbbbo..otTtto......",
        ".oBbbbbbbbbbbbbbbo..ottto........",
        ".obbbbbbbbbbbbbo...otto..........",
        "..obbbbooobbbo....oo.............",
        "..obbo.ol.obbo...................",
        "..obo..ol..obo...................",
        "..ol...ol...ol...................",
        "..ol...ol...ol...................",
        ".oll..oll..oll...................",
        ".oo...oo...oo....................",
        "................................",
        "................................",
        "................................",
    ]

    return [attack1, attack2, attack3, attack2]

def get_shoot_frames():
    """Shooting magic from horn."""
    shoot1 = [
        "................................",
        "................................",
        "................................",
        "................................",
        "...........oh.....................",
        "..........ohho...................",
        ".........ohhho...................",
        "........ohhhho....ommmmo.........",
        ".......ohhhho...omMmmmmmo........",
        "......ohhho...ommMmmmmmmo........",
        ".....ohho....ommmmmmmmmo.........",
        "....oho.oooobbbbbbbbbbo..........",
        "........obbbbbbbbbbbbbbbo........",
        ".......obbbbbeBbbbbbbbbbbo.......",
        "......obbbbbbbbbbbbbbbbbbbo......",
        ".....obbbbbbnbbBbbbbbbbbbbo......",
        ".....obbbbbbbbbbbbbbbbbbbo.......",
        "....obbbbbbbbbbbBbbbbbbbo........",
        "....oBBbbbbbbbbbbbbbbbbo...ottto.",
        "...oBBBbbbbbbbbbbbbbbbo...oTttto.",
        "...oBBbbbbbbbbbbbbbbbo...otTtto..",
        "....oBbbbbbbbbbbbbbbo...ottto....",
        "....obbbbbbbbbbbbbo....otto......",
        ".....obbbbooobbbo.....oo.........",
        ".....obbo.ol.obbo..................",
        ".....obo..ol..obo.................",
        ".....ol...ol...ol.................",
        ".....ol...ol...ol.................",
        "....oll..oll..oll.................",
        "....oo...oo...oo..................",
        "................................",
        "................................",
    ]

    shoot2 = [
        "................................",
        "................................",
        "................................",
        "...........ohos..................",
        "..........ohhoss.................",
        ".........ohhhosss................",
        "........ohhhhossss...ommmmo......",
        ".......ohhhhosssss.omMmmmmmo.....",
        "......ohhhosssss.ommMmmmmmmo.....",
        ".....ohhossss...ommmmmmmmmo......",
        "....ohosss.oooobbbbbbbbbbo.......",
        "....oss.obbbbbbbbbbbbbbbo........",
        "........obbbbbbbbbbbbbbbo........",
        ".......obbbbbeBbbbbbbbbbbo.......",
        "......obbbbbbbbbbbbbbbbbbbo......",
        ".....obbbbbbnbbBbbbbbbbbbbo......",
        ".....obbbbbbbbbbbbbbbbbbbo.......",
        "....obbbbbbbbbbbBbbbbbbbo........",
        "....oBBbbbbbbbbbbbbbbbbo...ottto.",
        "...oBBBbbbbbbbbbbbbbbbo...oTttto.",
        "...oBBbbbbbbbbbbbbbbbo...otTtto..",
        "....oBbbbbbbbbbbbbbbo...ottto....",
        "....obbbbbbbbbbbbbo....otto......",
        ".....obbbbooobbbo.....oo.........",
        ".....obbo.ol.obbo..................",
        ".....obo..ol..obo.................",
        ".....ol...ol...ol.................",
        ".....ol...ol...ol.................",
        "....oll..oll..oll.................",
        "....oo...oo...oo..................",
        "................................",
        "................................",
    ]

    shoot3 = [
        "................................",
        "................................",
        "...........ohoSs.ssssss..........",
        "..........ohhosssSSSSSss.........",
        ".........ohhhossSSSSSSSss........",
        "........ohhhhosSSSSSSSSss........",
        ".......ohhhhosSSSSSSSSs..ommmmo..",
        "......ohhhhossSSSSSss..omMmmmmmo.",
        ".....ohhhossssssss...ommMmmmmmmo.",
        "....ohhosss.........ommmmmmmmmo..",
        "...ohoss...oooobbbbbbbbbbo.......",
        "...oss..obbbbbbbbbbbbbbbo........",
        "........obbbbbbbbbbbbbbbo........",
        ".......obbbbbeBbbbbbbbbbbo.......",
        "......obbbbbbbbbbbbbbbbbbbo......",
        ".....obbbbbbnbbBbbbbbbbbbbo......",
        ".....obbbbbbbbbbbbbbbbbbbo.......",
        "....obbbbbbbbbbbBbbbbbbbo........",
        "....oBBbbbbbbbbbbbbbbbbo...ottto.",
        "...oBBBbbbbbbbbbbbbbbbo...oTttto.",
        "...oBBbbbbbbbbbbbbbbbo...otTtto..",
        "....oBbbbbbbbbbbbbbbo...ottto....",
        "....obbbbbbbbbbbbbo....otto......",
        ".....obbbbooobbbo.....oo.........",
        ".....obbo.ol.obbo..................",
        ".....obo..ol..obo.................",
        ".....ol...ol...ol.................",
        ".....ol...ol...ol.................",
        "....oll..oll..oll.................",
        "....oo...oo...oo..................",
        "................................",
        "................................",
    ]

    return [shoot1, shoot2, shoot3, shoot2]

def get_hurt_frames():
    """Hurt/damage taken animation."""
    hurt = [
        "................................",
        "................................",
        "................................",
        "................................",
        "...........oh.....................",
        "..........ohho...................",
        ".........ohhho...................",
        "........ohhhho....ommmmo.........",
        ".......ohhhho...omMmmmmmo........",
        "......ohhho...ommMmmmmmmo........",
        ".....ohho....ommmmmmmmmo.........",
        "....oho.ooooxxxxxxxxxxxo..........",
        "........oxxxxxxxxxxxxxxxxo........",
        ".......oxxxxxxeBxxxxxxxxxo.......",
        "......oxxxxxxxxxxxxxxxxxxxxo......",
        ".....oxxxxxxnxxBxxxxxxxxxxxo......",
        ".....oxxxxxxxxxxxxxxxxxxxxo.......",
        "....oxxxxxxxxxxxxxxxxxxxxxxo........",
        "....oxxxxxxxxxxxxxxxxxxxx...ottto.",
        "...oxxxxxxxxxxxxxxxxxxxxxxo..oTttto.",
        "...oxxxxxxxxxxxxxxxxxxxxxxo..otTtto..",
        "....oxxxxxxxxxxxxxxxxxxxxo..ottto....",
        "....oxxxxxxxxxxxxxxxxo....otto......",
        ".....oxxxxoooxxxo.....oo.........",
        ".....oxxo.ol.oxxo..................",
        ".....oxo..ol..oxo.................",
        ".....ol...ol...ol.................",
        ".....ol...ol...ol.................",
        "....oll..oll..oll.................",
        "....oo...oo...oo..................",
        "................................",
        "................................",
    ]

    return [hurt]

def get_death_frames():
    """Death animation - collapse."""
    death1 = [
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "...........oh.....................",
        "..........ohho...................",
        ".........ohhho...................",
        "........ohhhho....ommmmo.........",
        ".......ohhhho...omMmmmmmo........",
        "......ohhho...ommMmmmmmmo........",
        ".....ohho....ommmmmmmmmo.........",
        "....oho.oooobbbbbbbbbbo..........",
        "........obbbbbbbbbbbbbbbo........",
        ".......obbbbbeBbbbbbbbbbbo.......",
        "......obbbbbbbbbbbbbbbbbbbo......",
        ".....obbbbbbnbbBbbbbbbbbbbo......",
        ".....obbbbbbbbbbbbbbbbbbbo.......",
        "....obbbbbbbbbbbBbbbbbbbo...ottto",
        "....oBBbbbbbbbbbbbbbbbbo...oTttto",
        "...oBBBbbbbbbbbbbbbbbbo...otTtto.",
        "...oBBbbbbbbbbbbbbbo.....ottto...",
        "....oBbbbbbbbbbbo........oo......",
        "....obbbbooobbbo.................",
        ".....obbooloobbbo................",
        "......olol.oloolo................",
        ".......oo...oo...................",
        "................................",
        "................................",
        "................................",
        "................................",
    ]

    death2 = [
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "..ottttttttttto..................",
        ".oTTTTTTTTTTTTTo.................",
        "ohhhoommmmmmmmmmmo...............",
        "ohhobbbbbbbbbbbbbbbbbbbbbbo......",
        "ohobbbbbeBbbbbbbbbbbbbbbbbbo.....",
        "oobbbbbbbbbbbbnbBbbbbbbbbbbo.....",
        "oBBBBBBBBBBBBBBBBBBBBBBBBBBo.....",
        "ooooolooolooolooolooooloooo......",
        "................................",
        "................................",
        "................................",
        "................................",
    ]

    death3 = [
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "................................",
        "..s..s...s..s..s.................",
        "...s..s.s..s..s..................",
        "..s.s..s..s.s.s..................",
        "...s.s.s.s.s..s..................",
        "....sssssss......................",
        "................................",
        "................................",
        "................................",
    ]

    return [death1, death2, death3]

def apply_rainbow_mane(frame_data, frame_num):
    """Apply rainbow gradient to mane for rainbow unicorn."""
    # Rainbow colors for mane based on frame
    rainbow_colors = ['m', '1', '2', '3', '4', '5']
    offset = frame_num % len(rainbow_colors)

    new_frame = []
    for row in frame_data:
        new_row = ""
        for c in row:
            if c == 'm':
                new_row += rainbow_colors[offset]
            elif c == 'M':
                new_row += rainbow_colors[(offset + 1) % len(rainbow_colors)]
            else:
                new_row += c
        new_frame.append(new_row)
    return new_frame

def main():
    os.makedirs('assets/player', exist_ok=True)

    variants = [
        ('white', get_white_palette()),
        ('pink', get_pink_palette()),
        ('rainbow', get_rainbow_palette()),
    ]

    animations = {
        'idle': get_idle_frames(),
        'run': get_run_frames(),
        'jump': get_jump_frames(),
        'attack': get_attack_frames(),
        'shoot': get_shoot_frames(),
        'hurt': get_hurt_frames(),
        'death': get_death_frames(),
    }

    for variant_name, palette in variants:
        print(f"Generating {variant_name} unicorn...")
        os.makedirs(f'assets/player/{variant_name}', exist_ok=True)

        for anim_name, frames in animations.items():
            for i, frame_data in enumerate(frames):
                # Apply rainbow mane effect for rainbow variant
                if variant_name == 'rainbow':
                    frame_data = apply_rainbow_mane(frame_data, i)

                sprite = create_sprite(32, 32, frame_data, palette)
                scaled = scale_sprite(sprite, 4)
                scaled.save(f'assets/player/{variant_name}/{anim_name}_{i}.png')

        print(f"  Created: {variant_name}/ (idle, run, jump, attack, shoot, hurt, death)")

    print("\nAll unicorn sprites generated!")

if __name__ == '__main__':
    main()

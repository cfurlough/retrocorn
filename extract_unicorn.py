"""
Extract unicorn sprites from strip images into individual frames
"""

from PIL import Image
import os

def extract_strip(strip_path, output_dir, name, frame_count, frame_width=32, frame_height=32):
    """Extract frames from a horizontal sprite strip"""
    strip = Image.open(strip_path)

    # Auto-detect frame dimensions if strip is different
    strip_width, strip_height = strip.size

    # Calculate frame width based on frame count
    actual_frame_width = strip_width // frame_count
    actual_frame_height = strip_height

    print(f"  {name}: {strip_width}x{strip_height}, {frame_count} frames of {actual_frame_width}x{actual_frame_height}")

    for i in range(frame_count):
        left = i * actual_frame_width
        frame = strip.crop((left, 0, left + actual_frame_width, actual_frame_height))

        # Scale up 2x for better visibility (32->64 or similar)
        scale = 3
        new_size = (actual_frame_width * scale, actual_frame_height * scale)
        frame = frame.resize(new_size, Image.NEAREST)

        frame.save(os.path.join(output_dir, f"{name}_{i}.png"))

def main():
    source_dir = "Unicorn Assets/unicorn_strips"
    output_dir = "assets/player/rainbow"

    os.makedirs(output_dir, exist_ok=True)

    # Animation definitions: (filename, output_name, frame_count)
    animations = [
        ("unicorn_idle.png", "idle", 4),
        ("unicorn_run.png", "run", 6),
        ("unicorn_jump.png", "jump", 4),
        ("unicorn_fall.png", "fall", 2),
        ("unicorn_attack.png", "attack", 4),
        ("unicorn_shoot.png", "shoot", 4),
        ("unicorn_hit.png", "hurt", 2),
        ("unicorn_death.png", "death", 4),
    ]

    print("Extracting unicorn sprites...")

    for filename, name, frame_count in animations:
        strip_path = os.path.join(source_dir, filename)
        if os.path.exists(strip_path):
            extract_strip(strip_path, output_dir, name, frame_count)
        else:
            print(f"  Warning: {strip_path} not found")

    # Copy to other variants (pink, white) with color modifications
    print("\nCreating color variants...")
    create_color_variants(output_dir)

    print("\nDone!")

def create_color_variants(rainbow_dir):
    """Create pink and white variants from rainbow unicorn"""

    pink_dir = "assets/player/pink"
    white_dir = "assets/player/white"

    os.makedirs(pink_dir, exist_ok=True)
    os.makedirs(white_dir, exist_ok=True)

    # Get all rainbow frames
    for filename in os.listdir(rainbow_dir):
        if not filename.endswith('.png'):
            continue

        img = Image.open(os.path.join(rainbow_dir, filename)).convert('RGBA')

        # Create pink variant - shift rainbow colors to pink
        pink_img = img.copy()
        pixels = pink_img.load()
        for y in range(pink_img.height):
            for x in range(pink_img.width):
                r, g, b, a = pixels[x, y]
                if a > 0:  # Only modify non-transparent pixels
                    # Shift towards pink (increase red, reduce other colors slightly)
                    new_r = min(255, int(r * 1.1 + 40))
                    new_g = int(g * 0.7)
                    new_b = int(b * 0.9 + 30)
                    pixels[x, y] = (new_r, new_g, new_b, a)
        pink_img.save(os.path.join(pink_dir, filename))

        # Create white variant - desaturate and brighten
        white_img = img.copy()
        pixels = white_img.load()
        for y in range(white_img.height):
            for x in range(white_img.width):
                r, g, b, a = pixels[x, y]
                if a > 0:
                    # Keep horn golden, make body white/silver
                    avg = (r + g + b) // 3
                    # If it's a bright/saturated color (mane/tail), make it silver-blue
                    if max(r, g, b) - min(r, g, b) > 50:
                        new_r = min(255, avg + 60)
                        new_g = min(255, avg + 65)
                        new_b = min(255, avg + 80)
                    else:
                        # Body - make white
                        new_r = min(255, avg + 80)
                        new_g = min(255, avg + 80)
                        new_b = min(255, avg + 85)
                    pixels[x, y] = (new_r, new_g, new_b, a)
        white_img.save(os.path.join(white_dir, filename))

    print(f"  Created pink variant in {pink_dir}")
    print(f"  Created white variant in {white_dir}")

if __name__ == "__main__":
    main()

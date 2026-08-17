#!/usr/bin/env python3

from PIL import Image, ImageDraw
import random
from pathlib import Path

SEED = 421337

WIDTH = 2048
HEIGHT = 384

OUT = Path("scenes/demo")


def weighted_height(rng, min_h, max_h):
    # Bias strongly toward shorter buildings.
    t = rng.random() ** 2.4
    return int(min_h + t * (max_h - min_h))


def make_layer(
    filename,
    seed,
    building_count,
    min_width,
    max_width,
    min_height,
    max_height,
    tower_chance,
    antenna_chance,
):
    rng = random.Random(seed)

    image = Image.new("L", (WIDTH, HEIGHT), 0)
    draw = ImageDraw.Draw(image)

    buildings = []

    # Generate slightly more than one screen-width so we can
    # deliberately make the left/right boundary seamless.
    x = 0

    while x < WIDTH:
        w = rng.randint(min_width, max_width)

        h = weighted_height(
            rng,
            min_height,
            max_height,
        )

        # Rare skyscrapers.
        if rng.random() < tower_chance:
            h = rng.randint(
                int(max_height * 0.75),
                min(HEIGHT - 25, int(max_height * 1.55)),
            )

            w = rng.randint(
                max(min_width, int(min_width * 0.8)),
                max(min_width + 1, int(max_width * 0.75)),
            )

        gap = rng.randint(2, 12)

        buildings.append(
            {
                "x": x,
                "w": w,
                "h": h,
                "antenna": rng.random() < antenna_chance,
                "roof": rng.choice(
                    [
                        "flat",
                        "flat",
                        "flat",
                        "step",
                        "spire",
                    ]
                ),
            }
        )

        x += w + gap

    ground = HEIGHT - 1

    for b in buildings:
        x0 = b["x"]
        x1 = min(WIDTH - 1, x0 + b["w"])

        top = ground - b["h"]

        # Main body
        draw.rectangle(
            [x0, top, x1, ground],
            fill=255,
        )

        if b["roof"] == "step":
            inset = max(2, b["w"] // 5)

            draw.rectangle(
                [
                    x0 + inset,
                    top - 8,
                    x1 - inset,
                    top,
                ],
                fill=255,
            )

        elif b["roof"] == "spire":
            cx = (x0 + x1) // 2

            draw.polygon(
                [
                    (x0, top),
                    (cx, top - 14),
                    (x1, top),
                ],
                fill=255,
            )

        if b["antenna"]:
            cx = (x0 + x1) // 2

            antenna_h = rng.randint(10, 40)

            draw.rectangle(
                [
                    cx,
                    top - antenna_h,
                    cx + 1,
                    top,
                ],
                fill=255,
            )

    # Force the bottom to be solid.
    draw.rectangle(
        [0, HEIGHT - 4, WIDTH, HEIGHT],
        fill=255,
    )

    image.save(OUT / filename)

    print(
        filename,
        "seed:",
        seed,
        "buildings:",
        len(buildings),
    )


OUT.mkdir(parents=True, exist_ok=True)

make_layer(
    "skyline-far.png",
    SEED + 100,
    building_count=100,
    min_width=10,
    max_width=28,
    min_height=20,
    max_height=105,
    tower_chance=0.035,
    antenna_chance=0.08,
)

make_layer(
    "skyline-mid.png",
    SEED + 200,
    building_count=70,
    min_width=18,
    max_width=42,
    min_height=35,
    max_height=160,
    tower_chance=0.065,
    antenna_chance=0.13,
)

make_layer(
    "skyline-near.png",
    SEED + 300,
    building_count=45,
    min_width=28,
    max_width=70,
    min_height=45,
    max_height=215,
    tower_chance=0.09,
    antenna_chance=0.16,
)
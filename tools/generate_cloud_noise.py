"""Generate the seamless noise lookup used by the lightweight cloud shader."""

from pathlib import Path

import numpy as np
from PIL import Image


SIZE = 1024
OUTPUT = Path(__file__).parents[1] / "scenes/demo/cloud-noise.png"


def smooth_curve(value: np.ndarray) -> np.ndarray:
    return value * value * value * (value * (value * 6.0 - 15.0) + 10.0)


def value_noise(rng: np.random.Generator, frequency: int) -> np.ndarray:
    lattice = rng.random((frequency, frequency), dtype=np.float32)
    coordinate = np.arange(SIZE, dtype=np.float32) * frequency / SIZE
    cell = np.floor(coordinate).astype(np.int32)
    blend = smooth_curve(coordinate - cell)
    following = (cell + 1) % frequency
    cell %= frequency

    lower_left = lattice[cell[:, None], cell[None, :]]
    lower_right = lattice[cell[:, None], following[None, :]]
    upper_left = lattice[following[:, None], cell[None, :]]
    upper_right = lattice[following[:, None], following[None, :]]

    lower = lower_left + (lower_right - lower_left) * blend[None, :]
    upper = upper_left + (upper_right - upper_left) * blend[None, :]
    return lower + (upper - lower) * blend[:, None]


def periodic_noise(seed: int) -> np.ndarray:
    rng = np.random.default_rng(seed)
    result = np.zeros((SIZE, SIZE), dtype=np.float32)
    weight_sum = 0.0

    for frequency, weight in ((3, 0.46), (6, 0.26), (12, 0.15), (24, 0.08), (48, 0.05)):
        result += value_noise(rng, frequency) * weight
        weight_sum += weight

    result = result / weight_sum
    result = (result - result.min()) / (result.max() - result.min())
    return result


channels = [periodic_noise(seed) for seed in (7, 19, 43, 81)]
pixels = np.stack(channels, axis=-1)
Image.fromarray(np.uint8(np.clip(pixels, 0.0, 1.0) * 255)).save(
    OUTPUT,
    optimize=True,
)
print(OUTPUT)

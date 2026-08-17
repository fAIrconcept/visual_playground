import { mulberry32, range } from "./util.js";

export class City {
  constructor() {
    this.cameraX = 0;
    this.seed = Date.now() >>> 0;

    this.tiers = [
      { speed: 0.22, baseY: 0.46, scale: 0.55, buildings: [] },
      { speed: 0.52, baseY: 0.60, scale: 0.78, buildings: [] },
      { speed: 1.00, baseY: 0.77, scale: 1.00, buildings: [] },
    ];

    this.regenerate();
  }

  regenerate() {
    this.seed = (this.seed + 1) >>> 0;
    const rnd = mulberry32(this.seed);

    for (let ti = 0; ti < this.tiers.length; ti++) {
      const tier = this.tiers[ti];
      tier.buildings.length = 0;

      let x = -0.2;
      const count = ti === 0 ? 34 : ti === 1 ? 28 : 24;

      for (let i = 0; i < count; i++) {
        const w = range(rnd, 0.035, 0.085);
        const d = range(rnd, 0.018, 0.050);
        const h = range(rnd, 0.07, 0.32) * (0.75 + ti * 0.18);

        tier.buildings.push({
          x,
          w,
          d,
          h,
          baseH: h,
          pulse: range(rnd, 0.0, 0.045),
          phase: range(rnd, 0, Math.PI * 2),
        });

        x += w + range(rnd, 0.006, 0.025);
      }

      tier.worldWidth = x + 0.2;
    }
  }

  update(dt, input) {
    const autoSpeed = 0.055;
    this.cameraX += autoSpeed * dt;

    if (input.dragDX !== 0) {
      this.cameraX -= input.dragDX * 0.0016;
      input.dragDX = 0;
    }
  }
}

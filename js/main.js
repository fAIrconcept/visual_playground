import { LayerCompositor } from "./renderer.js";
import { Input } from "./input.js";

const canvas = document.querySelector("#gl");
const fpsEl = document.querySelector("#fps");

async function start() {
  try {
    const input = new Input(canvas);
    const app = new LayerCompositor(canvas);

    await app.loadScene("./scenes/demo/scene.json");

    let last = performance.now();
    let yaw = 0;

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.floor(innerWidth * dpr);
      canvas.height = Math.floor(innerHeight * dpr);
      app.resize(canvas.width, canvas.height);
    }

    resize();
    addEventListener("resize", resize);

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      yaw += 0.025 * dt;
      yaw += input.consumeDX() * 0.004;

      app.render({
        time: now * 0.001,
        yaw,
        pointer: input.pointer
      });

      fpsEl.textContent = "running";

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);

  } catch (err) {
    console.error(err);

    document.body.innerHTML += `
      <pre style="
        position:fixed;
        inset:10px;
        z-index:9999;
        color:#ff8080;
        background:#000d;
        padding:12px;
        overflow:auto;
        white-space:pre-wrap;
      ">${err.stack || err}</pre>
    `;
  }
}

start();
import { LayerCompositor } from "./renderer.js";
import { Input } from "./input.js";

const canvas = document.querySelector("#gl");
const fpsEl = document.querySelector("#fps");
const cloudControls = document.querySelector("#cloud-controls");
const cloudContrastInput = document.querySelector("#cloud-contrast");
const cloudContrastValue = document.querySelector("#cloud-contrast-value");
const viewPitchInput = document.querySelector("#view-pitch");
const viewPitchValue = document.querySelector("#view-pitch-value");

function toggleControls() {
  cloudControls.classList.toggle("is-hidden");
}

canvas.addEventListener("dblclick", toggleControls);

let lastTouch = null;

canvas.addEventListener("pointerup", (event) => {
  if (event.pointerType !== "touch") {
    return;
  }

  const touch = { time: performance.now(), x: event.clientX, y: event.clientY };

  if (
    lastTouch &&
    touch.time - lastTouch.time < 350 &&
    Math.hypot(touch.x - lastTouch.x, touch.y - lastTouch.y) < 40
  ) {
    toggleControls();
    lastTouch = null;
  } else {
    lastTouch = touch;
  }
});

async function start() {
  try {
    const input = new Input(canvas);
    const app = new LayerCompositor(canvas);

    await app.loadScene("./scenes/demo/scene.json");

    function updateCloudContrast() {
      const value = Number(cloudContrastInput.value);

      cloudContrastValue.value = value.toFixed(1);
      app.setCloudContrast(value);
    }

    cloudContrastInput.addEventListener("input", updateCloudContrast);
    updateCloudContrast();

    function updateViewPitch() {
      const value = Number(viewPitchInput.value);

      viewPitchValue.value = `${value}°`;
      app.setViewPitch(value);
    }

    viewPitchInput.addEventListener("input", updateViewPitch);
    updateViewPitch();

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
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        './service-worker.js',
        {
          scope: './'
        }
      );

      console.log(
        'Service worker registered:',
        registration.scope
      );
    } catch (err) {
      console.error(
        'Service worker registration failed:',
        err
      );
    }
  });
}
start();

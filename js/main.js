import { Renderer } from "./renderer.js";
import { City } from "./city.js";
import { Input } from "./input.js";

const canvas = document.querySelector("#gl");
const fpsEl = document.querySelector("#fps");
const regenBtn = document.querySelector("#regen");

const renderer = new Renderer(canvas);
const city = new City();
const input = new Input(canvas);

let last = performance.now();
let fpsTimer = 0;
let frames = 0;

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.floor(innerWidth * dpr));
  const h = Math.max(1, Math.floor(innerHeight * dpr));

  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    renderer.resize(w, h);
  }
}

regenBtn.addEventListener("click", () => city.regenerate());
addEventListener("resize", resize);
resize();

function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  city.update(dt, input);
  renderer.render(city, now * 0.001);

  frames++;
  fpsTimer += dt;
  if (fpsTimer >= 0.5) {
    fpsEl.textContent = `${Math.round(frames / fpsTimer)} fps`;
    fpsTimer = 0;
    frames = 0;
  }

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

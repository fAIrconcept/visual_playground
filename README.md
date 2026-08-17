# Isometric City WebGL Playground

Small no-build WebGL2 project intended for GitHub Pages and mobile browsers.
https://fairconcept.github.io/visual_playground/
## Files

- `index.html` — page shell
- `style.css` — fullscreen/mobile layout
- `js/main.js` — app loop
- `js/city.js` — procedural city state
- `js/renderer.js` — WebGL2 renderer
- `js/shaders.js` — GLSL shaders
- `js/input.js` — touch/pointer drag
- `js/util.js` — seeded random helpers

## Run locally

Because ES modules are used, serve the directory over HTTP rather than opening
`index.html` directly.

For example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## GitHub Pages

Push the contents to a repository, then configure GitHub Pages to publish the
repository root (or move these files into `/docs` and publish that folder).

No build step and no dependencies are required.

## Controls

- Drag horizontally: move through the city.
- `regen`: generate a new skyline.
- Automatic horizontal drift is enabled.

## Next experiments

Good places to hack:

- `js/city.js`: building generation, tier spacing, parallax.
- `js/renderer.js`: isometric geometry and colors.
- `js/shaders.js`: fog, glow, noise, scanlines, atmosphere.

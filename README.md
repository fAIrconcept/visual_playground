# GLSL Layer Compositor

https://fairconcept.github.io/visual_playground/

Tiny WebGL2 layer compositor for GitHub Pages / Android.

Design:
- Direct bounded rendering is the default.
- `rect` is enforced with viewport + scissor, so fragments outside the rectangle are not rasterized.
- FBO/texture work is opt-in via `resolution`, `target:"texture"`, or `input`.
- GLSL `#include` is supported.
- No npm, bundler, framework, or build step.

Scene example:
```json
{"shader":"city-near.frag","rect":[0,0.70,1,0.30],"blend":"alpha"}
```

Half-resolution opt-in:
```json
{"shader":"clouds.frag","rect":[0,0,1,0.8],"resolution":0.5,"blend":"alpha"}
```

Dependent input opt-in:
```json
{"shader":"effect.frag","input":"previous","target":"texture"}
```
Then use `uniform sampler2D u_input;` in that shader.

Standard optional uniforms:
```glsl
uniform vec2 u_resolution;
uniform vec2 u_screenResolution;
uniform vec4 u_rect;
uniform float u_time;
uniform float u_yaw;
uniform float u_cloudContrast;
uniform vec2 u_pointer;
uniform sampler2D u_input;
```

Set `cloudContrast` on a scene layer to control `u_cloudContrast`; it defaults
to `1.7` when the shader declares the uniform.

Run locally with any HTTP server, e.g. `python3 -m http.server 8080`, or publish repository root with GitHub Pages.

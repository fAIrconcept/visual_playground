import { loadText, createProgram, loadTexture } from "./gl.js";
import { loadShaderWithIncludes } from "./includes.js";

export class LayerCompositor {
  constructor(canvas) {
    this.canvas = canvas;

    this.gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    });

    if (!this.gl) {
      throw new Error("WebGL2 is required");
    }

    this.layers = [];
    this.width = 1;
    this.height = 1;

    const gl = this.gl;

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
  }

  async loadScene(url) {
    const sceneURL = new URL(url, location.href).href;

    const scene = JSON.parse(await loadText(sceneURL));

    const vertexURL = new URL(
      scene.vertex ?? "../../shaders/fullscreen.vert",
      sceneURL,
    ).href;

    const vertexSource = await loadShaderWithIncludes(vertexURL);

    const layers = [];

    for (const spec of scene.layers) {
      const fragURL = new URL(spec.shader, sceneURL).href;

      const fragSource = await loadShaderWithIncludes(fragURL);

      const program = createProgram(this.gl, vertexSource, fragSource, fragURL);

      let texture = null;

      if (spec.texture) {
        const textureURL = new URL(spec.texture, sceneURL).href;

        texture = await loadTexture(this.gl, textureURL);
      }

      layers.push({
        spec,
        program,
        texture,

        uniforms: {
          resolution: this.gl.getUniformLocation(program, "u_resolution"),

          screenResolution: this.gl.getUniformLocation(
            program,
            "u_screenResolution",
          ),

          time: this.gl.getUniformLocation(program, "u_time"),

          yaw: this.gl.getUniformLocation(program, "u_yaw"),

          pointer: this.gl.getUniformLocation(program, "u_pointer"),

          texture: this.gl.getUniformLocation(program, "u_texture"),
          parallax: this.gl.getUniformLocation(program, "u_parallax"),

          opacity: this.gl.getUniformLocation(program, "u_opacity"),

          color: this.gl.getUniformLocation(program, "u_color"),
        },
      });
    }

    for (const layer of this.layers) {
      this.gl.deleteProgram(layer.program);
    }

    this.layers = layers;
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
  }

  rectPixels(rect) {
    const [x, y, w, h] = rect ?? [0, 0, 1, 1];

    const px = Math.floor(x * this.width);

    const pyTop = Math.floor(y * this.height);

    const pw = Math.max(1, Math.floor(w * this.width));

    const ph = Math.max(1, Math.floor(h * this.height));

    const py = this.height - pyTop - ph;

    return [px, py, pw, ph];
  }

  applyBlend(mode = "alpha") {
    const gl = this.gl;

    if (mode === "replace") {
      gl.disable(gl.BLEND);
      return;
    }

    gl.enable(gl.BLEND);

    if (mode === "add") {
      gl.blendFunc(gl.ONE, gl.ONE);
    } else {
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }
  }

  render(state) {
    const gl = this.gl;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.viewport(0, 0, this.width, this.height);

    gl.disable(gl.SCISSOR_TEST);

    gl.disable(gl.BLEND);

    gl.clearColor(0, 0, 0, 1);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindVertexArray(this.vao);

    for (const layer of this.layers) {
      const rect = layer.spec.rect ?? [0, 0, 1, 1];

      const [x, y, w, h] = this.rectPixels(rect);

      gl.viewport(x, y, w, h);

      gl.enable(gl.SCISSOR_TEST);

      gl.scissor(x, y, w, h);

      this.applyBlend(layer.spec.blend);

      gl.useProgram(layer.program);

      const u = layer.uniforms;

      if (u.resolution) {
        gl.uniform2f(u.resolution, w, h);
      }

      if (u.screenResolution) {
        gl.uniform2f(u.screenResolution, this.width, this.height);
      }

      if (u.rect) {
        gl.uniform4f(u.rect, rect[0], rect[1], rect[2], rect[3]);
      }

      if (u.time) {
        gl.uniform1f(u.time, state.time ?? 0);
      }

      if (u.yaw) {
        gl.uniform1f(u.yaw, state.yaw ?? 0);
      }

      if (u.pointer) {
        gl.uniform2f(u.pointer, ...(state.pointer ?? [0, 0]));
      }
      if (u.parallax) {
        gl.uniform1f(u.parallax, layer.spec.parallax ?? 0.0);
      }

      if (u.opacity) {
        gl.uniform1f(u.opacity, layer.spec.opacity ?? 1.0);
      }

      if (u.color) {
        const color = layer.spec.color ?? [1.0, 1.0, 1.0];

        gl.uniform3f(u.color, color[0], color[1], color[2]);
      }
      if (layer.texture && layer.uniforms.texture) {
        gl.activeTexture(gl.TEXTURE0);

        gl.bindTexture(gl.TEXTURE_2D, layer.texture);

        gl.uniform1i(layer.uniforms.texture, 0);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    gl.disable(gl.SCISSOR_TEST);
  }
}

import { vertexShader, fragmentShader } from "./shaders.js";

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

function program(gl, vs, fs) {
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);

  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p));
  }
  return p;
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: true,
      powerPreference: "high-performance",
    });

    if (!this.gl) throw new Error("WebGL2 unavailable");

    const gl = this.gl;
    this.program = program(gl, vertexShader, fragmentShader);
    this.uResolution = gl.getUniformLocation(this.program, "u_resolution");

    this.vao = gl.createVertexArray();
    this.vbo = gl.createBuffer();

    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);

    const stride = 6 * 4;

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, stride, 0);

    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, stride, 2 * 4);

    gl.bindVertexArray(null);
  }

  resize(w, h) {
    this.gl.viewport(0, 0, w, h);
  }

  pushTri(out, a, b, c, color) {
    for (const p of [a, b, c]) {
      out.push(p[0], p[1], color[0], color[1], color[2], color[3]);
    }
  }

  pushQuad(out, a, b, c, d, color) {
    this.pushTri(out, a, b, c, color);
    this.pushTri(out, a, c, d, color);
  }

  building(out, x, groundY, w, d, h, scale, time, pulse, phase) {
    const isoX = d * 0.65;
    const isoY = d * 0.36;
    const H = h + Math.sin(time * 1.8 + phase) * pulse;

    const left  = [x, groundY];
    const right = [x + w, groundY];
    const upR   = [x + w + isoX, groundY - isoY];
    const upL   = [x + isoX, groundY - isoY];

    const topL  = [upL[0], upL[1] - H];
    const topR  = [upR[0], upR[1] - H];
    const topF1 = [left[0], left[1] - H];
    const topF2 = [right[0], right[1] - H];

    const front = [0.025, 0.004, 0.035, 1];
    const side  = [0.050, 0.008, 0.065, 1];
    const roof  = [0.22, 0.015, 0.22, 1];

    this.pushQuad(out, topF1, topF2, right, left, front);
    this.pushQuad(out, topF2, topR, upR, right, side);
    this.pushQuad(out, topF1, topL, topR, topF2, roof);
  }

  render(city, time) {
    const gl = this.gl;
    const w = this.canvas.width;
    const h = this.canvas.height;

    gl.clearColor(0.075, 0.0, 0.095, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const verts = [];

    // background purple haze as large screen bands
    const bg1 = [0.12, 0.0, 0.16, 1];
    const bg2 = [0.30, 0.0, 0.28, 1];
    this.pushQuad(verts, [0,0], [w,0], [w,h], [0,h], bg1);
    this.pushQuad(verts, [0,h*0.25], [w,h*0.25], [w,h*0.75], [0,h*0.75], bg2);

    for (let ti = 0; ti < city.tiers.length; ti++) {
      const tier = city.tiers[ti];
      const pxScale = w;
      const y = tier.baseY * h;

      for (const b of tier.buildings) {
        let wx = b.x - city.cameraX * tier.speed;

        // wrap endlessly
        const worldWidth = tier.worldWidth;
        wx = ((wx % worldWidth) + worldWidth) % worldWidth;
        wx -= 0.10;

        const x = wx * pxScale;
        const bw = b.w * pxScale * tier.scale;
        const bd = b.d * pxScale * tier.scale;
        const bh = b.baseH * h * tier.scale;
        const pulse = b.pulse * h;

        this.building(
          verts, x, y, bw, bd, bh,
          tier.scale, time, pulse, b.phase
        );
      }
    }

    gl.useProgram(this.program);
    gl.uniform2f(this.uResolution, w, h);

    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, verts.length / 6);
    gl.bindVertexArray(null);
  }
}

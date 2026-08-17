export const vertexShader = `#version 300 es
precision highp float;

layout(location=0) in vec2 a_pos;
layout(location=1) in vec4 a_color;

uniform vec2 u_resolution;

out vec4 v_color;

void main() {
  vec2 p = a_pos / u_resolution;
  vec2 clip = p * 2.0 - 1.0;
  clip.y *= -1.0;

  gl_Position = vec4(clip, 0.0, 1.0);
  v_color = a_color;
}
`;

export const fragmentShader = `#version 300 es
precision highp float;

in vec4 v_color;
out vec4 outColor;

void main() {
  outColor = v_color;
}
`;

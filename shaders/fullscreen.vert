#version 300 es
precision highp float;
out vec2 v_uv;
void main() {
    vec2 p = gl_VertexID == 0 ? vec2(-1, -1) : gl_VertexID == 1 ? vec2(3, -1) : vec2(-1, 3);
    v_uv = p * .5 + .5;
    gl_Position = vec4(p, 0, 1);
}

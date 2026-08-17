#version 300 es
precision highp float;
#include "../../shaders/common.glsl"
uniform vec2 u_resolution;
uniform float u_time, u_yaw;
out vec4 fragColor;
float fbm(vec2 p) {
    float v = 0., a = .5;
    for (int i = 0; i < 4; i++) {
        v += a * noise2(p);
        p = p * 2.03 + vec2(17.1, 9.2);
        a *= .5;
    }
    return v;
}
void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;

    float aspect = u_resolution.x / u_resolution.y;

    vec2 p = vec2(
        uv.x * aspect,
        uv.y
    );
    float n = fbm(
    vec2(
        p.x * 3.4 + u_yaw * 0.06 + u_time * 0.006,
        p.y * 2.8
    )
    );
    float m =
        smoothstep(.48, .72, n) * smoothstep(.05, .18, uv.y) * (1. - smoothstep(.80, 1., uv.y));
    vec3 c = mix(vec3(.025, .012, .05), vec3(.48, .055, .18), smoothstep(.52, .78, n));
    fragColor = vec4(c, m * .72);
}
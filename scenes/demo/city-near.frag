#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_yaw;
uniform sampler2D u_texture;

out vec4 fragColor;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;

    float x = fract(
        uv.x + u_yaw * 0.10
    );

    float mask = texture(
        u_texture,
        vec2(x, uv.y)
    ).r;

/*     vec3 city = vec3(
        0.003,
        0.001,
        0.006
    ); */

    vec3 city = vec3(0.0, 0.0, 1.0);
    fragColor = vec4(
        city,
        mask
    );
}
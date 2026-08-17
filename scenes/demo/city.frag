#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_yaw;

uniform sampler2D u_texture;

uniform float u_parallax;
uniform float u_opacity;
uniform vec3 u_color;

out vec4 fragColor;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;

    float x = fract(
        uv.x + u_yaw * u_parallax
    );

    float mask = texture(
        u_texture,
        vec2(x, uv.y)
    ).r;

    fragColor = vec4(
        u_color,
        mask * u_opacity
    );
}
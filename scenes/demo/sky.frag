#version 300 es
precision highp float;
uniform vec2 u_resolution;
out vec4 fragColor;
void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec3 horizon = vec3(1.0, .20, .075);
    vec3 middle = vec3(.40, .055, .24);
    vec3 zenith = vec3(.055, .035, .13);
    vec3 c = mix(horizon, middle, smoothstep(.03, .52, uv.y));
    c = mix(c, zenith, smoothstep(.46, 1., uv.y));
    c += vec3(.24, .035, .10) * exp(-5.0 * uv.y);
    float sun = exp(-90. * distance(uv, vec2(.52, .19)));
    c += vec3(1., .55, .18) * sun * 1.3;
    fragColor = vec4(c, 1);
}

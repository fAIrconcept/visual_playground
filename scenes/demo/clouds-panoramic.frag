#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_yaw;
uniform float u_cloudContrast;
uniform float u_viewPitch;
uniform sampler2D u_texture;

out vec4 fragColor;

float cloudDensity(vec2 p, float heightMask)
{
    vec4 broad = texture(u_texture, p * 0.34);
    vec4 detail = texture(u_texture, p * 0.83 + vec2(0.17, 0.31));

    float roundBillows = 1.0 - abs(broad.g * 2.0 - 1.0);
    float shape = broad.r * 0.58 + roundBillows * 0.25 + detail.b * 0.17;

    float contrast = clamp(u_cloudContrast, 0.0, 3.0);
    float edgeWidth = mix(0.22, 0.035, contrast / 3.0);
    float cloud = smoothstep(
        0.585 - edgeWidth,
        0.585 + edgeWidth,
        shape
    );

    return smoothstep(0.08, 0.72, cloud * heightMask);
}

void main()
{
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float aspect = u_resolution.x / u_resolution.y;
    float horizon = 0.19 - tan(radians(u_viewPitch)) * 0.45;
    vec2 view = vec2((uv.x - 0.5) * aspect, uv.y - horizon);
    vec3 viewRay = normalize(vec3(view, 1.0));
    vec2 wind = vec2(u_time * 0.008 + u_yaw * 0.035, u_time * 0.001);

    // Project onto viewing direction like a sky dome. Unlike a horizontal
    // plane, this remains continuous at the horizon and cannot streak there.
    vec2 p = vec2(
        atan(viewRay.x, viewRay.z) * 0.85,
        asin(clamp(viewRay.y, -1.0, 1.0)) * 1.10
    ) + wind;

    float lowerFade = smoothstep(0.0, 0.09, view.y);
    float heightSignal = 1.0 - texture(u_texture, p * 0.34).r;
    float localTop = mix(
        0.70,
        1.12,
        smoothstep(0.20, 0.82, heightSignal)
    );
    float upperFade = 1.0 - smoothstep(localTop - 0.22, localTop, uv.y);
    float heightMask = lowerFade * upperFade;

    float density = cloudDensity(p, heightMask);

    // Two nearby samples approximate the old volume's sun-facing surface and
    // small-scale depth, but require only texture reads instead of ray marching.
    vec2 screenToSun = normalize(vec2(0.52, 0.19) - uv);
    float towardSun = cloudDensity(p + screenToSun * 0.028, heightMask);
    // Surface relief is intentionally much broader than texture detail so the
    // front reads as large rolling cloud forms rather than fine embossing.
    vec2 fineUv = p * 0.25 + vec2(0.41, 0.09);
    float fineDepth = texture(u_texture, fineUv).a;
    float fineRight = texture(u_texture, fineUv + vec2(0.012, 0.0)).a;
    float fineLeft = texture(u_texture, fineUv - vec2(0.012, 0.0)).a;
    float fineUp = texture(u_texture, fineUv + vec2(0.0, 0.012)).a;
    float fineDown = texture(u_texture, fineUv - vec2(0.0, 0.012)).a;

    // Treat the precomputed noise as a bump map. Central differences give a
    // rounded surface rather than a flat color variation.
    vec3 surfaceNormal = normalize(vec3(
        (fineLeft - fineRight) * 5.5,
        (fineDown - fineUp) * 5.5,
        0.38
    ));
    vec3 directionToSun = normalize(vec3(screenToSun, 0.42));
    float rawBumpLight = dot(surfaceNormal, directionToSun);
    float bumpLight = smoothstep(-0.35, 0.85, rawBumpLight);
    float surfaceRelief = mix(0.78, 1.08, bumpLight);

    float surfaceLight = smoothstep(-0.03, 0.16, density - towardSun);
    float horizonGlow = 1.0 - smoothstep(0.10, 0.78, uv.y);
    float overhead = smoothstep(0.38, 0.95, uv.y);

    vec3 shadowColor = vec3(0.045, 0.025, 0.085);
    vec3 ambientColor = vec3(0.24, 0.12, 0.29);
    vec3 sunColor = vec3(1.0, 0.48, 0.27);
    vec3 skyColor = vec3(0.34, 0.24, 0.46);
    vec3 groundBounceColor = vec3(0.48, 0.10, 0.16);

    float upwardSurface = surfaceNormal.y * 0.5 + 0.5;
    vec3 indirectLight =
        skyColor * mix(0.16, 0.34, upwardSurface) +
        groundBounceColor * mix(0.22, 0.08, upwardSurface);

    vec3 color = mix(
        shadowColor,
        ambientColor,
        0.28 + overhead * 0.30 + bumpLight * 0.10
    );
    color += indirectLight * (0.48 + overhead * 0.18);
    color += sunColor * surfaceLight * bumpLight *
        (0.08 + horizonGlow * 0.28);

    // Break up the front face with shallow absorption and rounded highlights.
    float interior = smoothstep(0.30, 0.92, density);
    color *= mix(surfaceRelief, 0.88, interior);
    color += ambientColor * (0.13 + fineDepth * 0.09) * (1.0 - interior);
    color += skyColor * (0.035 + surfaceRelief * 0.025);

    float alpha = density * mix(0.66, 0.90, fineDepth);
    fragColor = vec4(color, alpha);
}

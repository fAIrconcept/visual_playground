import { loadText } from './gl.js';

const includeRE = /^\s*#include\s+"([^"]+)"\s*$/gm;

function resolveURL(path, baseURL) {
    return new URL(path, baseURL).href;
}

export async function loadShaderWithIncludes(url, stack = []) {
    const abs = new URL(url, location.href).href;

    if (stack.includes(abs)) {
        throw new Error(
            `Circular GLSL include:\n${[...stack, abs].join('\n -> ')}`
        );
    }

    let source = await loadText(abs);
    const matches = [...source.matchAll(includeRE)];

    for (const match of matches) {
        const includeURL = resolveURL(match[1], abs);

        const included = await loadShaderWithIncludes(
            includeURL,
            [...stack, abs]
        );

        source = source.replace(
            match[0],
            `\n// begin ${match[1]}\n${included}\n// end ${match[1]}\n`
        );
    }

    return source;
}
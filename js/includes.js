import{loadText}from'./gl.js';
const re=/^\s*#include\s+"([^"]+)"\s*$/gm;
export async function loadShader(url,stack=[]){const abs=new URL(url,location.href).href;if(stack.includes(abs))throw new Error('circular #include');let src=await loadText(abs);for(const m of[...src.matchAll(re)]){const child=new URL(m[1],abs).href;src=src.replace(m[0],await loadShader(child,[...stack,abs]))}return src}

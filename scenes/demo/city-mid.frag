#version 300 es
precision highp float;
#include "../../shaders/common.glsl"
uniform vec2 u_resolution;uniform float u_yaw;out vec4 fragColor;
void main(){vec2 uv=gl_FragCoord.xy/u_resolution;float x=fract(uv.x+u_yaw*.055),count=34.,id=floor(x*count),local=fract(x*count),h=.18+hash11(id+21.)*.58;if(hash11(id+33.)>.88)h+=.24;float b=step(.09,local)*step(local,.91)*step(uv.y,h);vec2 g=vec2(fract(x*120.),fract(uv.y*46.));float cell=hash21(floor(vec2(x*120.,uv.y*46.))+id);float win=b*step(.82,cell)*step(.28,g.x)*step(g.x,.55)*step(.25,g.y)*step(g.y,.55);fragColor=vec4(mix(vec3(.018,.006,.028),vec3(1.,.26,.07),win),b);}

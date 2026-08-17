#version 300 es
precision highp float;
#include "../../shaders/common.glsl"
uniform vec2 u_resolution;uniform float u_yaw;out vec4 fragColor;
void main(){vec2 uv=gl_FragCoord.xy/u_resolution;float x=fract(uv.x+u_yaw*.025),count=48.,id=floor(x*count),local=fract(x*count),h=.15+hash11(id+12.)*.5;if(hash11(id+70.)>.90)h+=.25;float b=step(.08,local)*step(local,.92)*step(uv.y,h);fragColor=vec4(.035,.01,.05,b*.88);}

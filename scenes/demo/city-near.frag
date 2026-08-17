#version 300 es
precision highp float;
#include "../../shaders/common.glsl"
uniform vec2 u_resolution;uniform float u_yaw;out vec4 fragColor;
void main(){vec2 uv=gl_FragCoord.xy/u_resolution;float x=fract(uv.x+u_yaw*.10),count=23.,id=floor(x*count),local=fract(x*count),h=.18+hash11(id+2.)*.58;if(hash11(id+100.)>.84)h+=.30;float body=step(.07,local)*step(local,.93)*step(uv.y,h);float ant=step(.76,hash11(id+55.))*step(abs(local-.5),.022)*step(uv.y,h+.14);float s=max(body,ant);fragColor=vec4(.006,.003,.012,s);}

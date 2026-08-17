#version 300 es
precision highp float;
uniform vec2 u_resolution;out vec4 fragColor;
void main(){vec2 uv=gl_FragCoord.xy/u_resolution;vec3 c=mix(vec3(1.,.23,.11),vec3(.38,.04,.20),smoothstep(.05,.48,uv.y));c=mix(c,vec3(.025,.018,.06),smoothstep(.45,1.,uv.y));float sun=exp(-90.*distance(uv,vec2(.52,.19)));c+=vec3(1.,.55,.18)*sun*1.3;fragColor=vec4(c,1);}

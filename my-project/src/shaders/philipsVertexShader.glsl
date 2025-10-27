varying vec2 vUv;
precision highp float;
void main(){
    vUv = uv;

    gl_Position =  vec4(position.xy, 0.0, 1.0);
}
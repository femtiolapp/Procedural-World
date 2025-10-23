//Hämtad från https://github.com/rreusser/glsl-fft
precision highp float;

varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
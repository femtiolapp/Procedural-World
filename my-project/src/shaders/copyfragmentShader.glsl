precision highp float;
varying vec2 vUv;
uniform sampler2D u_texture;

void main() {
    gl_FragColor = texture(u_texture, vUv);
}
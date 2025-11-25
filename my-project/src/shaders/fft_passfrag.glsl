//Hämtad från https://github.com/rreusser/glsl-fft
precision highp float;

#pragma glslify: fft = require(glsl-fft);

uniform highp sampler2D u_inputTexture; // The texture from the previous pass
uniform vec2 u_resolution;       // [1/SIZE, 1/SIZE]
uniform float u_subtransformSize;
uniform float u_normalization;
uniform bool u_horizontal;
uniform bool u_forward;

varying vec2 vUv;

void main () {
    // The main function call is provided by the imported library
    gl_FragColor = fft(
        u_inputTexture, 
        u_resolution, 
        u_subtransformSize, 
        u_horizontal, 
        u_forward, 
        u_normalization
    );
}
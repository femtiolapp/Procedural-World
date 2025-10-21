//Hämtad från https://github.com/rreusser/glsl-fft
precision highp float;

#pragma glslify: fft = require(glsl-fft/index.glsl);

attribute vec2 xy;

      void main () {
        gl_Position = vec4(xy, 0, 1);
      
}   
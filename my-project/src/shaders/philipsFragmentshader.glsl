uniform sampler2D h0Spectrum; // xy = h0(k), zw = h0(-k)
precision highp float;
uniform float uTime;
uniform float uGravity;
uniform float uSize;
uniform float L_Domain;
varying vec2 vUv; //k texture cordinate

vec2 multiplyComplex(vec2 a, vec2 b) {
    return vec2((a.x * b.x) - (a.y * b.y), (a.x * b.y) + (a.y * b.x));
}

float calcFreq(vec2 k) {
    float kLen = length(k);

    return sqrt(uGravity * kLen);
}
//Scale the kvector to the range −π to +π
vec2 getKvector(vec2 vUv, float size) {
    float PI = 3.14159265359;
    vec2 index = floor(vUv * size);

    //Nyquist Alias
    vec2 k_idx = vec2((index.x < size / 2.0) ? index.x : index.x - size, (index.y < size / 2.0) ? index.y : index.y - size);
    vec2 k = k_idx * (2.0 * PI) / L_Domain;
    return k;

}
vec2 getMirroredK(vec2 vUv, float size) {
    vec2 index = floor(vUv * size);
    //Calculate i = (size - m) % size
    vec2 mirroredIndex = vec2(mod(size - index.x, size), mod(size - index.y, size));

    return (mirroredIndex + 0.5) / size;
}

void main() {
    vec4 data = texture2D(h0Spectrum, vUv);
    vec2 h0_k = data.xy;

    vec2 vUvMirrored = getMirroredK(vUv, uSize);
    vec4 data_conjugate = texture2D(h0Spectrum, vUvMirrored);
    vec2 h0_konjugat = vec2(data_conjugate.x, -data_conjugate.y); //konjugatet
    vec2 k_vector = getKvector(vUv, uSize);
    float freq_t = calcFreq(k_vector) * uTime;

    //exp(iw(k)t) and exp(-iw(k)t)
    vec2 phase1 = vec2(cos(freq_t), sin(freq_t));
    vec2 phase2 = vec2(cos(-freq_t), sin(-freq_t));

    //complex multiplication
    vec2 term1 = multiplyComplex(h0_k, phase1);
    vec2 term2 = multiplyComplex(h0_konjugat, phase2);

    vec2 complexSpectrum = term1 + term2;

    gl_FragColor = vec4(complexSpectrum.x, complexSpectrum.y, 0.0, 1.0);
   // gl_FragColor = texture2D(h0Spectrum, vUv);
}
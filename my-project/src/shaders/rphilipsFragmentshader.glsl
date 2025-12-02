
// uniform highp sampler2D h0Spectrum; // xy = h0(k), zw = h0(-k)
// precision highp float;
// uniform float uTime;
// uniform float uGravity;
// uniform float uSize;
// uniform float L_Domain;
// in vec2 vUv; //k texture cordinate

// layout(location = 0) out vec4 outHeight;
// layout(location = 1) out vec4 outSlopeX;
// layout(location = 2) out vec4 outSlopeZ;

// vec2 multiplyComplex(vec2 a, vec2 b) {
//     return vec2((a.x * b.x) - (a.y * b.y), (a.x * b.y) + (a.y * b.x));
// }

// float calcFreq(vec2 k) {
//     float kLen = length(k);

//     return sqrt(uGravity * kLen);
// }
// //Scale the kvector to the range −π to +π
// vec2 getKvector(vec2 uv, float size) {
//     float PI = 3.14159265359;
//     vec2 index = floor(vUv * size);

//     //Nyquist Alias
//     vec2 k_idx = vec2((index.x < size / 2.0) ? index.x : index.x - size, (index.y < size / 2.0) ? index.y : index.y - size);
//     vec2 k = k_idx * (2.0 * PI) / L_Domain;
//     return k;

// }
// vec2 getMirroredK(vec2 uv, float size) {
//     vec2 index = floor(uv * size);
//     vec2 mirroredIndex = vec2(
//         mod(size - index.x, size),
//         mod(size - index.y, size)
//     );
//     return (mirroredIndex + 0.5) / size;
// }

// void main() {
//     vec4 data = texture(h0Spectrum, vUv);
//     vec2 h0_k = data.xy;

//     vec2 vUvMirrored = getMirroredK(vUv, uSize);
//     vec4 data_conjugate = texture(h0Spectrum, vUvMirrored);
//     vec2 h0_konjugat = vec2(data_conjugate.x, -data_conjugate.y); //konjugatet
//     vec2 k_vector = getKvector(vUv, uSize);
//     float freq_t = calcFreq(k_vector) * uTime;

//     //exp(iw(k)t) and exp(-iw(k)t)
//     vec2 phase1 = vec2(cos(freq_t), sin(freq_t));
//     vec2 phase2 = vec2(cos(-freq_t), sin(-freq_t));

//     //complex multiplication
//     vec2 term1 = multiplyComplex(h0_k, phase1);
//     vec2 term2 = multiplyComplex(h0_konjugat, phase2);

//     vec2 complexSpectrum = term1 + term2;
//     vec2 hdx = multiplyComplex(vec2(0.0, k_vector.x), complexSpectrum);
//     vec2 hdz = multiplyComplex(vec2(0.0, k_vector.y), complexSpectrum);

//     outHeight = vec4(complexSpectrum, 0.0, 0.0);   // complex height frequency
//     outSlopeX = vec4(hdx, 0.0, 0.0); // complex slope-x frequency
//     outSlopeZ = vec4(hdz, 0.0, 0.0); // complex slope-z frequency
//    // gl_FragColor = texture2D(h0Spectrum, vUv);
// }

uniform highp sampler2D h0Spectrum; // xy = h0(k), zw = h0(-k)
precision highp float;
uniform float uTime;
uniform float uGravity;
uniform float uSize;
uniform float L_Domain;

in vec2 vUv;
//out vec4 outVal;
layout(location = 0) out vec4 outHeight;
layout(location = 1) out vec4 outSlopeX;
layout(location = 2) out vec4 outSlopeZ;

vec2 multiplyComplex(vec2 a, vec2 b) {
    return vec2((a.x * b.x) - (a.y * b.y), (a.x * b.y) + (a.y * b.x));
}

float calcFreq(vec2 k) {
    float kLen = length(k);

    return sqrt(uGravity * kLen);
}
//Scale the kvector to the range −π to +π
vec2 getKvector(vec2 vuv, float size) {
    float PI = 3.14159265359;
    vec2 index = floor(vuv * size);

    //Nyquist Alias
    vec2 k_idx = vec2((index.x < size / 2.0) ? index.x : index.x - size, (index.y < size / 2.0) ? index.y : index.y - size);
    vec2 k = k_idx * (2.0 * PI) / L_Domain;
    return k;

}
vec2 getMirroredK(vec2 vuv, float size) {
    vec2 index = floor(vuv * size);
    //Calculate i = (size - m) % size
    //vec2 mirroredIndex = vec2(mod(size - index.x, size), mod(size - index.y, size));
    vec2 mirroredIndex = mod( - index, size);
    return (mirroredIndex + 0.5) / size;
}

void main() {
    vec4 data = texture(h0Spectrum, vUv);
    vec2 h0_k = data.xy;

    vec2 vUvMirrored = getMirroredK(vUv, uSize);
    vec4 data_conjugate = texture(h0Spectrum, vUvMirrored);
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
    vec2 hdx = multiplyComplex(complexSpectrum, vec2(0.0, k_vector.x));
    vec2 hdz = multiplyComplex(complexSpectrum, vec2(0.0, k_vector.y));

    outHeight = vec4(complexSpectrum.x, complexSpectrum.y, 0.0, 0.0);
    outSlopeX = vec4(hdx, 0.0, 0.0); // complex slope-x frequency
    outSlopeZ = vec4(hdz, 0.0, 0.0); // complex slope-z frequency

}
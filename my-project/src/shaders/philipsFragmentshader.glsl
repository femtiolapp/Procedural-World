uniform sampler2D h0Spectrum; // xy = h0(k), zw = h0(-k)

uniform float uTime;
uniform float uGravity;
uniform float uSize;
uniform float uplaneSize;
varying vec2 vUv; //k texture cordinate

vec2 multiplyComplex(vec2 a, vec2 b){
    return vec2((a.x * b.x) - ( a.y * b.y),(a.x * b.y) + (a.y * b.x) );
}


float calcFreq(vec2 k){
    float kLen = length(k);

    return sqrt(uGravity * kLen);
}
//Scale the kvector to the range −π to +π
vec2 getKvector(vec2 vUv, float size){
    float PI = 3.14;
    vec2 index = floor(vUv * size);
    vec2 k_idx = index - (size / 2.0);
    vec2 k = k_idx * (2.0 * PI) / uplaneSize;
    return k;

}

void main(){
    vec4 data = texture2D(h0Spectrum, vUv);
    vec2 h0_k = data.xy;
    vec2 h0_konjugat = data.zw; //konjugatet
    vec2 k_vector = getKvector(vUv, uSize);
    float freq_t = calcFreq(vUv) * uTime;

    //exp(iw(k)t) and exp(-iw(k)t)
    vec2 phase1 = vec2(cos(freq_t), sin(freq_t));
    vec2 phase2 = vec2(cos(-freq_t), sin(-freq_t));

    //complex multiplication
    vec2 term1 = multiplyComplex(h0_k, phase1);
    vec2 term2 = multiplyComplex(h0_konjugat, phase2);

    vec2 complexSpectrum = term1 + term2;

    gl_FragColor = vec4(complexSpectrum.x ,complexSpectrum.y ,0.0, 0.0);
}
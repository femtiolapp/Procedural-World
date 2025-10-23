

  // Adds the text in the calsspicperling noise function

    // distortion with noise
struct Wave {
  float amplitude;
  float wavelength;
  float frequency;
  float phase;
  vec2 direction;
  float steepness;
  float k;

};

varying vec2 vUv;
varying float noise;
uniform float disScale;
uniform float frequency;
uniform float fbm_amplitude;
uniform float numberOfOctaves;
uniform float lightx;
uniform float lighty;
uniform float lightz;
uniform float time;
uniform int water_Model;
uniform float uMedianAmplitude;
uniform float uMedianWavelength;
uniform float uWinddirection;
uniform float uFBMfrequency;
uniform float uFBMAmplitude;
uniform float uFBMPersistence;
uniform float uWavesLacunarity;
varying float noise_Displacement;
uniform  sampler2D  waterTexture;

varying float vAmount;
varying vec3 vNormal;
varying vec4 vPosition;
varying mat3 vNormalMatrix;

float PI = 3.14159265359;

float rand(float n) {
  return fract(sin(n) * 43758.5453123);
}
float randRange(float x, float minVal, float maxVal) {
  return mix(minVal, maxVal, rand(x));
}
mat4 rotationX(in float angle) {
  return mat4(1.0, 0, 0, 0, 0, cos(radians(angle)), -sin(radians(angle)), 0, 0, sin(radians(angle)), cos(radians(angle)), 0, 0, 0, 0, 1);
}
float fbm(in vec2 st) {
            // Initial values
  float value = 0.0;
           // float amplitude = 1.0;
  float A = fbm_amplitude;

            //
            // Loop of octaves

  for(float i = 0.0; i < numberOfOctaves; i++) {
    value += A * cnoise(vec3(frequency * st, 1.0 * frequency));
    st *= 2.27;
    A *= 0.57;
  }
  return value;
}

vec2 getDirection(in float angleDeg, in vec3 position) {
  int circle_wave = 0;
  vec2 circle = vec2(position.x, position.y);
  vec2 result = vec2(0.0);
  if(circle_wave == 1) {
           // vec2 dir = vec2(cos(radians(direction.x)),sin(radians(direction.y)));
           // result = (dir - circle) / length(dir - circle);

            //return result;
  }
  float theta = angleDeg;
  return vec2(cos(theta), sin(theta));
            //return vec2(cos(radians(direction.x)),sin(radians(direction.y)));
}

vec3 calcSineWave(in Wave waves[4], in float time, in vec3 position) {
          // Sum of sine


  vec2 d = vec2(0.0);
  float xy = 0.0;
  vec3 result = vec3(0.0);

  for(int i = 0; i < 4; i++) {
    

    d = normalize(waves[i].direction);
    xy = dot(d, position.xy);
    float wave = sin(xy * waves[i].frequency + time * waves[i].phase);
    float deriv = cos(xy * waves[i].frequency + time * waves[i].phase);
    result.z += wave * waves[i].amplitude;
    result.x += deriv * waves[i].frequency * waves[i].amplitude * d.x;
    result.y += deriv * waves[i].frequency * waves[i].amplitude * d.y;

  }

  return result;
}

vec3 calcNonNegSineWave(in Wave waves[4], in float time, in vec3 position) {

  vec2 d = vec2(0.0);
  float xy = 0.0;
  vec3 result = vec3(0.0);

  for(int i = 0; i < 4; i++) {


    d = normalize(waves[i].direction);
    xy = dot(d, position.xy);  // equivalent to: d.x * pos.x + d.y * pos.y
    float theta = xy * waves[i].frequency + time * waves[i].phase;

    float s = (sin(theta) + 1.0) / 2.0;
    float c = cos(theta);
    float pow_k = pow(s, waves[i].k);
    float pow_k1 = pow(s, waves[i].k - 1.0);

    result.z += pow_k * waves[i].amplitude * 2.0;
    result.x += c * waves[i].frequency * waves[i].amplitude * d.x * waves[i].k * pow_k1;
    result.y += c * waves[i].frequency * waves[i].amplitude * d.y * waves[i].k * pow_k1;
  }

  return result;

}
vec3 calcGerstnerWave(in Wave waves[4], in float time, in vec3 position, out vec3 Normal) {
        // Q = 0 normal sine, Q = 1/(W * A ) sharp crest

 
  vec2 d = vec2(0.0);
  float xy = 0.0;
  vec3 displacedPos = vec3(0.0);

  vec3 biTangent = vec3(0.0);
  vec3 Tangent = vec3(0.0);
  float random_value = 0.0;
  vec3 grad = vec3(0.0); //Normal
  for(int i = 0; i < 4; i++) {
    float A = waves[i].amplitude;
    float steepness = waves[i].steepness;

            //vec2 d = normalize(vec2(sin(random_value),cos(random_value)));
    d = normalize(waves[i].direction);
    xy = dot(d, position.xy);
    float theta = waves[i].frequency * xy + time * waves[i].phase;

    // Displacment
    float cosTheta = cos(theta);
    float sinTheta = sin(theta);

    displacedPos.x += steepness * A * d.x * cosTheta;
    displacedPos.y += steepness * A * d.y * cosTheta;
    displacedPos.z += A * sinTheta;
    // Accumulate normal gradient
    grad.x += -d.x * waves[i].frequency * A * cosTheta;
    grad.y += -d.y * waves[i].frequency * A * cosTheta;
    grad.z += steepness * waves[i].frequency * A * sinTheta;

  }
  Normal = normalize(vec3(grad.x, grad.y, 1.0));
  return position + displacedPos;
}

       // source http://lolengine.net/blog/2013/09/21/picking-orthogonal-vector-combing-coconuts
vec3 orthogonal(vec3 v) {
  return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, 0.0, v.x) : vec3(0.0, -v.z, v.y));
}
// vec3 fbm_Wave(in vec3 point, in float time, in float numberofOctaves) {
//   vec3 result = vec3(0.0);
//   float A = 1.0;
//   float frequency = 1.0;
//   float speed = 1.0;
//   float random_value = 0.0;
//   float weight = 0.0;

//   for(float i = 0.0; i < numberOfOctaves; i++) {
//     vec2 d = normalize(vec2(sin(random_value), cos(random_value)));
//     float dotVal = dot(d, point.xy) * frequency + time * speed;
//     float noise_val = fbm(point.xy * dot(d, point.xy) * frequency + time * speed);

//     float phi =  pow((sin(dotVal) + 1.0) * 0.5, 3.0) * A * 2.0;
//     float d_phi = frequency * cos(dotVal);

//     result.z += phi;
//     result.x += A * d_phi * d.x;
//     result.y += A * d_phi * d.y;

//     weight += A;
//     A *= 0.82;
//     frequency *= 1.18;
//     speed *= 0.0090;
//     random_value += 157.0;
//   }

//   return result/weight;

//}
vec3 fbm_Wave(in vec3 point, in float time, in float numberofOctaves) {
        // Initial values
  vec3 result = vec3(0.0);

  float A = 1.1;
  
  float frequency = 0.1;
  float speed = 0.5;
  vec3 position = point;
  float random_value = 0.0;
  float weight = 0.0;

  float test = 1.0;
  float x = 0.0;
  float phi = 0.0;
  float d_phi = 0.0;
  float drag = 0.5;

  for(float i = 0.0; i < numberofOctaves; i++) {
    float angle = rand(random_value) * 6.28318530718; // random angle in [0, 2PI)
    vec2 d = vec2(cos(angle), sin(angle));
    float theta = dot(d, position.xy) * frequency + time * speed;
    phi = A * sin(theta);
    d_phi = frequency * cos(theta);
    result.z += phi;
    result.x += A * d_phi * d.x;
    result.y += A * d_phi * d.y;

    position.xy += vec2((-result.x), (-result.y)) * 0.5;
    speed *= 0.090;
    weight += A;
    A *= 0.82;
    frequency *= 1.18;
    random_value += 157.0;
  }
  return result;
}

Wave createWave(float wavelength, float amplitude, float speed, float direction, float steepness, float k) {
  Wave w;
  float g = 9.82;
  w.frequency = 2.0 / wavelength;
  w.amplitude = amplitude;
  w.phase = speed * sqrt(g * 2.0 * PI / wavelength);
  w.direction = vec2(cos(direction), sin(direction));
  w.steepness = steepness;
  w.k = k;
  return w;
}

Wave createRandWaves(float medianWavelength, float medianAmplitude , float speed, float windDir, float steepness, float k, float seed) {
  Wave w;
  float wavelength = randRange(seed, medianWavelength / (2.0), medianWavelength * (2.0));
  float amplitude = (medianAmplitude / medianWavelength) * wavelength;
  float direction = randRange(seed, windDir - 50.0, windDir + 50.0);
  w = createWave(wavelength, amplitude, speed, direction, steepness, k);
  return w;
}

void main() {
  vUv = uv;
  vNormalMatrix = normalMatrix;

  vec3 pos = position;

  int nrWaves = 4;
  float speed[4] = float[4](1.0, 0.5, 1.2, 0.3); //speed?
  float wave_lenght[4] = float[4](20.0, 15.0, 22.1, 16.0);
  float amplitude[4] = float[4](2.0, 0.4, 0.8, 1.4);
          //vec2 direction[4] = vec2[4](vec2(90.0,30.0), vec2(70.0,30.0), vec2(160.0,70.0), vec2(90.0,30.0));
  float direction[4] = float[4](90.0, 70.0, 110.0, 120.0);

  float k[4] = float[4](1.2, 1.5, 1.0, 1.2);
  float steepness[4] = float[4](1.0, 0.8, 0.1, 1.0);
  Wave[4] waves;
  Wave[4] ranWaves;
    float baseSeed = 1337.0;
  for(int l = 0; l < nrWaves; l++) 
    {
      float seed = baseSeed + float(l) * 19.17;
      waves[l] = createWave(wave_lenght[l], amplitude[l], speed[l], direction[l], steepness[l], k[l]);
      ranWaves[l] = createRandWaves(  uMedianWavelength ,uMedianAmplitude,speed[l], uWinddirection, steepness[l], k[l], seed);
    };
  
  vec3 wave = vec3(0.0, 0.0, 0.0);
  vec3 newPos = vec3(0.0, 0.0, 0.0);
  vec3 biTangent = vec3(0.0, 0.0, 0.0);
  vec3 Tangent = vec3(0.0, 0.0, 0.0);
  vec3 new_Norm = vec3(0.0, 0.0, 0.0);
  float delta = 0.1;

  if(water_Model == 0) {

    wave = calcSineWave( ranWaves,time,pos);
            //biTangent = vec3(1.0, 0.0, wave.x);
            //Tangent = vec3(0.0 , 1.0, wave.y);
           // new_Norm = cross(biTangent, Tangent);
    vec3 grad = vec3(-wave.x, -wave.y, 1.0);
    new_Norm = normalize(grad);
    newPos = vec3(pos.x, pos.y, wave.z);
    vNormal = normalize(mat3(modelMatrix) * new_Norm);
    vPosition = modelMatrix * vec4(newPos, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  } else if(water_Model == 1) {

    wave = calcNonNegSineWave(ranWaves, time, pos);

    biTangent = vec3(1.0, 0.0, wave.x);
    Tangent = vec3(0.0, 1.0, wave.y);
    new_Norm = cross(biTangent, Tangent);
    newPos = vec3(pos.x, pos.y, pos.z + wave.z - 3.5);
    vNormal = normalize(mat3(modelMatrix) * new_Norm);
    vPosition = modelMatrix * vec4(newPos, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);

  }
  if(water_Model == 2) {
            //in float speed,in float wave_lenght , in float amplitude, in float time, in vec2 direction, in vec3 position, in int water_Model, in float k, in float Q, out vec3 Normal

    vec3 new_Norm = vec3(0.0, 0.0, 0.0);
    vec3 wave = calcGerstnerWave(ranWaves, time, pos, new_Norm);
    new_Norm = normalize(new_Norm);
    vNormal = normalize(mat3(modelMatrix) * new_Norm);
    vPosition = modelMatrix * vec4(wave, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(wave, 1.0);
  }
  if(water_Model == 3) {
    wave = fbm_Wave(pos, time, numberOfOctaves);

    float eps = 0.01;
    vec3 p = pos;
    vec3 dx = fbm_Wave(p + vec3(eps, 0.0, 0.0), time, numberOfOctaves) - fbm_Wave(p - vec3(eps, 0.0, 0.0), time, numberOfOctaves);
    vec3 dy = fbm_Wave(p + vec3(0.0, eps, 0.0), time, numberOfOctaves) - fbm_Wave(p - vec3(0.0, eps, 0.0), time, numberOfOctaves);

    vec3 tangent = normalize(vec3(2.0 * eps, 0.0, dx.z));
    vec3 bitangent = normalize(vec3(0.0, 2.0 * eps, dy.z));
    vec3 new_Norm = normalize(cross(tangent, bitangent));
    newPos = vec3(pos.x, pos.y, pos.z + wave.z);
    vNormal = normalize(mat3(modelMatrix) * new_Norm);
    vPosition = modelMatrix  * vec4(newPos, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  }
  if(water_Model == 4) {

    vNormal = normalize(mat3(modelMatrix) * normal);
    vPosition = modelMatrix  * vec4(position, 1.0);
    vec4 heightData = texture2D(waterTexture, uv);
    vec3 newpos = position + vec3(heightData.g,  heightData.r * 100000.0, heightData.b);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position , 1.0);
  }

}

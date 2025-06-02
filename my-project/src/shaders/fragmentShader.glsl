mat4 rotationX(in float angle) {
  return mat4(
    1.0, 0, 0, 0,
    0, cos(angle), -sin(angle), 0,
    0, sin(angle),  cos(angle), 0,
    0, 0, 0, 1
  );
}

vec3 calc_Spec(float shine, vec3 lightDir, vec3 cameraPos, vec3 pos, vec3 n) {
  vec3 lightColor = vec3(1.0, 1.0, 1.0); 
  vec3 viewDir    = normalize(cameraPos - pos);
  vec3 halfwayDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(n,halfwayDir), 0.0), shine);
  return lightColor * spec;
}

vec3 applyFog(in vec3 col, in float t, in vec3 rd, in vec3 lig) {
  float b = 0.0001; // fog density
  float fogAmount = 1.0 - exp(-t * b);
  float sunAmount = max(dot(rd, lig), 0.0);
  vec3 fogColor = mix(vec3(0.5, 0.6, 0.7), vec3(1.0, 0.9, 0.7), pow(sunAmount, 8.0));
  return mix(col, fogColor, fogAmount);
}

varying vec2 vUv;
varying float noise;
varying float noise_Displacement;
varying mat3 vNormalMatrix;

uniform float lightx;
uniform float lighty;
uniform float lightz;
uniform float time;
uniform vec3 water_Color;
uniform vec3 diffuse_water_Color;
uniform samplerCube cube_Texture;
varying vec4 vPosition;
varying vec3 vNormal;

void main() {
  float PI = 3.14159265359;

  mat4 rot_x = rotationX(90.0);
  float k_a = 0.2;
  float k_d = 0.3;
  float k_s = 0.4;
  vec3 lightColor = vec3(1.0, 1.0, 1.0); 
  vec3 n = normalize(vNormal); 

  vec3 pos = vPosition.xyz;

  vec4 lightPosition = viewMatrix * vec4(lightx, lighty, lightz, 1.0);
  vec3 lightDir = normalize(lightPosition.xyz - pos);
  vec4 vcameraPos = viewMatrix * vec4(cameraPosition, 1.0);
  vec3 cameraPos = vcameraPos.xyz;
  float NdotL = dot(lightDir, n);

  vec4 ref_pos = viewMatrix * vec4(pos, 1.0);
  vec3 reflectDir = normalize(ref_pos.xyz - cameraPos);
  vec3 test = textureCube(cube_Texture, reflectDir).rgb;

  vec3 water = (smoothstep(-1000.0, -0.5, noise_Displacement) - smoothstep(-0.16, -0.15, noise_Displacement)) * water_Color + calc_Spec(256.0, lightDir, cameraPos, pos, n) * k_s;
  vec3 sand = (smoothstep(-1.0, 1.4, noise_Displacement) - smoothstep(1.2, 1.25, noise_Displacement)) * vec3(0.76, 0.7, 0.5);
  vec3 grass = (smoothstep(-1.2, 8.0, noise_Displacement) - smoothstep(9.8, 10.3, noise_Displacement)) * vec3(0.0, 0.7, 0.1);
  vec3 rock = (smoothstep(8.10, 16.0, noise_Displacement) - smoothstep(15.80, 16.22, noise_Displacement)) * vec3(0.38, 0.33, 0.28);
  vec3 snow = (smoothstep(15.0, 16.0, noise_Displacement)) * vec3(1, 1, 1);

  vec3 groundColor = water_Color + calc_Spec(256.0, lightDir, cameraPos, pos, n) * k_s;

  vec3 diffuseLight = diffuse_water_Color * NdotL;
  vec3 finalColor = k_a * groundColor + k_d * diffuseLight;

  vec3 fogColor = applyFog(finalColor, length(pos - cameraPos), normalize(cameraPos - pos), lightDir);

  finalColor = pow(finalColor, vec3(1.0 / 2.2));
  finalColor = finalColor + test * 0.1;
  gl_FragColor = vec4(finalColor, 1.0);
}

vec3 calc_Spec(float shine, vec3 lightDir, vec3 n, vec3 viewDir) {
  vec3 lightColor = vec3(1.0, 1.0, 1.0);
  vec3 halfwayDir = normalize(lightDir + viewDir);
  float NdotL = max(dot(n, lightDir), 0.0);
  float spec = pow(max(dot(n, halfwayDir), 0.0), shine) * NdotL;
  return lightColor * spec;
}

vec3 applyFog(in vec3 col, in float t, in vec3 rd, in vec3 lig) {
  float b = 0.0001; // fog density
  float fogAmount = 1.0 - exp(-t * b);
  float sunAmount = max(dot(rd, lig), 0.0);
  vec3 fogColor = mix(vec3(0.5, 0.6, 0.7), vec3(1.0, 0.9, 0.7), pow(sunAmount, 8.0));
  return mix(col, fogColor, fogAmount);
}
precision highp float;
varying vec2 vUv;
varying float noise;
varying float noise_Displacement;
varying mat3 vNormalMatrix;

uniform float lightx;
uniform float lighty;
uniform float lightz;

uniform sampler2D waterTexture;
uniform float time;
uniform vec3 water_Color;
uniform vec3 diffuse_water_Color;
uniform samplerCube cube_Texture;
varying vec4 vPosition;
varying vec3 vNormal;

void main() {
  float PI = 3.14159265359;

float fresnelBias = 0.005;
float fresnelScale = 0.35;
float fresnelPower = 4.0;
float reflectionStrength = 0.50;

float k_a = 0.55;
float k_d = 0.65;
float k_s = 0.45;
  vec3 lightColor = vec3(0.99, 0.98, 0.96);
  vec3 n = normalize(vNormal); 

  //vec3 cameraPosition  = vcameraPosition .xyz;
  vec3 worldPos = vPosition.xyz;
  vec3 viewDir = normalize(cameraPosition - worldPos);

  vec4 lightPosition = vec4(lightx, lighty, lightz, 1.0);
  vec3 sunDir = normalize(lightPosition.xyz - worldPos);
 // vec3 sunDir = normalize(vec3(lightx, lighty, lightz));
  float NdotL = max(dot(sunDir, n),0.0);

  vec3 reflectDir = reflect(-viewDir, n);
  vec3 reflectedColor = textureCube(cube_Texture, reflectDir).rgb;
  vec3 ambient  = k_a * water_Color;
  vec3 diffuse  = k_d * diffuse_water_Color * NdotL;
  vec3 specular = k_s * calc_Spec(32.0, sunDir, n, viewDir);

  vec3 finalColor = ambient + diffuse + specular;

  //vec3 fogColor = applyFog(finalColor, length(worldPos - cameraPosition), normalize(cameraPosition - worldPos), sunDir);
  float fresnel = fresnelBias + fresnelScale * pow(1.0 - clamp(dot(viewDir, n), 0.0, 1.0), fresnelPower);
  fresnel = clamp(fresnel, 0.0, 1.0);
  finalColor = mix(finalColor, reflectedColor, fresnel * reflectionStrength);
  finalColor = pow(finalColor, vec3(1.0 / 2.2));

 // gl_FragColor = vec4(data.r, data.g,0.0,1.0);
  gl_FragColor = vec4(finalColor, 1.0); //vec4(normalize(vNormal) * 0.5 + 0.5, 1.0);
}

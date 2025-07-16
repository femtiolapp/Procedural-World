uniform samplerCube skybox;

varying vec4 worldPosition;
uniform vec3 sunDirection;
varying vec3 vWorldDirection;

void main() {
   // float3 viewDir = normalize(cameraPosition - coords);

    float sunAmount = max(dot(normalize(vWorldDirection), normalize(sunDirection)), 0.0);
    float sunGlow = pow(sunAmount, 1000.0); // higher = sharper disc
    vec3 sunColor = vec3(1.2, 1.0, 0.7); // warm sun
    vec3 cubeColor = textureCube(skybox, worldPosition.xyz).rgb;
   // vec3 skyColor = vec3(0.3, 0.5, 0.8); // blue-ish background
    vec3 finalColor =   mix(cubeColor,sunColor, sunGlow);

    gl_FragColor = vec4(finalColor, 1.0);
    

}
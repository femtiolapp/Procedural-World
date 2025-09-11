uniform samplerCube skybox;

varying vec4 worldPosition;
uniform vec3 sunDirection;
varying vec3 vWorldDirection;
uniform float fogBottom;
uniform float fogHeight;
//pixel col, , camtopoint, sundir

void main() {
    vec3 fogColor = vec3(0.5, 0.6, 0.7);

    vec3 direction = normalize(vWorldDirection);

    float sunAmount = max(dot(direction, normalize(sunDirection)), 0.0);
    float sunGlow = pow(sunAmount, 1000.0); // sharper sun
    vec3 sunColor = vec3(1.2, 1.0, 0.7);

    vec3 cubeColor = textureCube(skybox, direction).rgb;
    

    float height = worldPosition.y;
    float fogFactor = clamp((height - fogBottom) / fogHeight, 0.0, 1.0);
    

    vec3 finalColor = mix(fogColor, cubeColor, fogFactor);
    gl_FragColor = vec4(finalColor, 1.0);

}

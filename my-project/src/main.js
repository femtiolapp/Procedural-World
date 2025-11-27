// Import necessary libraries and resources
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import Stats from 'stats.js';
import { classic3DNoise, classicPerlinNoise } from './Noise/Stegu_Noise.glsl.js';
import waterVertexShader from './shaders/waterVertexShader.glsl?raw';
import waterFragmentShader from './shaders/waterFragmentShader.glsl?raw';
import skyBoxVertexShader from './shaders/skyBoxvertexShader.glsl?raw';
import skyBoxFragmentShader from './shaders/skyBoxfragmentShader.glsl?raw';
import philipsFragmentshader from './shaders/philipsFragmentshader.glsl?raw';
import philipsVertexhader from './shaders/philipsVertexshader.glsl?raw';
import rphilipsFragmentshader from './shaders/rphilipsFragmentshader.glsl?raw';
import rphilipsVertexhader from './shaders/rphilipsVertexshader.glsl?raw';
import fft_passfrag from './shaders/fft_passfrag.glsl?raw';
import fft_passvertex from './shaders/fft_passvertex.glsl?raw';
import FFT_Function from "glsl-fft/index.glsl?raw";
import fft from 'glsl-fft';
import { createSpectrum, computeFFT } from './helperfunctions.js';

// Declare global variables
let container, controls, renderer, scene, camera, mesh, groundMesh;
const FFT_SIZE = 256;
let stats, helper, bbox;
const start = Date.now();
const fov = 30;

// Initialize scene and camera
camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.set(10, 1000, 1000);
camera.lookAt(0, 0, 0);

scene = new THREE.Scene();





// Load skybox texture
const loader = new THREE.CubeTextureLoader();
loader.setPath('/Skybox/allsky/');
const cube_Texture = loader.load(['px.png', 'nx.png', 'py.png', 'ny.png', 'nz.png', 'pz.png']);

// Background scene setup
const bgScene = new THREE.Scene();


// Uniforms
const skyUniforms = {
  cubeTexture: { value: cube_Texture },
  sunDirection: { value: new THREE.Vector3(0.0, 0.0, -1.0) },
  fogBottom: { value: -10.0 },
  fogHeight: { value: 500.0 },
  cameraPosition: { value: camera.position }
};

const waterUniforms = {
  time: { value: 0.0 },
  disScale: { value: 100.0 },
  frequency: { value: 2.0 },
  fbm_amplitude: { value: 1.0 },
  numberOfOctaves: { value: 5.0 },
  lightx: { value: 0.0 },
  lighty: { value: 100.0 },
  lightz: { value: 0.0 },
  water_Color: { value: new THREE.Vector3(0.0, 0.0, 1.0) },
  water_Model: { value: 0 },
  cube_Texture: { value: cube_Texture },
  diffuse_water_Color: { value: new THREE.Vector3(0.0, 0.0, 1.0) },
  uMedianAmplitude: { value: 1.0 },
  uMedianWavelength: { value: 15.0 },
  uWinddirection: { value: 0.0 },
  waterHeightTexture: { value: 0.0 },
  waterslopeXTexture: { value: 0.0 },
  waterslopeZTexture: { value: 0.0 }
};

// Plane and GUI control settings
const planeControls = {
  width: FFT_SIZE,
  height: FFT_SIZE,
  displacement: 28.0,
  frequency: 2.0,
  fbm_amplitude: 1.0,
  numberOfOctaves: 5.0,
  lightx: 0.0,
  lighty: 113.0,
  lightz: -3000.0,
  water_Controler: 'FFT_wave',
  uMedianAmplitude: 1.0,
  uMedianWavelength: 15.0,
  uWinddirection: 1.0,
  fogHeight: 500.0,
  fogBottom: -10.0,
  L_Domain: 1000
};



//Calculate conjugate over time in a fragment shader.

// uniform sampler2D h0Spectrum; // xy = h0(k), zw = h0(-k)

// uniform float uTime;
// uniform float uGravity;
// uniform float uSize;
// uniform float uplaneSize;
//Create the philips spectrum
const philipsTexture = createSpectrum(1.0, 256, 310, planeControls.L_Domain);
//waterUniforms.waterTexture.value = philipsTexture;
console.log(philipsTexture);
const philipsUniforms = {
  uTime: { value: waterUniforms.time },
  uGravity: { value: 9.82 },
  uSize: { value: planeControls.width },
  h0Spectrum: { value: philipsTexture },
  L_Domain: { value: planeControls.L_Domain }
};

const philipsMaterial = new THREE.ShaderMaterial({

  uniforms: philipsUniforms,
  vertexShader: philipsVertexhader,
  fragmentShader: philipsFragmentshader,
});
const rawphilipsMaterial = new THREE.RawShaderMaterial({
  glslVersion: THREE.GLSL3,
  uniforms: philipsUniforms,
  vertexShader: rphilipsVertexhader,
  fragmentShader: rphilipsFragmentshader,
});

const rtOptions = {
  minFilter: THREE.NearestFilter,
  magFilter: THREE.NearestFilter,
  wrapS: THREE.RepeatWrapping,
  wrapT: THREE.RepeatWrapping,
  format: THREE.RGBAFormat,
  type: THREE.FloatType,
  internalFormat: 'RGBA32F',
};
// Identifiers for your three.js render targets
const INPUT_ID = 'philipsSpectrum';
const PING_ID = 'fft_ping';
const PONG_ID = 'fft_pong';
const OUTPUT_ID = 'height_dx';

const placeHolderplane = new THREE.PlaneGeometry(2, 2);
const philpsObj = new THREE.Mesh(placeHolderplane, rawphilipsMaterial);
//Test with seperate fftscene

const philipsCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const mrt = new THREE.WebGLRenderTarget(FFT_SIZE, FFT_SIZE, { ...rtOptions, count: 3 });
mrt.textures[0].name = "heightSpectrum";
mrt.textures[1].name = "slopeXSpectrum";
mrt.textures[2].name = "slopeZSpectrum";
console.log(mrt);
const renderTargets = {
  [INPUT_ID]: new THREE.WebGLRenderTarget(FFT_SIZE, FFT_SIZE, rtOptions),
  [PING_ID]: new THREE.WebGLRenderTarget(FFT_SIZE, FFT_SIZE, rtOptions),
  [PONG_ID]: new THREE.WebGLRenderTarget(FFT_SIZE, FFT_SIZE, rtOptions),
  [OUTPUT_ID]: new THREE.WebGLRenderTarget(FFT_SIZE, FFT_SIZE, rtOptions),
};

//require(glsl-fft) funkar inte så ersätter den stringen med funktion från FFT_function
const fft_passfrag_code = fft_passfrag.replace('#pragma glslify: fft = require(glsl-fft);', FFT_Function);

philpsObj.visible = false;
const fftMaterial = new THREE.ShaderMaterial({
  uniforms: {
    u_inputTexture: { value: null },
    u_resolution: { value: new THREE.Vector2(1 / FFT_SIZE, 1 / FFT_SIZE) },
    u_subtransformSize: { value: 0 },
    u_horizontal: { value: false },
    u_forward: { value: false },
    u_normalization: { value: 0 }
  },
  vertexShader: fft_passvertex,
  fragmentShader: fft_passfrag_code,
});
const fftObject = new THREE.Mesh(placeHolderplane, fftMaterial);
fftObject.visible = false;
const fftScene = new THREE.Scene();
const philpsScene = new THREE.Scene();
philpsScene.background = null;
philpsScene.add(philpsObj);
fftScene.background = null;
fftScene.add(fftObject);
//const passes = fft({256.0, 256.0, philipRender, philipsCamera, false });

// 1. Generate the pass list
//const fft = require('glsl-fft');
const passes = new fft({
  width: FFT_SIZE,
  height: FFT_SIZE,
  input: INPUT_ID,
  ping: PING_ID,
  pong: PONG_ID,
  output: OUTPUT_ID,
  forward: false, //  false for inverse transform
  splitNormalization: true // Recommended for half-float textures
});


// Background material setup
const bgMaterial = new THREE.ShaderMaterial({
  uniforms: skyUniforms,
  vertexShader: skyBoxVertexShader,
  fragmentShader: skyBoxFragmentShader,
  side: THREE.BackSide,
  depthWrite: false
});

const skyCube = new THREE.BoxGeometry(3000, 3000, 3000);
const bgMesh = new THREE.Mesh(skyCube, bgMaterial);
//bgScene.add(bgMesh);
//scene.add(bgMesh);
scene.background = cube_Texture;
scene.environment = cube_Texture;
const bgRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);

// Water material and mesh
const waterVertex = classic3DNoise + '\n' + classicPerlinNoise + '\n' + waterVertexShader;
const material = new THREE.ShaderMaterial({
  uniforms: waterUniforms,
  wireframe: false,
  vertexShader: waterVertex,
  fragmentShader: waterFragmentShader,
  lights: false
});

const ground = new THREE.PlaneGeometry(planeControls.width, planeControls.height, 256, 256);
groundMesh = new THREE.Mesh(ground, material);
groundMesh.rotation.x = -Math.PI / 2;
groundMesh.position.set(0, 0, 0);
groundMesh.updateMatrix();
scene.add(groundMesh);

// Helpers
const axesHelper = new THREE.AxesHelper(400);
axesHelper.position.set(700, 0, 700);
scene.add(axesHelper);

const plane_axesHelper = new THREE.AxesHelper(500);
plane_axesHelper.position.set(700, 0, 0);
plane_axesHelper.rotation.x = -Math.PI / 2;
scene.add(plane_axesHelper);

const light_Sphere = new THREE.Mesh(
  new THREE.SphereGeometry(10, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);
light_Sphere.position.set(0, 0, 0);
scene.add(light_Sphere);

bbox = new THREE.Box3().setFromObject(groundMesh);
helper = new THREE.Box3Helper(bbox, 0xffff00);
scene.add(helper);

// Renderer and DOM setup
renderer = new THREE.WebGLRenderer({ precision: 'highp' });

console.log(renderer.capabilities.precision)
const gl = renderer.getContext();


console.log('Vertex Shader Float Precision:', gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT));
console.log('Fragment Shader Float Precision:', gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT));
console.log('isWebGL2:', renderer.capabilities.isWebGL2);
console.log('Float textures:', renderer.extensions.has('OES_texture_float'));
console.log('Color buffer float:', renderer.extensions.has('EXT_color_buffer_float'));
console.log('Half float color buffer:', renderer.extensions.has('EXT_color_buffer_half_float'));

//console.log(caps.getMaxPrecision());
//console.log(caps.isWebGL2);
//console.log(caps.floatFragmentTextures); 
const half_float_support = renderer.extensions.get('OES_texture_half_float');
console.log("Half-Float Support:", half_float_support);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

// Stats
stats = new Stats();
stats.showPanel(0);
document.getElementById('container').appendChild(stats.domElement);

// Controls
controls = new OrbitControls(camera, renderer.domElement);

// GUI Setup
const gui = new dat.GUI();
const planeFolder = gui.addFolder('Plane');
planeFolder.add(planeControls, 'frequency', 0, 10).name('Frequency').listen();
planeFolder.add(planeControls, 'fbm_amplitude', 0, 10).name('Amplitude').listen();
planeFolder.add(planeControls, 'numberOfOctaves', 0, 32).name('Octaves').listen();
planeFolder.add(planeControls, 'displacement', 0, 150).name('Displacement').listen();
planeFolder.add(groundMesh.material, 'wireframe').name('Wireframe').listen();

const lightFolder = gui.addFolder('Light Position');
lightFolder.add(planeControls, 'lightx', -10000, 10000);
lightFolder.add(planeControls, 'lighty', -10000, 10000);
lightFolder.add(planeControls, 'lightz', -10000, 10000);
lightFolder.open();

const waterFolder = gui.addFolder('Water');
const params = {
  color: [0.0, 0.0, 255.0],
  diffuse_color: [0.0, 0.0, 255.0]
};

function setWaterColors(color, waterType) {
  const vec = new THREE.Vector3(color[0] / 255, color[1] / 255, color[2] / 255);
  if (waterType === 'waterColor') waterUniforms.water_Color.value.copy(vec);
  else if (waterType === 'waterDiffuseColor') waterUniforms.diffuse_water_Color.value.copy(vec);
}

waterFolder.addColor(params, 'color').onChange(() => setWaterColors(params.color, 'waterColor'));
waterFolder.addColor(params, 'diffuse_color').onChange(() => setWaterColors(params.diffuse_color, 'waterDiffuseColor'));
waterFolder.add(planeControls, 'numberOfOctaves', 0, 32).name('Octaves').listen();
waterFolder.add(planeControls, 'uMedianAmplitude', 1, 10).name('Median Amp').listen();
waterFolder.add(planeControls, 'uMedianWavelength', 1, 50).name('MedianWavel').listen();
waterFolder.add(planeControls, 'uWinddirection', 0, 360).name('Wind Direction').listen();
waterFolder.add(planeControls, 'water_Controler', ['Sum of sines', 'None negative sum of sine', 'Gestner_wave', 'FBM_wave', 'FFT_wave']).listen();
waterFolder.add(planeControls, 'fogHeight', 250, 1000).name('Fog Height').listen();
waterFolder.add(planeControls, 'fogBottom', -20, 100).name('Fog Bottom').listen();
waterFolder.open();



function updateWater() {
  switch (planeControls.water_Controler) {
    case 'Sum of sines': return 0;
    case 'None negative sum of sine': return 1;
    case 'Gestner_wave': return 2;
    case 'FBM_wave': return 3;
    case 'FFT_wave': return 4;
    default: return 0;
  }
}
function cloneTexture(renderer, sourceTexture) {
  const size = sourceTexture.image.width;
  const newTarget = new THREE.WebGLRenderTarget(size, size, rtOptions); // Use your existing rtOptions

  // Create a temporary material to draw the source texture onto the new target
  const blitMaterial = new THREE.MeshBasicMaterial({ map: sourceTexture });
  const blitMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), blitMaterial);

  // Render the source texture onto the new target
  renderer.setRenderTarget(newTarget);
  renderer.render(blitMesh, philipsCamera); // Use your orthographic camera

  // Clean up
  renderer.setRenderTarget(null);
  blitMaterial.dispose();
  blitMesh.geometry.dispose();

  return newTarget.texture; // Return the clean, isolated texture
}
// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  stats.begin();
  const t = 0.001 * (Date.now() - start);
  waterUniforms.time.value = t;
  philipsUniforms.uTime.value = t;
  waterUniforms.disScale.value = planeControls.displacement;
  waterUniforms.frequency.value = planeControls.frequency;
  waterUniforms.numberOfOctaves.value = planeControls.numberOfOctaves;
  waterUniforms.uMedianAmplitude.value = planeControls.uMedianAmplitude;
  waterUniforms.uMedianWavelength.value = planeControls.uMedianWavelength;
  waterUniforms.uWinddirection.value = planeControls.uWinddirection;
  waterUniforms.lightx.value = planeControls.lightx;
  waterUniforms.lighty.value = planeControls.lighty;
  waterUniforms.lightz.value = planeControls.lightz;

  skyUniforms.fogBottom.value = planeControls.fogBottom;
  skyUniforms.fogHeight.value = planeControls.fogHeight;
  skyUniforms.cameraPosition.value.copy(camera.position);


  light_Sphere.position.set(planeControls.lightx, planeControls.lighty, planeControls.lightz);
  if(planeControls.water_Controler == "FFT_wave"){
    
 

  philpsObj.visible = true;

  //renderer.setRenderTarget(mrt);
  renderer.setRenderTarget(mrt);
  renderer.clear(true, true, true);
  renderer.render(philpsScene, philipsCamera);


  // waterUniforms.waterTexture.value = renderTargets.philipsSpectrum.texture;//mrt.textures[0];

  philpsObj.visible = false;
  fftObject.visible = true;
  //fftMaterial.uniforms.u_inputTexture.value = renderTargets.philipsSpectrum.textures[0];
  const heightRT = new THREE.WebGLRenderTarget(FFT_SIZE, FFT_SIZE, rtOptions);
  const slopeXRT = new THREE.WebGLRenderTarget(FFT_SIZE, FFT_SIZE, rtOptions);
  const slopeZRT = new THREE.WebGLRenderTarget(FFT_SIZE, FFT_SIZE, rtOptions);
  // waterUniforms.waterTexture = renderTargets.philipsSpectrum.texture;
  const heightTexture = computeFFT(
    renderer,
    passes,
    renderTargets,
    fftMaterial,
    fftScene,
    philipsCamera,
    mrt.textures[0],
    heightRT,
  );

  fftMaterial.uniforms.u_inputTexture.value = mrt.textures[1];
  // const slopeXTexture = computeFFT(
  //   renderer,
  //   passes,
  //   {...renderTargets, output: slopeXRT},
  //   fftMaterial,
  //   fftScene,
  //   philipsCamera,
  //   mrt.textures[1],
    
  // );
  // const slopeZTexture= computeFFT(
  //   renderer,
  //   passes,
  //   {...renderTargets, output: slopeZRT},
  //   fftMaterial,
  //   fftScene,
  //   philipsCamera,
  //   mrt.textures[2],
    


  //  );
  // //console.log(renderTargets.height_dx.texture);
  //placeholderObject.visible = false;
  //waterUniforms.waterTexture.value = renderTargets.height_dx.texture;
  //renderer.render(bgScene, bgCamera);
  //const safeFftTexture = cloneTexture(renderer, fftOutputTexture);
  renderer.setRenderTarget(null);
  philpsObj.visible = false;
  waterUniforms.waterHeightTexture.value = heightTexture;
  waterUniforms.waterslopeXTexture.value = heightTexture;
  waterUniforms.waterslopeZTexture.value = heightTexture;

 }



  waterUniforms.water_Model.value = updateWater();

  renderer.render(scene, camera);

  stats.end();
}

animate();


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

import { createSpectrum } from './waveSpectrum.js';

// Declare global variables
let container, controls, renderer, scene, camera, mesh, groundMesh;
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
const bgCamera = new THREE.Camera();
bgCamera.position.z = 1;

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
  uWinddirection: { value: 0.0 }
};

// Plane and GUI control settings
const planeControls = {
  width: 100,
  height: 200,
  displacement: 28.0,
  frequency: 2.0,
  fbm_amplitude: 1.0,
  numberOfOctaves: 5.0,
  lightx: 0.0,
  lighty: 113.0,
  lightz: -3000.0,
  water_Controler: 'Sum of sines',
  uMedianAmplitude: 1.0,
  uMedianWavelength: 15.0,
  uWinddirection: 1.0,
  fogHeight: 500.0,
  fogBottom: -10.0
};

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

const ground = new THREE.PlaneGeometry(3000, 3000, 256, 256);
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
renderer = new THREE.WebGLRenderer();
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
waterFolder.add(planeControls, 'water_Controler', ['Sum of sines', 'None negative sum of sine', 'Gestner_wave', 'FBM_wave']).listen();
waterFolder.add(planeControls, 'fogHeight', 250, 1000).name('Fog Height').listen();
waterFolder.add(planeControls, 'fogBottom', -20, 100).name('Fog Bottom').listen();
waterFolder.open();


const [spectrum, gaussianRandom] = createSpectrum(1.0,256 , 31 );
console.log(gaussianRandom);
function updateWater() {
  switch (planeControls.water_Controler) {
    case 'Sum of sines': return 0;
    case 'None negative sum of sine': return 1;
    case 'Gestner_wave': return 2;
    case 'FBM_wave': return 3;
    default: return 0;
  }
}

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  stats.begin();

  waterUniforms.time.value = 0.005 * (Date.now() - start);
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

  waterUniforms.water_Model.value = updateWater();
  light_Sphere.position.set(planeControls.lightx, planeControls.lighty, planeControls.lightz);

  //renderer.setRenderTarget(bgRenderTarget);
  //renderer.render(bgScene, bgCamera);
  //renderer.setRenderTarget(null);


  renderer.render(scene, camera);

  stats.end();
}

animate();

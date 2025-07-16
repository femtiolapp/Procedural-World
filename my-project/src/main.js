
import * as THREE from 'three';
// OrbitControls from the Three.js examples (ESM path)
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// dat.GUI
import * as dat from 'dat.gui';

// Stats.js
import Stats from 'stats.js';

import {classic3DNoise, classicPerlinNoise} from './Noise/Stegu_Noise.glsl.js'
import waterVertexShader from './shaders/waterVertexShader.glsl?raw';
import waterFragmentShader from './shaders/waterFragmentShader.glsl?raw';
import skyBoxVertexShader from './shaders/skyBoxvertexShader.glsl?raw';
import skyBoxFragmentShader from './shaders/skyBoxfragmentShader.glsl?raw';

// Create the vertexshader with the noise functions in the begginning
const waterVertex = classic3DNoise + '\n' + classicPerlinNoise + '\n' + waterVertexShader;
const loader = new THREE.CubeTextureLoader();
loader.setPath('/Skybox/allsky/');
const cube_Texture = loader.load(['px.png', 'nx.png', 'py.png', 'ny.png', 'nz.png', 'pz.png']);
const skyCube = new THREE.BoxGeometry(10000,10000,10000);
const skyBoxMaterial = new THREE.ShaderMaterial({
  uniforms: {
    cubeTexture: {value: cube_Texture}, 
    sunDirection: {value: new THREE.Vector3(0.0, 0.0, -1.0)},
  },
  vertexShader: skyBoxVertexShader,
  fragmentShader: skyBoxFragmentShader,
  side: THREE.BackSide,
}); 
const skyBox = new THREE.Mesh(skyCube, skyBoxMaterial); 
function updateWater() {
  switch (planeControls.water_Controler) {
    case 'Sum of sines':
      //console.log('Sum of sines');
      return 0;
      break;
    case 'None negative sum of sine':
      //console.log('None negative sum of sine');
      return 1;
      break;
    case 'Gestner_wave':
      //console.log('Gestner_wave');
      return 2;
      break;
    case 'FBM_wave':
      //console.log('FBM_wave');
      return 3;
      break;
  }
}
var container,
  controls,
  renderer,
  scene,
  camera,
  mesh,
  groundMesh,

  start = Date.now(),
  fov = 30;

var planeValues = {
  widthSeg: 256,
  heightSeg: 256,
  horTexture: 10,
  verTexture: 10,
  displacement: 28,
  height: 1000,
  width: 1000,
}
//Gui control values
var planeControls = {
  width: 100,
  height: 200,
  displacement: 28.0,
  frequency: 2.0,
  fbm_amplitude: 1.0,
  numberOfOctaves: 5.0,
  lightx: 0.0,
  lighty: 113.0,
  lightz: -217.0,
  water_Controler: 'Sum of sines',
  uMedianAmplitude: 1.0,
  uMedianWavelength: 15.0,
  uWinddirection: 1.0,


}

var uniforms = {

  time: { // float initialized to 0
    type: "f",
    value: 0.0
  },
  disScale: { value: 100.0 },
  frequency: { value: 2.0 },
  fbm_amplitude: { value: 1.0 },
  numberOfOctaves: { value: 5.0 },
  time: { value: 0.0 },
  lightx: { value: 0.0 },
  lighty: { value: 100.0 },
  lightz: { value: 0.0 },
  water_Color: { value: new THREE.Vector3(0.0, 0.0, 1.0) },
  water_Model: { value: 0 },
  cube_Texture: { value: cube_Texture },
  diffuse_water_Color: { value: new THREE.Vector3(0.0, 0.0, 1.0) },
  uMedianAmplitude: {value: 1.0},
  uMedianWavelength: {value: 15.0},
  uWinddirection: {value: 0.0},



};


// grab the container from the DOM



// create a scene
scene = new THREE.Scene();

renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
const html_Container = document.getElementById('container');
//FPS counter
var stats = new Stats()
stats.showPanel(0);
html_Container.appendChild(stats.domElement)
html_Container.appendChild(renderer.domElement);
// create a camera the size of the browser window
// and place it 100 units away, looking towards the center of the scene
camera = new THREE.PerspectiveCamera(
  fov,
  window.innerWidth / window.innerHeight,
  1,
  10000
);
// Skybox texture loader

scene.add(skyBox);
controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(10, 1000, 1000);
//var test = cube_Texture(cube_Texture, new THREE.Vector3(0,0,0));
//camera.rotateX(-Math.PI/2)
camera.lookAt(0, 0, 0);

// create material and bump/hightmap texture

// const disMap = new THREE.TextureLoader().load('http://127.0.0.1:5500/Images/hmap.jpg');


uniforms['time'].value = (Date.now() - start);
// console.log(uniforms)
// const groundMaterial = new THREE.MeshStandardMaterial({
//   color: 0x000011,help
//   wireframe: true,
//   displacementMap: disMap,
//   displacementScale: 50,

// });
const material = new THREE.ShaderMaterial({
  uniforms: uniforms,
  wireframe: false,
  vertexShader: waterVertex,
  fragmentShader: waterFragmentShader,
  lights: false,

});


const ground = new THREE.PlaneGeometry(planeValues.height, planeValues.width, planeValues.heightSeg, planeValues.widthSeg);
const lightSphere = new THREE.SphereGeometry(10, 32, 32);
const lightMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const light_Sphere = new THREE.Mesh(lightSphere, lightMaterial);
light_Sphere.position.set(0, 0, 0);


groundMesh = new THREE.Mesh(ground, material);

const axesHelper = new THREE.AxesHelper(400);
axesHelper.position.set(700, 0, 700)
const plane_axesHelper = new THREE.AxesHelper(500);
plane_axesHelper.position.set(700, 0, 0);
plane_axesHelper.rotation.x = -Math.PI / 2;


scene.add(plane_axesHelper)
scene.add(axesHelper)
scene.add( groundMesh );
groundMesh.position.set(0, 0, 0);
groundMesh.rotation.x = -Math.PI / 2;
groundMesh.updateMatrix();
// groundMesh.position.y = -0.5;

light_Sphere.rotation.x = -Math.PI / 2;
//scene.rotation.x = -Math.PI / 2;
//Bounding box of the plane
var bbox = new THREE.Box3().setFromObject(groundMesh);
var helper = new THREE.Box3Helper(bbox, 0xffff00);
scene.add(helper);

//scene.add(groundMesh)
scene.add(light_Sphere);

//scene.add(normal_Helper)


// create the renderer and attach it to the DOM

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);


const cameraVizu = new THREE.CameraHelper(camera);
scene.add(cameraVizu);


//Create new gui
const gui = new dat.GUI();
const planeFolder = gui.addFolder('Plane');
const geometry = new THREE.BoxGeometry()
const cubeMat = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true,
})

const cube = new THREE.Mesh(geometry, cubeMat)


//Adding sliders
planeFolder.add(cube.rotation, 'x', 0, Math.PI * 2)
planeFolder.add(planeControls, 'frequency', 0, 10).name('Frequency').listen();
planeFolder.add(planeControls, 'fbm_amplitude', 0, 10).name('Amplitude').listen();
planeFolder.add(planeControls, 'numberOfOctaves', 0, 32).name('Octaves').listen();
planeFolder.add(planeControls, 'displacement', 0, 150).name('Displacement').listen();

// planeFolder.add( groundMesh.material, 'displacementScale', 1, 100 ).name( 'Displacement' ).listen();
planeFolder.add(groundMesh.material, 'wireframe').name('Wireframe').listen();
//Light

const cubeFolder = gui.addFolder('Light_Position')
cubeFolder.add(planeControls, 'lightx', -1000, 1000)
cubeFolder.add(planeControls, 'lighty', -1000, 1000)
cubeFolder.add(planeControls, 'lightz', -1000, 1000)
cubeFolder.open()
//Water

const params =
{
  color: [0.0, 0.0, 255.0],
  diffuse_color: [0.0, 0.0, 255.0]
};

// This vector will store the RGB components
const rgbVector = new THREE.Vector3();

// Function to update the vector with the new color
function setWaterColors(color, waterType) {
  if (waterType === "waterColor") {
    uniforms.water_Color.value.set(color[0] / 255, color[1] / 255, color[2] / 255);

  }
  else if (waterType === "waterDiffuseColor") {


    uniforms.diffuse_water_Color.value.set(color[0] / 255, color[1] / 255, color[2] / 255);

  }


}

const waterFolder = gui.addFolder('Water')
// Add a color controller to the GUI and listen for changes
waterFolder.addColor(params, 'color').onChange(function () {
  // newValue is the new color value as a hex string, e.g., '#ffae23'
  setWaterColors(params.color, "waterColor");
});
waterFolder.addColor(params, 'diffuse_color').onChange(function () {
  // newValue is the new color value as a hex string, e.g., '#ffae23'
  setWaterColors(params.diffuse_color, "waterDiffuseColor");
});


waterFolder.add(planeControls, 'numberOfOctaves', 0, 32).name('Octaves').listen();
waterFolder.add(planeControls, 'uMedianAmplitude', 1, 10).name('medianAmp').listen();
waterFolder.add(planeControls, 'uMedianWavelength', 1, 50).name('medianWavelength').listen();
waterFolder.add(planeControls, 'uWinddirection', 0, 360).name('winddirection').listen();
waterFolder.add(planeControls, 'water_Controler', ['Sum of sines', 'None negative sum of sine', 'Gestner_wave', 'FBM_wave']).listen();
var conf = new THREE.Color('0xff0000 ');



waterFolder.open()




waterFolder.open()
//light intensity
// const intensity = 0.5;

// const directionalLight = new THREE.DirectionalLight( 0xffffff, intensity );
// scene.add( directionalLight );
// scene.add(groundGeometry);



function animate() {

  requestAnimationFrame(animate);

  //Gui updates
  //planeValues.widthSeg = planeControls.Width;
  //planeValues.heightSeg = planeControls.Height;
  uniforms.disScale.value = planeControls.displacement;
  uniforms.frequency.value = planeControls.frequency;
  //uniforms.fbm_amplitude.value = planeControls.fbm_amplitude;
  uniforms.numberOfOctaves.value = planeControls.numberOfOctaves;
  uniforms.uMedianAmplitude.value = planeControls.uMedianAmplitude;
  uniforms.uMedianWavelength.value = planeControls.uMedianWavelength;
  uniforms.uWinddirection.value = planeControls.uWinddirection;
  uniforms.lightx.value = planeControls.lightx;
  uniforms.lighty.value = planeControls.lighty;
  uniforms.lightz.value = planeControls.lightz;
  light_Sphere.position.set(planeControls.lightx, planeControls.lighty, planeControls.lightz);
  //console.log(uniforms.water_Model);
  uniforms.water_Model.value = updateWater();
  
  stats.update();




  render();


}
function render() {
  material.uniforms['time'].value = .005 * (Date.now() - start);
  stats.begin();
  renderer.render(scene, camera);
  stats.end();

}
animate();

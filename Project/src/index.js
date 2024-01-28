function vertexShader() {
  return `

  // Adds the text in the calsspicperling noise function
    ${classic3DNoise()}
    ${classicPerlinNoise()}

    // distortion with noise
    varying vec2 vUv;
    varying float noise;
    uniform float disScale;
    uniform float frequency;
    uniform float amplitude;
    uniform float numberOfOctaves;
    varying float displacement;
    
    uniform sampler2D disTexture;
    varying float vAmount;
    uniform float time;
    // Function that calculates turbulence
    // float fbm( vec3 p ) 
    // {
    //   float numberOfOctaves = 5.0;
    //   float value = 0.0;
    //   float amplitude = 0.5;
    //   float frequency = 1.0;
    
    //   for (float f = 0.0 ; f < numberOfOctaves ; f++ ){
    //     float power = pow( 2.0, f );
    //     value += amplitude *  cnoise( vec3( frequency * p ) ) ;
    //     frequency *= 2.0;
    //     amplitude *= 0.5;
    //   }
    
    //   return value;
    
    // }
    
        float fbm (in vec2 st) {
            // Initial values
            float value = 0.0;
           // float amplitude = 1.0;
            float A = amplitude;

            //
            // Loop of octaves
        
            for (float i = 0.0; i < numberOfOctaves; i++) {
                value += A * cnoise( vec3( frequency * st,1.0*frequency ) );
                st *= 2.592;
                A *= 0.6;
            }
            return value;
        }
    
      void main() {
        vec4 bumpData = texture2D( disTexture, uv );
        float nice = fbm( uv );
        vAmount = bumpData.r;
        float test = 100.0;

        // get a 3d noise using the position, low frequency
        float b =  noise;
        // get a turbulent 3d noise using the normal
        displacement = nice * disScale;
        // move the position along the normal and transform it
        float newX = position.x;
        float newY = position.y;
        float newZ = position.z;

        vec3 newPosition = position + normal * nice *  disScale;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );  
        



      }`;
}
function fragmentShader() {
  return `
    
    varying vec2 vUv;
    varying float noise;
    varying float displacement;
    uniform float time;
    
    void main() {
      
      
                //           Color gradient main                Color gradient edge
      //                       minHT   Maxht mapcolor                minHT   Maxht mapcolor        
      
      vec3 water = (smoothstep( -1000.0, -0.5, displacement ) - smoothstep( -0.16, -0.15, displacement ))  * vec3( 0.0, 0.0, 1.0 );
      vec3 sand = (smoothstep( -1.0, 1.4, displacement ) - smoothstep( 1.2, 1.25, displacement ))  * vec3( 0.76, 0.7, 0.5 );
      vec3 grass = (smoothstep( -1.2, 8.0, displacement ) - smoothstep( 09.8, 10.3, displacement ))  * vec3( 0.0, 0.7, 0.1 );
      vec3 rock = (smoothstep( 8.10, 16.0, displacement ) - smoothstep( 15.80, 16.22, displacement ))  * vec3( 0.38, 0.33, 0.28 );
      vec3 snow = (smoothstep( 15.0, 16.0, displacement ))  * vec3( 1, 1, 1 );
      gl_FragColor = vec4( (water + sand + grass + rock  + snow)*0.8, 1.0);
      //if(displacement < -0.5){(smoothstep( -5.0, -0.5, displacement ) - smoothstep( -0.49, -0.50, displacement ))  * vec3( 0.0, 0.0, 1.0 )}
      // if (displacement > -0.5) gl_FragColor = vec4( 0.76,0.7,0.5, 1.0 ); //sand
      // if (displacement > 5.0) gl_FragColor = vec4( 0.0, 0.7, 0.1, 1.0 ); //grass
      // if (displacement > 10.0) gl_FragColor = vec4( 0.38, 0.33, 0.28, 1.0 ); //rock
      // if (displacement > 50.0) gl_FragColor = vec4( 1.0,1.0,1.0, 1.0 );
     
      
    
    }
  `;
}


var container,
  controls,
  renderer,
  scene,
  camera,
  mesh,
  
  start = Date.now(),
  fov = 30;
  
  var planeValues = {
    widthSeg: 128,
    heightSeg: 128,
    horTexture: 10,
    verTexture: 10,
    displacement: 28,
    height:1000,
    width: 1000,
  }
  //Gui control values
  var planeControls = {
    width: 1000,
    height: 1000,
    displacement: 28.0,
    frequency: 2.0,
    amplitude: 1.0,
    numberOfOctaves: 5.0,
  
  }
  
  // grab the container from the DOM
  container = document.getElementById( "container" );

  
  // create a scene
  scene = new THREE.Scene();
  
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  this.document.body.appendChild( renderer.domElement );
  // create a camera the size of the browser window
  // and place it 100 units away, looking towards the center of the scene
  camera = new THREE.PerspectiveCamera(
    fov,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
 
  controls = new THREE.OrbitControls( camera, renderer.domElement );
  camera.position.set( 0, 100, 200 );


 


  // create material and bump/hightmap texture
  
  const disMap = new THREE.TextureLoader().load('http://127.0.0.1:5500/Images/hmap.jpg');
  
  var uniforms = { 
    disTexture: { value: disMap },    
    time: { // float initialized to 0
      type: "f",
      value: 0.0},
    disScale : { value: 100.0 },
    frequency: { value: 2.0 },
    amplitude: { value: 1.0 },
    numberOfOctaves: { value: 5.0 },
    time: { value: 0.0 },

  };
  uniforms[ 'time' ].value =  ( Date.now() - start );
  // console.log(uniforms)
  // const groundMaterial = new THREE.MeshStandardMaterial({
  //   color: 0x000011,
  //   wireframe: true,
  //   displacementMap: disMap,
  //   displacementScale: 50,

  // });
  const material = new THREE.ShaderMaterial( {
    uniforms: uniforms,
    wireframe: false,
    vertexShader: vertexShader(),
    fragmentShader: fragmentShader(),

    } );   
            
                                
 const ground = new THREE.PlaneGeometry( planeValues.width, planeValues.height,planeValues.widthSeg,planeValues.heightSeg )


  groundMesh = new THREE.Mesh(ground, material);

  //scene.add( groundMesh );
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.y = -0.5;

  //Bounding box of the plane
  var bbox = new THREE.Box3().setFromObject(groundMesh);
  var helper = new THREE.Box3Helper( bbox, 0xffff00 );
  scene.add( helper );

scene.add(groundMesh)



  // create the renderer and attach it to the DOM
 
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setPixelRatio( window.devicePixelRatio );

  container.appendChild( renderer.domElement );
  const cameraVizu= new THREE.CameraHelper( camera );
  scene.add( cameraVizu ); 

  //Create new gui
  const gui = new dat.GUI();
  const planeFolder = gui.addFolder( 'Plane' );
  const geometry = new THREE.BoxGeometry()
  const cubeMat = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
})

const cube = new THREE.Mesh(geometry, cubeMat)


  //Adding sliders
  planeFolder.add(cube.rotation, 'x', 0, Math.PI * 2)
  planeFolder.add( planeControls, 'frequency', 0, 10 ).name( 'Frequency' ).listen();
  planeFolder.add( planeControls, 'amplitude', 0, 10 ).name( 'Amplitude' ).listen();
  planeFolder.add( planeControls, 'numberOfOctaves', 0, 10 ).name( 'Octaves' ).listen();
  planeFolder.add( planeControls, 'displacement', 0, 150 ).name( 'Displacement' ).listen();
 // planeFolder.add( groundMesh.material, 'displacementScale', 1, 100 ).name( 'Displacement' ).listen();
  planeFolder.add(groundMesh.material, 'wireframe').name('Wireframe').listen();
  //Light

  
  
  // const light = new THREE.PointLight(0xffffff, 2)
  // light.position.set(0, 20, 10)
  // scene.add(light)
  
  // const light2 = new THREE.PointLight(0xffffff, 2)
  // light2.position.set(-10, -10, -10)
  // scene.add(light2) 
//light intensity
  const intensity = 1;
// hemispheric light

// const skyColor = 0xB1E1FF;  // light blue
// const groundColor = 0xB97A20;  // brownish orange
// const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
//ambient light

const ambientLight = new THREE.AmbientLight(0x404040, intensity); // soft white light
//scene.add(ambientLight);

 // scene.add(groundGeometry);
  
 

function animate() {

  requestAnimationFrame( animate );

  //Gui updates
  //planeValues.widthSeg = planeControls.Width;
  //planeValues.heightSeg = planeControls.Height;
  uniforms.disScale.value = planeControls.displacement;
  uniforms.frequency.value = planeControls.frequency;
  uniforms.amplitude.value = planeControls.amplitude;
  uniforms.numberOfOctaves.value = planeControls.numberOfOctaves;

 // console.log(uniforms.time.value);
  
 
  render();


}
function render() {
  material.uniforms[ 'time' ].value = .00025 * ( Date.now() - start );
  renderer.render( scene, camera );
  

}
animate();

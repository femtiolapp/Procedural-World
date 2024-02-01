

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
    varying float noise_Displacement;
    
    uniform sampler2D disTexture;
    varying float vAmount;
    varying vec3 vNormal;
    uniform float time;

    
    

    
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
        float noise_val = fbm( uv );
        vAmount = bumpData.r;
        float test = 100.0;

        // get a 3d noise using the position, low frequency
       // float b =  noise;
        // get a turbulent 3d noise using the normal
        
        // move the position along the normal and transform it
        float sin_abs = sin(time*2.0);
        noise_Displacement = noise_val * disScale;
        if(smoothstep( -1000.0, -0.35, noise_Displacement ) - smoothstep( -0.16, -0.15, noise_Displacement )> noise_Displacement )
        {

          // Displacement along z
          float displacement = sin(position.x + time) ;
          vec3 displacedPosition = position;
          displacedPosition.z += displacement;
      
          // Derivative of displacement w.r.t x
          float dDisplacement_dx = cos(position.x + time);
          vec3 tangent = vec3(1.0, 0.0, dDisplacement_dx);
      
          // Recalculate the normal
          vec3 binormal = vec3(0.0, 1.0, 0.0);
          vNormal = normalize(cross(tangent, binormal));
      
          gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
        }
        else
        {
          // Displacement along z
          
          vec3 newPos = vec3(position.x, position.y, position.z + noise_Displacement);
          vNormal = vec3(normal.x, normal.y, normal.z + noise_Displacement );
          vNormal = normalize(vNormal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4( newPos, 1.0 );
        }
        
          //float z = sin(position.x + time);// + sin(position.x*0.3 + 2.0*time) + sin(position.x*0.8 + time*0.4) + sin(position.x*0.1 + time);
          //vNormal = vec3(normal.x, normal.y, normal.z + z);
         // vec3 binormal = vec3(1.0,0.0, position.x*cos(z + time));
          //vec3 tanget = vec3(0.0,1.0, position.y*cos(z + time));
        //  vNormal = cross(tanget, binormal);
          //vNormal = vec3(normal.x, normal.y, normal.z + abs(z));

          //vNormal = normalize(vNormal);
          //gl_Position = projectionMatrix * modelViewMatrix * vec4( position.x, position.y,position.z + z, 1.0 );

        //float z = sin(position.x   + time);
       // float z = 2.0*sin(position.x* 0.5 + time)


        



      }`;
}
function fragmentShader() {
  return `
    
    varying vec2 vUv;
    varying float noise;
    varying float noise_Displacement;
    uniform float time;
   

    uniform vec3 lightDirection;
    varying vec3 vNormal;
    vec3 lightColor = vec3( 1.0, 1.0, 1.0 );
    void main() {
      
      
                //           Color gradient main                Color gradient edge
      //                       minHT   Maxht mapcolor                minHT   Maxht mapcolor        
      
      vec3 water = (smoothstep( -1000.0, -0.5, noise_Displacement ) - smoothstep( -0.16, -0.15, noise_Displacement ))  * vec3( 0.0, 0.0, 1.0 );
      vec3 sand = (smoothstep( -1.0, 1.4, noise_Displacement ) - smoothstep( 1.2, 1.25, noise_Displacement ))  * vec3( 0.76, 0.7, 0.5 );
      vec3 grass = (smoothstep( -1.2, 8.0, noise_Displacement ) - smoothstep( 09.8, 10.3, noise_Displacement ))  * vec3( 0.0, 0.7, 0.1 );
      vec3 rock = (smoothstep( 8.10, 16.0, noise_Displacement ) - smoothstep( 15.80, 16.22, noise_Displacement ))  * vec3( 0.38, 0.33, 0.28 );
      vec3 snow = (smoothstep( 15.0, 16.0, noise_Displacement ))  * vec3( 1, 1, 1 );

     
      vec3 lightDirection = normalize( lightDirection );
      float nDotL =dot(lightDirection, vNormal);
      vec3 diffuseLight = lightColor * nDotL;
      gl_FragColor = vec4((water + sand + grass + rock  + snow) *diffuseLight, 1.0);
    // gl_FragColor = vec4(vec3(0.0, 0.0, 1.0) *diffuseLight , 1.0);
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
    widthSeg: 256,
    heightSeg: 256,
    horTexture: 10,
    verTexture: 10,
    displacement: 28,
    height:1000,
    width: 1000,
  }
  //Gui control values
  var planeControls = {
    width: 100,
    height: 200,
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
    lightDirection: { value: new THREE.Vector3( 1.0, 1.0, 1.0 ) },
    

  };
  var abc = new THREE.Vector3(1.0, 1.0, 1.0);
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
    lights: false,

    } );   
            
                                
 const ground = new THREE.PlaneGeometry( planeValues.height, planeValues.width, planeValues.heightSeg, planeValues.widthSeg);


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


//light intensity
  // const intensity = 0.5;

  // const directionalLight = new THREE.DirectionalLight( 0xffffff, intensity );
  // scene.add( directionalLight );
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
  material.uniforms[ 'time' ].value = .005 * ( Date.now() - start );
  renderer.render( scene, camera );
  

}
animate();



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
    uniform float lightx;
    uniform float lighty;
    uniform float lightz;
    uniform float time;
    
  
    varying float noise_Displacement;
    
    varying float vAmount;
    varying vec3 vNormal;
    varying vec4 vPosition;
    
    

    
        float fbm (in vec2 st) {
            // Initial values
            float value = 0.0;
           // float amplitude = 1.0;
            float A = amplitude;

            //
            // Loop of octaves

            for (float i = 0.0; i < numberOfOctaves; i++) {
                value += A * cnoise( vec3( frequency * st,1.0*frequency ) );
                st *= 2.27;
                A *= 0.57;
            }
            return value;
        }

        vec2 getDirection( in vec2 direction) {
            return vec2(cos(radians(direction.x)),sin(radians(direction.y)));
        }

    
        vec3 calcWave(in float wave_lenght , in float amplitude, in float time, in vec2 direction, in vec3 position) {
          vec3 result = vec3(0.0);
          vec2 d = getDirection(direction);
          float xz = d.x * position.x + d.y * position.z;
          float y = sin( xz * (wave_lenght/2.0) + time * 2.0 * wave_lenght)* amplitude;
          float dx = cos(xz * (wave_lenght/2.0) + time * 2.0 * wave_lenght)*  (wave_lenght/2.0) * amplitude * d.x;
          float dy = cos(xz * (wave_lenght/2.0) + time * 2.0 * wave_lenght) *  (wave_lenght/2.0) * amplitude * d.y;
          result = vec3(dx, dy, y);
          return result;
        }

       // source http://lolengine.net/blog/2013/09/21/picking-orthogonal-vector-combing-coconuts
      vec3 orthogonal(vec3 v) {
        return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, 0.0, v.x)
        : vec3(0.0, -v.z, v.y));
      }
     
      void main() {
        //vec4 bumpData = texture2D( disTexture, uv );
        float noise_val = fbm( uv );
        //vAmount = bumpData.r;
        float test = 100.0;

        // get a 3d noise using the position, low frequency
       // float b =  noise;
        // get a turbulent 3d noise using the normal
        
        // move the position along the normal and transform it
        
        noise_Displacement = noise_val * disScale;
        if(smoothstep( -1000.0, -0.5, noise_Displacement ) - smoothstep( -0.16, -0.15, noise_Displacement )> noise_Displacement )
        {

          // Displacement along y
          vec3 pos = position;
          
          //vec3 disp = calcDisplacement(pos, time);
          // wave length , amplitude, time, direction, position
          vec3 wave1 = calcWave(0.1, 1.0, time, vec2(150.0,30.0), pos);
         vec3 wave2 = calcWave(1.4, 0.2, time, vec2(70.0,30.0), pos);
         vec3 wave3 =  calcWave(1.0, 0.8, time, vec2(0.0,70.0), pos);
         vec3 wave4 = calcWave(0.5, 4.0, time, vec2(245.0,200.0), pos);

          vec3 new_norm = vec3(0.0, 0.0, 0.0 ) + vec3(wave1.x + wave2.x + wave3.x + wave4.x, 0.0 ,  wave1.y + wave2.y + wave3.y + wave4.y);;
            
          vNormal = normalize( normalMatrix* vec3(-new_norm.x, 1.0, -new_norm.y));
          
          
          float wave_Displacement = wave1.z + wave2.z + wave3.z + wave4.z;
          vec3 displacedPosition = position + normal * wave_Displacement;
          // displacedPosition.y += wave1.z;
          // displacedPosition.y += wave2.z;
          // displacedPosition.y += wave3.z;
          // displacedPosition.y += wave4.z;
      

      

      
          // // Calculate the light direction
       
        vPosition = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
        }
        else
        {
          // Displacement along y
          vec3 wave1 = calcWave(0.4, 1.0, 0.0, vec2(150.0,30.0), position);

         // vec3 newPos = vec3(position.x, position.y  , position.z+ noise_Displacement);
          vec3 newPos = position + normal * noise_Displacement;
          float epsilon = 0.0001;

          vec3 tangent = orthogonal(normal);
          vec3 bitangent = normalize(cross(normal, tangent));

          vec3 neighbor1 = position + tangent * epsilon;
          vec3 neighbor2 = position + bitangent * epsilon;

          vec3 displacedneighbor1 = neighbor1 + normal  * noise_Displacement;
          vec3 displacedneighbor2 = neighbor2 + normal  * noise_Displacement;

          vec3 displacedTangent = displacedneighbor1 - newPos;
          vec3 displacedBitangent = displacedneighbor2 - newPos;
          vec3 newNormal = normalize(cross(displacedTangent, displacedBitangent));

          vNormal = normalize(normalMatrix*newNormal);
          // The cross product of tangent and bitangent gives the perpendicular vector, which is the new normal.
      



          vPosition = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);

          gl_Position = projectionMatrix * modelViewMatrix * vec4( newPos, 1.0 );
        }
      

      }`;
}
function fragmentShader() {
  return `
    
    varying vec2 vUv;
    varying float noise;
    varying float noise_Displacement;


    uniform float lightx;
    uniform float lighty;
    uniform float lightz;
    uniform float time;
   

    varying vec4 vPosition;
    varying vec3 vNormal;

    
    void main() {
      
      
                //           Color gradient main                Color gradient edge
      //                       minHT   Maxht mapcolor                minHT   Maxht mapcolor        
      vec3 pos = vPosition.xyz;
      vec3 lightPosition = vec3(lightx, lighty, lightz);
      vec3 lightDirection = normalize( normalize(lightPosition) - normalize(pos));
      float NdotL = dot(lightDirection, vNormal);

      vec3 water = (smoothstep( -1000.0, -0.5, noise_Displacement ) - smoothstep( -0.16, -0.15, noise_Displacement ))  * vec3( 0.0, 0.0, 1.0 );
      vec3 sand = (smoothstep( -1.0, 1.4, noise_Displacement ) - smoothstep( 1.2, 1.25, noise_Displacement ))  * vec3( 0.76, 0.7, 0.5 );
      vec3 grass = (smoothstep( -1.2, 8.0, noise_Displacement ) - smoothstep( 09.8, 10.3, noise_Displacement ))  * vec3( 0.0, 0.7, 0.1 );
      vec3 rock = (smoothstep( 8.10, 16.0, noise_Displacement ) - smoothstep( 15.80, 16.22, noise_Displacement ))  * vec3( 0.38, 0.33, 0.28 );
      vec3 snow = (smoothstep( 15.0, 16.0, noise_Displacement ))  * vec3( 1, 1, 1 );

     vec3 lightColor = vec3(water + sand + grass + rock  + snow);
     vec3 diffuseLight = lightColor * NdotL;
     // gl_FragColor = vec4(normalize(vNormal),1.0);//vec4((water + sand + grass + rock  + snow) *diffuseLight, 1.0);
      vec3 finalColor = diffuseLight + lightColor *0.8;
     gl_FragColor = vec4(finalColor, 1.0);
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
    lightx: 0.0,
    lighty: 10.0,
    lightz: 0.0,
  
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
  camera.position.set( 1000, 1000, 0 );
  camera.lookAt( 0,0,0 );
  
 

  // create material and bump/hightmap texture
  
 // const disMap = new THREE.TextureLoader().load('http://127.0.0.1:5500/Images/hmap.jpg');
  
  var uniforms = { 
        
    time: { // float initialized to 0
      type: "f",
      value: 0.0},
    disScale : { value: 100.0 },
    frequency: { value: 2.0 },
    amplitude: { value: 1.0 },
    numberOfOctaves: { value: 5.0 },
    time: { value: 0.0 },
    lightx:{value: 0.0} ,
    lighty: {value: 100.0},
    lightz: {value: 0.0},
    

  };
  var abc = new THREE.Vector3(1.0, 1.0, 1.0);
  uniforms[ 'time' ].value =  ( Date.now() - start );
  // console.log(uniforms)
  // const groundMaterial = new THREE.MeshStandardMaterial({
  //   color: 0x000011,help
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
 const lightSphere = new THREE.SphereGeometry( 10, 32, 32 );
 const lightMaterial = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
 const light_Sphere = new THREE.Mesh( lightSphere, lightMaterial );
 light_Sphere.position.set( 0,0,0 );
  

  groundMesh = new THREE.Mesh(ground, material);


  //scene.add( groundMesh );
  groundMesh.position = new THREE.Vector3(0,0,0);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.y = -0.5;

  //Bounding box of the plane
  var bbox = new THREE.Box3().setFromObject(groundMesh);
  var helper = new THREE.Box3Helper( bbox, 0xffff00 );
  scene.add( helper );

scene.add(groundMesh)
scene.add( light_Sphere );
//scene.add(normal_Helper)


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

  const cubeFolder = gui.addFolder('Cube')
  cubeFolder.add(planeControls, 'lightx', 0, 1000)
  cubeFolder.add(planeControls, 'lighty', 0, 1000)
  cubeFolder.add(planeControls, 'lightz', 0, 1000)
  cubeFolder.open()
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
  uniforms.lightx.value = planeControls.lightx;
  uniforms.lighty.value = planeControls.lighty;
  uniforms.lightz.value = planeControls.lightz;
  light_Sphere.position.set(planeControls.lightx, planeControls.lighty, planeControls.lightz);
 // console.log(uniforms.time.value);

 
  render();


}
function render() {
  material.uniforms[ 'time' ].value = .005 * ( Date.now() - start );
  renderer.render( scene, camera );
  

}
animate();

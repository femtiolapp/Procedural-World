function vertexShader() {
  return `

  
    varying float vAmount;

    uniform sampler2D disTexture;
    uniform float disScale;

    
      void main() {
        vec4 bumpData = texture2D( disTexture, uv );
        vAmount = bumpData.r;
        

      
        // move the position along the normal and transform it
        vec3 newPosition = position + normal * vAmount * disScale;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );    
      }`;
}
function fragmentShader() {
  return `
    
    varying float vAmount;
    //varying float noise;
    //uniform float time;
    
    void main() { //           Color gradient main                Color gradient edge
      //                       minHT   Maxht mapcolor                minHT   Maxht mapcolor        
      if (vAmount > 0.1) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); } // water
      vec3 water = (smoothstep( -0.5, 0.25, vAmount ) - smoothstep( 0.19, 0.20, vAmount ))  * vec3( 0.0, 0.0, 1.0 );
      vec3 sand = (smoothstep( 0.18, 0.22, vAmount ) - smoothstep( 0.20, 0.30, vAmount ))  * vec3( 0.76, 0.7, 0.5 );
      vec3 grass = (smoothstep( 0.20, 0.46, vAmount ) - smoothstep( 0.23, 0.60, vAmount ))  * vec3( 0.0, 0.7, 0.1 );
      vec3 rock = (smoothstep( 0.43, 0.75, vAmount ) - smoothstep( 0.50, 0.85, vAmount ))  * vec3( 1, 1, 0.1 );
      vec3 snow = (smoothstep( 0.75, 0.8, vAmount ))  * vec3( 1, 1, 1 );
      gl_FragColor = vec4( rock + water + sand + grass + snow , 1.0 );
      
    
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
    widthSeg: 100,
    heightSeg: 100,
    horTexture: 10,
    verTexture: 10,
    displacement: 50,
  }
  //Gui control values
  var planeControls = {
    width: 100,
    height: 100,
    displacement: 100,
  
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
  camera.position.set( 0, 20, 100 );


 


  // create material and bump/hightmap texture
  
  const disMap = new THREE.TextureLoader().load('http://127.0.0.1:5500/Images/hmap.jpg');
  
  const uniforms = { 
    disTexture: { value: disMap },
    disScale : { value: planeValues.displacement },

  };
  
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
            
                                
 const ground = new THREE.PlaneGeometry( 1000, 1000,planeValues.widthSeg,planeValues.heightSeg )


  groundMesh = new THREE.Mesh(ground, material);

  //scene.add( groundMesh );
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.y = -0.5;



scene.add(groundMesh)



  // create the renderer and attach it to the DOM
 
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setPixelRatio( window.devicePixelRatio );

  container.appendChild( renderer.domElement );


  //Create new gui
  const gui = new dat.GUI();
  const planeFolder = gui.addFolder( 'Plane' );
  const geometry = new THREE.BoxGeometry()
const cubeMat = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
})

const cube = new THREE.Mesh(geometry, cubeMat)
scene.add(cube)

  //Adding sliders
  planeFolder.add(cube.rotation, 'x', 0, Math.PI * 2)
  planeFolder.add( planeControls, 'width', 1, 100 ).name( 'Width' ).listen();
  planeFolder.add( planeControls, 'height', 1, 100 ).name( 'Height' ).listen();
 // planeFolder.add( groundMesh.material, 'displacementScale', 1, 100 ).name( 'Displacement' ).listen();
  planeFolder.add(groundMesh.material, 'wireframe').name('Wireframe').listen();
  planeFolder.add(groundMesh.rotation, 'x', 0, Math.PI*2).name('Width Segments').listen();
  //Light

  
  
  // const light = new THREE.PointLight(0xffffff, 2)
  // light.position.set(0, 20, 10)
  // scene.add(light)
  
  // const light2 = new THREE.PointLight(0xffffff, 2)
  // light2.position.set(-10, -10, -10)
  // scene.add(light2) 
//light intensity
  const intensity = 50;
// hemispheric light

// const skyColor = 0xB1E1FF;  // light blue
// const groundColor = 0xB97A20;  // brownish orange
// const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
//ambient light

const ambientLight = new THREE.AmbientLight(0x404040, intensity); // soft white light
scene.add(ambientLight);

 // scene.add(groundGeometry);
  
 


function animate() {

  requestAnimationFrame( animate );

  //Gui updates
  //planeValues.widthSeg = planeControls.Width;
  //planeValues.heightSeg = planeControls.Height;
  groundMesh.geometry.heightSeg = planeControls.displacement;
  console.log(planeValues.displacement);
  
 
  render();


}
function render() {
  renderer.render( scene, camera );
  

}
animate();

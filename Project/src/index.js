

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
    uniform float fbm_amplitude;
    uniform float numberOfOctaves;
    uniform float lightx;
    uniform float lighty;
    uniform float lightz;
    uniform float time;
    uniform int water_Model;
   
    varying float noise_Displacement;
    
    varying float vAmount;
    varying vec3 vNormal;
    varying vec4 vPosition;
    varying mat3 vNormalMatrix;

    float PI = 3.14159265359;
    
    

        mat4 rotationX( in float angle ) {
          return mat4(	1.0,		0,			0,			0,
                  0, 	cos(radians(angle)),	-sin(radians(angle)),		0,
                  0, 	sin(radians(angle)),	 cos(radians(angle)),		0,
                  0, 			0,			  0, 		1);
        }
        float fbm (in vec2 st) {
            // Initial values
            float value = 0.0;
           // float amplitude = 1.0;
            float A = fbm_amplitude;

            //
            // Loop of octaves

            for (float i = 0.0; i < numberOfOctaves; i++) {
                value += A * cnoise( vec3( frequency * st,1.0*frequency ) );
                st *= 2.27;
                A *= 0.57;
            }
            return value;
        }

        vec2 getDirection( in vec2 direction, in vec3 position) {
          int circle_wave = 0;
          vec2 circle = vec2(position.x, position.y);
          vec2 result = vec2(0.0);
          if(circle_wave == 1)
          {
            vec2 dir = vec2(cos(radians(direction.x)),sin(radians(direction.y)));
            result = (dir - circle) / length(dir - circle);
            
            return result;
          }
            return vec2(cos(radians(direction.x)),sin(radians(direction.y)));
        }
        // vec3 wave1 = calcSineWave(2.0, 8.0, 1.0, time, vec2(90.0,30.0), pos);
        // vec3 wave2 = calcSineWave(5.0, 5.0, 0.4, time, vec2(70.0,30.0), pos);
        // vec3 wave3 = calcSineWave(4.0, 8.1, 0.8, time, vec2(160.0,70.0), pos);
        // vec3 wave4 = calcSineWave(3.0, 6.0, 1.4, time, vec2(90.0,30.0), pos);


        // float phase[4] = float[4](2.0, 5.0, 4.0, 3.0);
        // float wave_lenght[4] = float[4](8.0, 5.0, 8.1, 6.0);
        // float amplitude[4] = float[4](1.0, 10.4, 0.8, 1.4);
        // vec2 direction[4] = vec2[4](vec2(90.0,30.0), vec2(70.0,30.0), vec2(160.0,70.0), vec2(90.0,30.0));
        // float k[4] = float[4](2.5, 1.5, 2.0, 1.2);
        // float Q[4] = float[4](0.5, 0.8, 0.2, 0.4);
    
        vec3 calcSineWave(in float phase[4], in float wave_lenght[4] , in float amplitude[4], in float time, in vec2 direction[4], in vec3 position) {
          // Sum of sine
            
 
            float freq_i = 0.0;
            float speed_i = 0.0;
            vec2 d = vec2(0.0);
            float xy = 0.0; 
            vec3 result = vec3(0.0); 
            freq_i = 2.0/wave_lenght[3];    
               
              for(int i = 0; i < 4; i++)
              {
                freq_i = 2.0/wave_lenght[i];        
                
                speed_i = phase[i] * freq_i;
                
                d = normalize(getDirection(direction[i], position)); 
                xy = d.x * position.x + d.y * position.y;

                result.z += sin( xy * freq_i + time * speed_i  )* amplitude[i];
                result.x += cos(xy *freq_i + time * speed_i ) * freq_i * amplitude[i] * d.x;
                result.y += cos(xy *freq_i + time * speed_i ) * freq_i * amplitude[i] * d.y;
                
              }

            return result;
        }

  

        vec3 calcNonNegSineWave(in float phase[4], in float wave_lenght[4] , in float amplitude[4], in float time, in vec2 direction[4], in vec3 position, in float[4] k) {
          float freq_i = 0.0;
          float speed_i = 0.0;
          vec2 d = vec2(0.0);
          float xy = 0.0; 
          vec3 result = vec3(0.0); 
          freq_i = 2.0/wave_lenght[3];    
           
            for(int i = 0; i < 4; i++)
            {
              freq_i = 2.0/wave_lenght[i];        
           
              speed_i = phase[i] * freq_i;
              
              d = normalize(getDirection(direction[i], position)); 
              xy = d.x * position.x + d.y * position.y;

              result.z += pow((sin( xy * freq_i + time * speed_i ) + 1.0)/2.0,k[i]) * amplitude[i] * 2.0;
              result.x += cos(xy *freq_i + time * speed_i) * freq_i * amplitude[i] * d.x * k[i] * pow((sin( xy * freq_i + time * speed_i)+ 1.0)/2.0, k[i] - 1.0);
              
              result.y += cos(xy *freq_i + time * speed_i) * freq_i * amplitude[i] * d.y * k[i] * pow((sin( xy * freq_i + time * speed_i) + 1.0)/2.0, k[i] - 1.0);
                        
            }

          return result;

      }
      vec3 ccalcGerstnerWave(in float phase[4], in float wave_lenght[4] , in float amplitude[4], in float time, in vec2 direction[4], in vec3 position, in float[4] k, in float[4] Q) {
        // Q = 0 normal sine, Q = 1/(W * A ) sharp crest
          vec3 p = vec3(0.0);
          // float freq = 2.0/wave_lenght;
          // float speed = phase * freq; 
          // vec2 d = getDirection(direction, position);
          // float xy = d.x * position.x + d.y * position.y;
          // float x = (Q*amplitude * d.x * cos(freq * xy + time *speed));
          // float y = (Q*amplitude * d.y * cos(freq * xy + time *speed));
          // float z = sin( xy * freq + time * speed )* amplitude; 

          // p = vec3( x, y, z);
          // float d_p = d.x * p.x + d.y * p.y;
          // //Normal = vec3((d.x * freq * amplitude * cos(freq * xy * length(position) + time * speed)), ((d.y * freq * amplitude * cos(freq * xy * length(position) + time * speed))),(Q * freq * amplitude * sin(freq * xy * length(position) + time * speed)));
          // Normal = vec3((d.x * freq * amplitude * cos(freq * d_p + time * speed)), ((d.y * freq * amplitude * cos(freq * d_p + time * speed))),(Q * freq * amplitude * sin(freq * d_p + time * speed)));

          return p;
      }
      vec3 calcGerstnerWave(in float phase,in float wave_lenght , in float amplitude, in float time, in vec2 direction, in vec3 position, in float k, in float Q, out vec3 Normal) {
        // Q = 0 normal sine, Q = 1/(W * A ) sharp crest
          vec3 p = vec3(0.0);
          float freq = 2.0/wave_lenght;
          float speed = phase * freq; 
          vec2 d = getDirection(direction, position);
          float xy = d.x * position.x + d.y * position.y;
          float x = (Q*amplitude * d.x * cos(freq * xy + time *speed));
          float y = (Q*amplitude * d.y * cos(freq * xy + time *speed));
          float z = sin( xy * freq + time * speed )* amplitude; 

          p = vec3( x, y, z);
          float d_p = d.x * p.x + d.y * p.y;
          //Normal = vec3((d.x * freq * amplitude * cos(freq * xy * length(position) + time * speed)), ((d.y * freq * amplitude * cos(freq * xy * length(position) + time * speed))),(Q * freq * amplitude * sin(freq * xy * length(position) + time * speed)));
          Normal = vec3((d.x * freq * amplitude * cos(freq * d_p + time * speed)), ((d.y * freq * amplitude * cos(freq * d_p + time * speed))),(Q * freq * amplitude * sin(freq * d_p + time * speed)));

          return p;
      }

       // source http://lolengine.net/blog/2013/09/21/picking-orthogonal-vector-combing-coconuts
      vec3 orthogonal(vec3 v) {
        return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, 0.0, v.x)
        : vec3(0.0, -v.z, v.y));
      }
     
      void main() {
        vNormalMatrix = normalMatrix;
        //vec4 bumpData = texture2D( disTexture, uv );
        float noise_val = fbm( uv );
        //vAmount = bumpData.r;
        float test = 100.0;

        // get a 3d noise using the position, low frequency
       // float b =  noise;
        // get a turbulent 3d noise using the normal
        
        // move the position along the normal and transform it
        
        noise_Displacement = noise_val * disScale;


        mat4 rot_x = rotationX(-90.0);
        //vec3 new_norm = vec3(0.0, 0.0, 0.0);
       // float wave_Displacement = 0.0;
        // if(smoothstep( -1000.0, -0.5, noise_Displacement ) - smoothstep( -0.16, -0.15, noise_Displacement )> noise_Displacement )
        // {

          // Displacement along y
          vec3 pos = position;
          
          //vec3 disp = calcDisplacement(pos, time);
          // speed,wave length , amplitude, time, direction, position
          float phase[4] = float[4](2.0, 5.0, 4.0, 3.0);
          float wave_lenght[4] = float[4](8.0, 5.0, 8.1, 6.0);
          float amplitude[4] = float[4](1.0, 0.4, 0.8, 1.4);
          vec2 direction[4] = vec2[4](vec2(90.0,30.0), vec2(70.0,30.0), vec2(160.0,70.0), vec2(90.0,30.0));
 
          float k[4] = float[4](1.2, 1.5, 1.0, 1.2);
          float Q[4] = float[4](0.5, 0.8, 0.2, 0.4);
          vec3 wave = vec3(0.0, 0.0, 0.0);
          vec3 newPos = vec3(0.0, 0.0, 0.0);
          vec3 biTangent = vec3(0.0, 0.0, 0.0);
          vec3 Tangent = vec3(0.0, 0.0, 0.0);
          vec3 new_Norm = vec3(0.0, 0.0, 0.0);
          if(water_Model == 0)
          {
            
            wave = calcSineWave(phase, wave_lenght, amplitude, time, direction, pos);
            biTangent = vec3(1.0, 0.0, wave.x);
            Tangent = vec3(0.0 , 1.0, wave.y);
            new_Norm = cross(biTangent, Tangent);
            newPos = vec3(pos.x, pos.y,  wave.z);
            vNormal = normalize( normalMatrix* new_Norm);
            vPosition =  modelViewMatrix * vec4(newPos, 1.0);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
          }
          else
          if(water_Model == 1)
          {
            
            wave = calcNonNegSineWave(phase, wave_lenght, amplitude, time, direction, pos, k);
            
            biTangent = vec3(1.0, 0.0, wave.x);
            Tangent = vec3(0.0 , 1.0, wave.y);
            new_Norm = cross(biTangent, Tangent);
            newPos = vec3(pos.x, pos.y,  wave.z - 3.5);
            vNormal = normalize( normalMatrix* new_Norm);
            vPosition =  modelViewMatrix * vec4(newPos, 1.0);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
          }
          if(water_Model == 2)
          {
            //in float phase,in float wave_lenght , in float amplitude, in float time, in vec2 direction, in vec3 position, in int water_Model, in float k, in float Q, out vec3 Normal
            vec3 newPos = vec3(0.0, 0.0, 0.0);
            vec3 newNorm = vec3(0.0, 0.0, 0.0);
            vec3 newNorm1 = vec3(0.0, 0.0, 0.0);
            vec3 newNorm2 = vec3(0.0, 0.0, 0.0);
            vec3 newNorm3 = vec3(0.0, 0.0, 0.0);
            vec3 wave1 = calcGerstnerWave(2.0, 8.0, 1.0, time, vec2(90.0,30.0), pos, 2.5, 0.5, newNorm);
            vec3 wave2 = calcGerstnerWave(5.0, 5.0, 0.4, time, vec2(70.0,30.0), pos, 1.5, 0.8, newNorm1);
            vec3 wave3 = calcGerstnerWave(4.0, 8.1, 1.8, time, vec2(160.0,70.0), pos, 2.0, 0.2, newNorm2);
            vec3 wave4 = calcGerstnerWave(3.0, 6.0, 2.4, time, vec2(90.0,30.0), pos, 1.2, 0.4, newNorm3);
            vec3 p_Sum = wave1 + wave2 + wave3 + wave4;
            newPos = vec3( pos.x + p_Sum.x, pos.y + p_Sum.y, p_Sum.z);
            vec3 newNormal = newNorm + newNorm1 + newNorm2 + newNorm3;
            newNormal = vec3(-newNormal.x, -newNormal.y, 1.0 - newNormal.z);
            vNormal = normalize( normalMatrix* newNormal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
          }




        // }
        // else
        // {
        //   // Displacement along y
        //   //vec3 wave1 = calcWave(0.4, 1.0, 0.0, vec2(150.0,30.0), position, water_Model);

        //  // vec3 newPos = vec3(position.x, position.y  , position.z+ noise_Displacement);
        //   vec3 newPos = position + normal * noise_Displacement;
        //   float epsilon = 0.0001;

        //   vec3 tangent = orthogonal(normal);
        //   vec3 bitangent = normalize(cross(normal, tangent));

        //   vec3 neighbor1 = position + tangent * epsilon;
        //   vec3 neighbor2 = position + bitangent * epsilon;

        //   vec3 displacedneighbor1 = neighbor1 + normal  * noise_Displacement;
        //   vec3 displacedneighbor2 = neighbor2 + normal  * noise_Displacement;

        //   vec3 displacedTangent = displacedneighbor1 - newPos;
        //   vec3 displacedBitangent = displacedneighbor2 - newPos;
        //   vec3 newNormal = normalize(cross(displacedTangent, displacedBitangent));

        //   vNormal = normalize(normalMatrix * newNormal);
        //   // The cross product of tangent and bitangent gives the perpendicular vector, which is the new normal.
      



        //   vPosition =   modelViewMatrix * vec4(newPos, 1.0);

        //   gl_Position = projectionMatrix * modelViewMatrix *  vec4( newPos, 1.0 );
        // }
      

      }`;
}
function fragmentShader() {
  return `
  mat4 rotationX( in float angle ) {
    return mat4(	1.0,		0,			0,			0,
             0, 	cos(angle),	-sin(angle),		0,
            0, 	sin(angle),	 cos(angle),		0,
            0, 			0,			  0, 		1);
  }
  vec3 calc_Spec(float shine, vec3 lightDir, vec3 cameraPos, vec3 pos, vec3 n) {
    vec3 lightColor = vec3(1.0, 1.0, 1.0); 
    vec3 viewDir    = normalize(cameraPos - pos);
    vec3 halfwayDir = normalize(lightDir + viewDir);
    
    float spec = pow(max(dot(n,halfwayDir), 0.0), shine);

    return lightColor * spec;

  }
    
    varying vec2 vUv;
    varying float noise;
    varying float noise_Displacement;
    varying mat3 vNormalMatrix;

    uniform float lightx;
    uniform float lighty;
    uniform float lightz;
    uniform float time;
    //uniform vec3 cameraPosition;

    varying vec4 vPosition;
    varying vec3 vNormal;

    
    void main() {
      
      
     
                
      float PI = 3.14159265359;

      mat4 rot_x = rotationX(90.0);
      float k_a = 0.2; //ambient
      float k_d = 0.5; //diffuse
      float k_s = 0.5; //specular
      vec3 lightColor = vec3(1.0, 1.0, 1.0); 
      vec3 n = normalize(vNormal); 
            
      vec3 pos =  vPosition.xyz;
      
      vec4 lightPosition = viewMatrix * vec4(lightx, lighty, lightz,1.0);
      vec3 lightDir   = normalize(lightPosition.xyz - pos);
      vec4 vcameraPos = viewMatrix * vec4(cameraPosition,1.0);
      vec3 cameraPos = vcameraPos.xyz;
      float NdotL = dot(lightDir, n);

      
    
      vec3 water = (smoothstep( -1000.0, -0.5, noise_Displacement ) - smoothstep( -0.16, -0.15, noise_Displacement ))  * vec3( 0.0, 0.0, 1.0 ) + calc_Spec(256.0, lightDir, cameraPos, pos, n)* k_s;
      vec3 sand = (smoothstep( -1.0, 1.4, noise_Displacement ) - smoothstep( 1.2, 1.25, noise_Displacement ))  * vec3( 0.76, 0.7, 0.5 );
      vec3 grass = (smoothstep( -1.2, 8.0, noise_Displacement ) - smoothstep( 09.8, 10.3, noise_Displacement ))  * vec3( 0.0, 0.7, 0.1 );
      vec3 rock = (smoothstep( 8.10, 16.0, noise_Displacement ) - smoothstep( 15.80, 16.22, noise_Displacement ))  * vec3( 0.38, 0.33, 0.28 );
      vec3 snow = (smoothstep( 15.0, 16.0, noise_Displacement ))  * vec3( 1, 1, 1 );
      
     

     vec3 groundColor = vec3( 0.0, 0.0, 1.0 ) + calc_Spec(256.0, lightDir, cameraPos, pos, n)* k_s;//vec3( water + sand + grass + rock  + snow);
     vec3 diffuseLight = groundColor * NdotL;
    // vec3 groundSpecular = groundColor * spec;
   //  gl_FragColor = vec4(normalize(vNormal),1.0);//vec4((water + sand + grass + rock  + snow) *diffuseLight, 1.0);
      vec3 finalColor =  k_a * groundColor + k_d * diffuseLight;
     gl_FragColor = vec4(finalColor, 1.0);


     
      
    
    }
  `;
}

function updateWater() {
  switch (planeControls.water_Controler) {
      case 'Sum of sines':
        console.log('Sum of sines');
        return 0;
          break;
      case 'None negative sum of sine':
        console.log('None negative sum of sine');
        return 1;
          break;
      case 'Perlin_Noise_3D':
        console.log('Perlin_Noise_3D');
        return 2;
          break;
  }
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
    fbm_amplitude: 1.0,
    numberOfOctaves: 5.0,
    lightx: 0.0,
    lighty: 100.0,
    lightz: 0.0,
    water_Controler: 'None negative sum of sine'

  
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
  camera.position.set( 10,1000 , 1000 );
  
  //camera.rotateX(-Math.PI/2)
  camera.lookAt( 0,0,0 );

  // create material and bump/hightmap texture
  
 // const disMap = new THREE.TextureLoader().load('http://127.0.0.1:5500/Images/hmap.jpg');
  
  var uniforms = { 
        
    time: { // float initialized to 0
      type: "f",
      value: 0.0},
    disScale : { value: 100.0 },
    frequency: { value: 2.0 },
    fbm_amplitude: { value: 1.0 },
    numberOfOctaves: { value: 5.0 },
    time: { value: 0.0 },
    lightx:{value: 0.0} ,
    lighty: {value: 100.0},
    lightz: {value: 0.0},
    water_Color: {value: new THREE.Vector3(0.0, 0.0, 1.0)},
    water_Model: {value: 0}
    
    

  };
  var water_Color = new THREE.Vector3(0.0, 0.0, 1.0);
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

  const axesHelper = new THREE.AxesHelper( 400 );
  axesHelper.position.set(700, 0, 700)
  const plane_axesHelper = new THREE.AxesHelper( 500 );
  plane_axesHelper.position.set(700,0,0);
  plane_axesHelper.rotation.x = -Math.PI/2;
  

  scene.add(plane_axesHelper)
  scene.add(axesHelper)
  //scene.add( groundMesh );
  groundMesh.position = new THREE.Vector3(0,0,0);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.updateMatrix();
 // groundMesh.position.y = -0.5;
  
  light_Sphere.rotation.x = -Math.PI / 2;
  //scene.rotation.x = -Math.PI / 2;
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
  planeFolder.add( planeControls, 'fbm_amplitude', 0, 10 ).name( 'Amplitude' ).listen();
  planeFolder.add( planeControls, 'numberOfOctaves', 0, 32 ).name( 'Octaves' ).listen();
  planeFolder.add( planeControls, 'displacement', 0, 150 ).name( 'Displacement' ).listen();
  
 // planeFolder.add( groundMesh.material, 'displacementScale', 1, 100 ).name( 'Displacement' ).listen();
  planeFolder.add(groundMesh.material, 'wireframe').name('Wireframe').listen();
  //Light

  const cubeFolder = gui.addFolder('Light_Position')
  cubeFolder.add(planeControls, 'lightx', -1000, 1000)
  cubeFolder.add(planeControls, 'lighty', -1000, 1000)
  cubeFolder.add(planeControls, 'lightz', -1000, 1000)
  cubeFolder.open()
  //Water
  const waterFolder = gui.addFolder('Water')
  //waterFolder.addColor(uniforms, 'x').name('water_Color')
  waterFolder.add(planeControls, 'water_Controler',['Sum of sines', 'None negative sum of sine', 'Perlin_Noise_3D']).listen();
  waterFolder.open()


  
  
  waterFolder.open()
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
  uniforms.fbm_amplitude.value = planeControls.amplitude;
  uniforms.numberOfOctaves.value = planeControls.numberOfOctaves;
  uniforms.lightx.value = planeControls.lightx;
  uniforms.lighty.value = planeControls.lighty;
  uniforms.lightz.value = planeControls.lightz;
  light_Sphere.position.set(planeControls.lightx, planeControls.lighty, planeControls.lightz);
  //console.log(uniforms.water_Model);
  uniforms.water_Model.value = updateWater();
  
  

 
  render();


}
function render() {
  material.uniforms[ 'time' ].value = .005 * ( Date.now() - start );
  renderer.render( scene, camera );
  

}
animate();

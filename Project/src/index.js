


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
    
    
        float rand(float x){
          return fract(pow(sin(x)*10000.0, 2.0));
        }
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
      vec3 calcGerstnerWave(in float phase[4], in float wave_lenght[4] , in float amplitude[4], in float time, in vec2 direction[4], in vec3 position, in float[4] k, in float[4] Q, out vec3 Normal) {
        // Q = 0 normal sine, Q = 1/(W * A ) sharp crest

          float freq_i = 0.0;
          float speed_i = 0.0;
          vec2 d = vec2(0.0);
          float xy = 0.0; 
          vec3 result = vec3(0.0); 
           
          vec3 biTangent = vec3(0.0);
          vec3 Tangent = vec3(0.0);
          float random_value = 0.0;
          for(int i = 0; i < 4; i++)
          {
            freq_i = 2.0/wave_lenght[i];
            speed_i = phase[i] * freq_i;
            //vec2 d = normalize(vec2(sin(random_value),cos(random_value)));
            d = normalize(getDirection(direction[i], position));
            xy = d.x * position.x + d.y * position.y;
            result.x += (Q[i] * amplitude[i] * d.x * cos(freq_i * xy + time * speed_i));
            result.y += (Q[i] * amplitude[i] * d.y * cos(freq_i * xy + time * speed_i));
            result.z += sin( xy * freq_i + time * speed_i )* amplitude[i];
            biTangent.x += (Q[i] * pow(d.x,2.0) * amplitude[i] * freq_i * sin(freq_i * xy + time * speed_i));
            biTangent.y += (Q[i] * d.x * d.y * amplitude[i] * freq_i * sin(freq_i * xy + time * speed_i));
            biTangent.z += d.x * amplitude[i] * freq_i * cos(freq_i * xy + time * speed_i);
            Tangent.x += (Q[i] * d.x * d.y * amplitude[i] * freq_i * sin(freq_i * xy + time * speed_i));
            Tangent.y +=  (Q[i] * pow(d.y,2.0) * amplitude[i] * freq_i * sin(freq_i * xy + time * speed_i));
            Tangent.z += d.y * amplitude[i] * freq_i * cos(freq_i * xy + time * speed_i);
            random_value += 1051.854521;

          }
          vec3 b_T = vec3(1.0 - biTangent.x, (-biTangent.y), biTangent.z); 
          vec3 T = vec3((-Tangent.x), (1.0 - Tangent.y), Tangent.z);
          Normal = cross(b_T, T);
          return vec3(result.x + position.x, result.y + position.y, result.z);
      }


       // source http://lolengine.net/blog/2013/09/21/picking-orthogonal-vector-combing-coconuts
      vec3 orthogonal(vec3 v) {
        return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, 0.0, v.x)
        : vec3(0.0, -v.z, v.y));
      }
      vec3 fbm_Wave (in vec3 point, in float time, in float numberofOctaves) {
        // Initial values
        vec3 result = vec3(0.0);
       // float amplitude = 1.0;
        float A = 2.0;
      
       // ae^(maxsin(x)-min)
        //a*maxe^{maxsin(x)-min}cos(x)
        float frequency = 0.1;
        float speed = 0.5;
        vec3 position = point;
        float random_value = 0.0;
        float weight = 2.0;
        
        float test = 1.0;
        float x = 0.0;
        float phi = 0.0;
        float d_phi = 0.0;
        float drag = 0.5;
        for (float i = 0.0; i < numberofOctaves; i++) {
            
            vec2 d = normalize(vec2(sin(random_value),cos(random_value)));
              if(test == 1.0)
              {
                phi = A*sin(dot(d, position.xy) * frequency + time * speed );
                d_phi = frequency * cos(dot(d, position.xy) * frequency + time * speed );
              }
              if(test == 2.0)
              {
                x = sin(dot(d, position.xy) * frequency + time * speed );
                phi = A * exp(2.0 * x - 1.0);
                d_phi = frequency * A * 2.0 * exp(2.0 * x - 1.0) * cos(x);
              }
            //float phi = sin(dot(d, point.xy) * frequency + time * speed );
            //float d_phi = cos(dot(d, point.xy) * frequency + time * speed );
            result.z += phi;
            result.x += A * d_phi  * d.x;
            result.y += A * d_phi  * d.y;
            frequency *= 1.18;
            //position.xy += vec2((-result.x), (-result.y))*0.1;
            speed += 0.0090;
            
            A *= 0.82;
            random_value += 1051.854521;
        }
        return result/weight;
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
         //{

          // Displacement along y
          vec3 pos = position;
          
          //vec3 disp = calcDisplacement(pos, time);
          // speed,wave length , amplitude, time, direction, position
          float phase[4] = float[4](2.0, 5.0, 4.0, 3.0);
          float wave_lenght[4] = float[4](8.0, 5.0, 8.1, 6.0);
          float amplitude[4] = float[4](2.0, 0.4, 0.8, 1.4);
          vec2 direction[4] = vec2[4](vec2(90.0,30.0), vec2(70.0,30.0), vec2(160.0,70.0), vec2(90.0,30.0));
 
          float k[4] = float[4](1.2, 1.5, 1.0, 1.2);
          float Q[4] = float[4](1.0, 0.8, 0.1, 1.0);
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

            vec3 new_Norm = vec3(0.0, 0.0, 0.0);
            vec3 wave = calcGerstnerWave(phase, wave_lenght, amplitude, time, direction, pos, k, Q, new_Norm);
            new_Norm = normalize(new_Norm);
            vNormal = normalize( normalMatrix* new_Norm);
            vPosition =  modelViewMatrix * vec4(wave, 1.0);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(wave, 1.0);
          }
          if(water_Model == 3)
          {
            wave = fbm_Wave(pos,  time,  numberOfOctaves);
            
            biTangent = vec3(1.0, 0.0, wave.x);
            Tangent = vec3(0.0 , 1.0, wave.y);
            new_Norm = cross(biTangent, Tangent);
            newPos = vec3(pos.x, pos.y, wave.z);
            vNormal = normalize( normalMatrix* new_Norm);
            vPosition =  modelViewMatrix * vec4(newPos, 1.0);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
          }
          if(water_Model == 4)
          {

            vNormal = normalize( normalMatrix* normal);
            vPosition =  modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
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
  vec3 applyFog( in vec3  col,   // color of pixel
               in float t,     // distance to point
               in vec3  rd,    // camera to point
               in vec3  lig )  // sun direction
{
    float b = 0.0001; // fog density
    float fogAmount = 1.0 - exp(-t*b);
    float sunAmount = max( dot(rd, lig), 0.0 );
    vec3  fogColor  = mix( vec3(0.5,0.6,0.7), // blue
                           vec3(1.0,0.9,0.7), // yellow
                           pow(sunAmount,8.0) );
    return mix( col, fogColor, fogAmount );
}
    
    varying vec2 vUv;
    varying float noise;
    varying float noise_Displacement;
    varying mat3 vNormalMatrix;

    uniform float lightx;
    uniform float lighty;
    uniform float lightz;
    uniform float time;
    uniform vec3 water_Color;
    uniform vec3 diffuse_water_Color;

    uniform samplerCube cube_Texture;
    //uniform vec3 cameraPosition;

    varying vec4 vPosition;
    varying vec3 vNormal;

    
    void main() {
      
      
     
                
      float PI = 3.14159265359;

      mat4 rot_x = rotationX(90.0);
      float k_a = 0.2; //ambient
      float k_d = 0.3; //diffuse
      float k_s = 0.4; //specular
      vec3 lightColor = vec3(1.0, 1.0, 1.0); 
      vec3 n = normalize(vNormal); 
            
      vec3 pos =  vPosition.xyz;
      
      vec4 lightPosition = viewMatrix * vec4(lightx, lighty, lightz,1.0);
      vec3 lightDir   = normalize(lightPosition.xyz - pos);
      vec4 vcameraPos = viewMatrix * vec4(cameraPosition,1.0);
      vec3 cameraPos = vcameraPos.xyz;
      float NdotL = dot(lightDir, n);
      //Background reflection
      vec4 ref_pos = viewMatrix * vec4(pos, 1.0);
      vec3 reflectDir = normalize(ref_pos.xyz - cameraPos);



      vec3 test = textureCube(cube_Texture,reflectDir).rgb;
      
    
      vec3 water = (smoothstep( -1000.0, -0.5, noise_Displacement ) - smoothstep( -0.16, -0.15, noise_Displacement ))  * water_Color + calc_Spec(256.0, lightDir, cameraPos, pos, n)* k_s;
      vec3 sand = (smoothstep( -1.0, 1.4, noise_Displacement ) - smoothstep( 1.2, 1.25, noise_Displacement ))  * vec3( 0.76, 0.7, 0.5 );
      vec3 grass = (smoothstep( -1.2, 8.0, noise_Displacement ) - smoothstep( 09.8, 10.3, noise_Displacement ))  * vec3( 0.0, 0.7, 0.1 );
      vec3 rock = (smoothstep( 8.10, 16.0, noise_Displacement ) - smoothstep( 15.80, 16.22, noise_Displacement ))  * vec3( 0.38, 0.33, 0.28 );
      vec3 snow = (smoothstep( 15.0, 16.0, noise_Displacement ))  * vec3( 1, 1, 1 );
      
     

     vec3 groundColor = water_Color + calc_Spec(256.0, lightDir, cameraPos, pos, n)* k_s;//vec3( water + sand + grass + rock  + snow);
     //vec3 groundColor = vec3(water + sand + grass + rock  + snow);

     vec3 diffuseLight = water_Color * NdotL;
    // vec3 groundSpecular = groundColor * spec;
   //  gl_FragColor = vec4(normalize(vNormal),1.0);//vec4((water + sand + grass + rock  + snow) *diffuseLight, 1.0);
      vec3 finalColor =  k_a * groundColor + k_d * diffuseLight;
      
      //fog    // color of pixel// distance to point// camera to point// sun direction

      vec3 fogColor = applyFog(finalColor, length(pos - cameraPos), normalize(cameraPos - pos), lightDir);
      // gamma correction
     finalColor = pow( finalColor, vec3(1.0/2.2) );
     finalColor = finalColor + test * 0.1;
     gl_FragColor = vec4(finalColor, 1.0);


     
      
    
    }
  `;
}

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
  

  
  // create a scene
  scene = new THREE.Scene();
 
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  const html_Container = document.getElementById('container');
  //FPS counter
  var stats = new Stats()
  stats.showPanel(0);
  html_Container.appendChild(stats.domElement)
  html_Container.appendChild( renderer.domElement );
  // create a camera the size of the browser window
  // and place it 100 units away, looking towards the center of the scene
  camera = new THREE.PerspectiveCamera(
    fov,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  // Skybox texture loader
  const loader = new THREE.CubeTextureLoader();
  loader.setPath( '/Skybox/allsky/' );
  const cube_Texture = loader.load( ['px.png', 'nx.png', 'py.png', 'ny.png', 'nz.png', 'pz.png'] );
  scene.background = cube_Texture;
  controls = new THREE.OrbitControls( camera, renderer.domElement );
  camera.position.set( 10,1000 , 1000 );
  //var test = cube_Texture(cube_Texture, new THREE.Vector3(0,0,0));
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
    water_Model: {value: 0},
    cube_Texture: { value: cube_Texture },
    diffuse_water_Color: {value: new THREE.Vector3(0.0, 0.0, 1.0)},
    
    

  };
 
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

  const params = {color: [0.0, 0.0, 1.0]};

// This vector will store the RGB components
const rgbVector = new THREE.Vector3();

// // Function to update the vector with the new color
// function updateColorVector(hexColor) {
//     // Create a new THREE.Color object from the hex value
//     const color = new THREE.Color(hexColor);
    
//     // Convert color components to [0, 255] and update the vector
//     uniforms.water_Color.value.set(color.r , color.g , color.b);

// }  


  const waterFolder = gui.addFolder('Water')
// Add a color controller to the GUI and listen for changes
waterFolder.addColor(params, 'color').onChange(function(newValue) {
  // newValue is the new color value as a hex string, e.g., '#ffae23'
  water_Color.value.set(newValue);
  
});
// Add a color controller to the GUI and listen for changes
waterFolder.addColor(params, 'color').onChange(function(newValue) {
  // newValue is the new color value as a hex string, e.g., '#ffae23'
  water_Color.value.set(newValue);
  
});
waterFolder.add( planeControls, 'numberOfOctaves', 0, 32 ).name( 'Octaves' ).listen();

  waterFolder.add(planeControls, 'water_Controler',['Sum of sines', 'None negative sum of sine', 'Gestner_wave', 'FBM_wave']).listen();
  var conf = new THREE.Color('0xff0000 ');

  

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
  //uniforms.fbm_amplitude.value = planeControls.fbm_amplitude;
  uniforms.numberOfOctaves.value = planeControls.numberOfOctaves;
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
  material.uniforms[ 'time' ].value = .005 * ( Date.now() - start );
  stats.begin();
  renderer.render( scene, camera );
  stats.end();

}
animate();

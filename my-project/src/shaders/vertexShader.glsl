

  // Adds the text in the calsspicperling noise function


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

      }

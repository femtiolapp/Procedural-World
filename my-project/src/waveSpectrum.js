import * as THREE from 'three';
import { klein } from 'three/examples/jsm/Addons.js';

//Gaussian random number generator 
function gaussianRandom(mean = 0, stdev = 1) {
    let u = 1 - Math.random(); // avoid 0
    let v = Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdev + mean;
}

function mirrorIndex(m, n, size){
    const mi = (size - m) % size;
    const ni = (size - n) % size;
    return mi * size + ni;
}

export function createSpectrum(amplitude, size, windSpeed) {

    const windDirection = new THREE.Vector2(1, 0).normalize();
    const gravity = 9.81;
    const L = Math.pow(windSpeed, 2) / gravity;


    const spectrum = [];
    const gaussNoise = [];
    const h0Array = []

    for (let m = 0; m < size; m++) {
        for (let n = 0; n < size; n++) {
            //Create a symmetric range from roughly −π to +π
            const kx = (Math.PI * (2 * n - size)) / size;
            const ky = (Math.PI * (2 * m - size)) / size;
            const k = new THREE.Vector2(kx, ky);
            
            const kLen = k.length();
            if (kLen < 1e-6) {
                spectrum.push(0);
                gaussNoise.push(new THREE.Vector2(0, 0));
                h0Array.push(new THREE.Vector2(0, 0));
                continue;
            }

            const kHat = k.clone().divideScalar(kLen);  // k/klen
            const alignment = kHat.dot(windDirection);
            // Small-wave damping constant
            const l = L / 1000;
            const philips = amplitude *
                Math.exp(-1 / (kLen * L) ** 2) /
                (kLen ** 4) *
                (alignment ** 2) *
                Math.exp(-kLen * kLen * l * l);

            const noise = (new THREE.Vector2(gaussianRandom(0, 1), gaussianRandom(0, 1)));
            const h0 = new THREE.Vector2(
                noise.x * Math.sqrt(philips / 2),
                noise.y * Math.sqrt(philips / 2)
            );
            spectrum.push(philips);
            gaussNoise.push(noise);
            h0Array.push(h0); // x = real , y = imaginary
        }

    }
    ;
    const image = createImage(spectrum, gaussNoise, h0Array, size);

    return [spectrum, gaussNoise, h0Array];
}
function createImage(spectrum, guaseNoise, h0Array, size) {
    const minVal = Math.min(...spectrum);
    const maxVal = Math.max(...spectrum);

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = (size *2) + "px";   // zoom factor
    canvas.style.height = (size *2) + "px";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false; // important

    const imageData = ctx.createImageData(size, size);

    for (let i = 0; i < size * size; i++) {
        const val = spectrum[i].x * 1e2;

        const randomval = guaseNoise[i];
        const logVal = Math.log1p(val);
        const logMin = Math.log1p(minVal);
        const logMax = Math.log1p(maxVal);
        const logNorm = (logVal - logMin) / (logMax - logMin);
        const norm = Math.pow(logNorm, 0.4); // gamma < 1 brightens
        const color = Math.floor(norm);
     
        const idx = i * 4;
        imageData.data[idx] =  h0Array[i].x * 1e3 ;    // R
        imageData.data[idx + 1] =  h0Array[i].y *1e3; // G
        imageData.data[idx + 2] = 0; // B
        imageData.data[idx + 3] = 255;   // A
    }

    ctx.putImageData(imageData, 0, 0);
}
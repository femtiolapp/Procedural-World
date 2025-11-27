import * as THREE from 'three';
import { klein } from 'three/examples/jsm/Addons.js';

//Gaussian random number generator 
function gaussianRandom(mean = 0, stdev = 1) {
    let u = 1 - Math.random(); // avoid 0
    let v = Math.random();
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdev + mean;
}

function mirrorIndex(m, n, size) {
    const mi = (size - m) % size;
    const ni = (size - n) % size;
    return mi * size + ni;
}

export function createSpectrum(amplitude, size, windSpeed, L_domain) {

    const windDirection = new THREE.Vector2(1, 0).normalize();
    const gravity = 9.81;

    const L = Math.pow(windSpeed, 2) / gravity;


    const spectrum = [];
    const gaussNoise = [];
    const h0Array = []
    const data = new Float32Array(4 * size * size);

    for (let m = 0; m < size; m++) {
        for (let n = 0; n < size; n++) {

            const kX_index = (n < size / 2) ? n : n - size;
            const kY_index = (m < size / 2) ? m : m - size;
            const kx = (2.0 * Math.PI * kX_index) / L_domain;
            const ky = (2.0 * Math.PI * kY_index) / L_domain;
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
            const smallWaveDamping = L_domain / 1000;
            const philips = amplitude *
                Math.exp(-1 / (kLen * L) ** 2) /
                (kLen ** 4) *
                (alignment ** 2) *
                Math.exp(-kLen * kLen * smallWaveDamping * smallWaveDamping);

            const noise = (new THREE.Vector2(gaussianRandom(0, 1), gaussianRandom(0, 1)));
            const h0 = new THREE.Vector2(
                noise.x * Math.sqrt(philips / 2),
                noise.y * Math.sqrt(philips / 2)
            );
            const idx = 4 * (m * size + n);

            data[idx + 0] = h0.x;
            data[idx + 1] = h0.y;
            data[idx + 2] = 0.0;
            data[idx + 3] = 0.0;
            spectrum.push(philips);
            gaussNoise.push(noise);
            h0Array.push(h0); // x = real , y = imaginary
        }

    };
    // const image = createImage(data ,spectrum, gaussNoise, h0Array, size);
    //const image2 = displayMultiChannelFloatArrayAsImage(data, size, "canvas2");
    const spectrumTexture = new THREE.DataTexture(
        data,
        size, // width
        size, // height
        // IMPORTANT: Use the correct format and type for floating-point data
        THREE.RGBAFormat,
        THREE.FloatType
    );
    spectrumTexture.needsUpdate = true;
    return spectrumTexture;
}
function createImage(data, spectrum, guaseNoise, h0Array, size) {
    const minVal = Math.min(...spectrum);
    const maxVal = Math.max(...spectrum);

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = (size * 2) + "px";   // zoom factor
    canvas.style.height = (size * 2) + "px";
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
        imageData.data[idx] = h0Array[i].x * 1e3;    // R
        imageData.data[idx + 1] = h0Array[i].y * 1e3; // G
        imageData.data[idx + 2] = 0; // B
        imageData.data[idx + 3] = 255;   // A
    }

    ctx.putImageData(imageData, 0, 0);
}
//AI
function displayMultiChannelFloatArrayAsImage(floatArray, size, canvasId) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = size;
    canvas.height = size;

    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;
    document.body.appendChild(canvas);
    const arraySize = size * size;

    // Optional: Find min and max for each channel for proper normalization
    // For simplicity, this example assumes your data is already in a visual range,
    // or you can normalize based on a known range (e.g., -1 to 1).
    // Let's assume a range of [-5, 5] for our example.

    const rangeMin = -5;
    const rangeMax = 5;
    const range = rangeMax - rangeMin;

    // Loop through each pixel in the 2D grid
    for (let i = 0; i < arraySize; i++) {
        // Calculate the index for the floatArray
        const floatIndex = i * 4;

        // Get the float values for the four channels
        const floatR = floatArray[floatIndex + 0]; // h0 real
        const floatG = floatArray[floatIndex + 1]; // h0 imaginary
        const floatB = floatArray[floatIndex + 2]; // h0_minus_k_conj real
        const floatA = floatArray[floatIndex + 3]; // h0_minus_k_conj imaginary

        // Normalize and convert to 8-bit integer (0-255)
        // This is a crucial step for visualization. You can choose
        // to visualize any combination of channels.
        // Here, we'll visualize the real part of h0(k) and its conjugate.

        // Normalize the R channel
        const r = Math.floor(((floatR - rangeMin) / range) * 255);
        // Normalize the G channel
        const g = Math.floor(((floatG - rangeMin) / range) * 255);
        // Normalize the B channel
        const b = Math.floor(((floatB - rangeMin) / range) * 255);
        // Normalize the A channel (and make it opaque)
        const a = 255;

        // Calculate the index for the ImageData array
        const dataIndex = i * 4;

        // Assign the values
        data[dataIndex + 0] = floatR;
        data[dataIndex + 1] = floatG;
        data[dataIndex + 2] = floatB;
        data[dataIndex + 3] = a;
    }

    // Put the ImageData onto the canvas
    ctx.putImageData(imageData, 0, 0);
}


export function computeFFT(renderer, passes, renderTargets, material, scene, camera, mrtTexture, outRender) {
    // 💡 Add safety to ensure uniform starts clean

    // material.uniforms.src.value = null;


    let lastTexture = null;

    for (const pass of passes) {
        // 1. Get Input and Output Targets

        const inputTarget = renderTargets[pass.input];
        const outputTarget = renderTargets[pass.output];
        
        let inputTexture;

        // console.log("output" + outputTarget);

        //  console.log(`FFT Pass ${pass.id}: ${pass.input} → ${pass.output}, subSize=${pass.subtransformSize}`);
        // 2. Update Material Uniforms
        // let srcTexture;
        // if (pass.input === "philipsSpectrum") {
        //     // The FFT pipeline should begin with the height spectrum

        //     srcTexture = inputTarget.texture
        // } else {
        //     srcTexture = inputTarget.texture;

        // }
        if (!lastTexture) {
            // First pass input
            inputTexture = mrtTexture;
        } else {
            // All other passes use the PREVIOUS output
            inputTexture = lastTexture;
        }

        material.uniforms.u_inputTexture.value = inputTexture;



        material.uniforms.u_subtransformSize.value = pass.subtransformSize;
        material.uniforms.u_horizontal.value = pass.horizontal;
        material.uniforms.u_forward.value = pass.forward;
        material.uniforms.u_normalization.value = pass.normalization;
        // resolution is already set if width/height are constant

        // 3. Perform the Rendering Pass
        renderer.setRenderTarget(outputTarget);
        //
        renderer.clear(true, true, true);
        renderer.render(scene, camera);
        // console.log(lastTexture);
        lastTexture = outputTarget.texture;
        //inputTexture = lastTexture;
    }

    // Reset render target
    renderer.setRenderTarget(null); // reset to screen
    
    renderer.setRenderTarget(outRender);
    material.uniforms.u_inputTexture.value = lastTexture;
    renderer.clear(true, true, true);
    renderer.render(scene, camera);
    let test;
    
    test = outRender.texture;
    renderer.setRenderTarget(null); // reset to screen
    return test;
}

// export function computeFFT(
//     renderer,
//     passes,
//     renderTargets,   // expects { ping, pong, output }
//     fftMaterial,
//     fftScene,
//     camera,
//     inputTexture
// ) {
//     let ping = renderTargets.ping;
//     let pong = renderTargets.pong;

//     // initial input goes into ping target
//     fftMaterial.uniforms.u_inputTexture.value = inputTexture;

//     renderer.setRenderTarget(ping);
//     renderer.render(fftScene, camera);

//     // process each FFT pass
//     for (let i = 0; i < passes.length; i++) {
//         const pass = passes[i];

//         // set uniforms for this pass
//         fftMaterial.uniforms.u_inputTexture.value = ping.texture;
//         fftMaterial.uniforms.u_subtransformSize.value = pass.subtransformSize;
//         fftMaterial.uniforms.u_horizontal.value = pass.horizontal;
//         fftMaterial.uniforms.u_forward.value = pass.forward;
//         fftMaterial.uniforms.u_normalization.value = pass.normalization;
//         // render -> pong
//         renderer.setRenderTarget(pong);
//         renderer.render(fftScene, camera);

//         // swap
//         const tmp = ping;
//         ping = pong;
//         pong = tmp;
//     }

//     // final pass: write into user-provided output RT
//     renderer.setRenderTarget(renderTargets.output);
//     fftMaterial.uniforms.u_inputTexture.value = ping.texture;
//     renderer.render(fftScene, camera);

//     renderer.setRenderTarget(null);

//     // return final GPU texture
//     return renderTargets.output.texture;
// }


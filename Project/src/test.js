// Set up the scene, camera, and renderer
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
controls = new THREE.OrbitControls( camera, renderer.domElement );
camera.position.set( 0, 100, 200 );
// Create a frustum for the camera
var frustum = new THREE.Frustum();
var cameraViewProjectionMatrix = new THREE.Matrix4();

// Add some objects to the scene
var geometry = new THREE.BoxGeometry();
var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

for (var i = 0; i < 100; i++) {
    var cube = new THREE.Mesh(geometry, material);
    cube.position.set(Math.random() * 50 - 25, Math.random() * 50 - 25, Math.random() * 50 - 25);
    scene.add(cube);
}

// Update the frustum and camera matrix
function updateFrustum() {
    camera.updateMatrixWorld(); // Make sure the camera matrix is updated
    cameraViewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromProjectionMatrix(cameraViewProjectionMatrix);
}
const helper = new THREE.CameraHelper( camera );
scene.add( helper );
// Render loop
function animate() {
    requestAnimationFrame(animate);

    // Update frustum before rendering
    updateFrustum();

    // Traverse all objects in the scene and check if they are inside the frustum
    scene.traverse(function (object) {
        if (object instanceof THREE.Mesh) {
                        // Move the cubes (you can adjust the movement based on your requirements)
                        object.position.x += 0.1 * Math.sin(object.position.y * 0.1);
                        object.position.y += 0.1 * Math.cos(object.position.x * 0.1);
            if (frustum.intersectsObject(object)) {
                object.visible = true; // Object is inside the frustum, make it visible
            } else {
                object.visible = false; // Object is outside the frustum, make it invisible
                console.log("hej")
                console.log(cameraViewProjectionMatrix)
            }
        }
    });

    // Render the scene
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', function () {
    var newWidth = window.innerWidth;
    var newHeight = window.innerHeight;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(newWidth, newHeight);
});

// Start the rendering loop
animate();

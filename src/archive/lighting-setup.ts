import './style.css'
import * as THREE from 'three';
import { OBB } from 'three/addons/math/OBB.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { setupLights } from './lighting';


const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x222222)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
// camera.position.z = 7;
camera.position.z = 4;
camera.position.y = 3;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

const controls = new OrbitControls(camera, renderer.domElement);
// controls.target.set(0, 5, 0);
controls.target.set(0, 0, 0);
controls.update();


const planeSize = 40;
 
const loader = new THREE.TextureLoader();
const texture = loader.load('/textures/checker.png');
// const texture = loader.load('checker.png');
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.magFilter = THREE.NearestFilter;
texture.colorSpace = THREE.SRGBColorSpace;
const repeats = planeSize / 2;
texture.repeat.set(repeats, repeats);

const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
const planeMat = new THREE.MeshPhongMaterial({
  map: texture,
  side: THREE.DoubleSide,
});
const mesh = new THREE.Mesh(planeGeo, planeMat);
// mesh.rotation.x = Math.PI * -.5;
mesh.rotateX(Math.PI * -.5);
scene.add(mesh);


// const color = 0xFFFFFF;
// const intensity = 150;
// const light = new THREE.PointLight(color, intensity);
// light.position.set(0, 10, 0);
// // light.target.position.set(-5, 0, 0);
// scene.add(light);


// // Directional light simulates sunlight or a focused beam
// const spotLight = new THREE.SpotLight(0xaaaa00, 100); // (color, intensity)

// // Position it high and to the side
// // spotLight.position.set(10, 20, 10); // x, y, z
// spotLight.position.set(3, 5, 0); // x, y, z

// // Aim the light at the center of the scene
// spotLight.target.position.set(0, 0, 0);
// scene.add(spotLight.target);

// // Optional: control the cone of light
// spotLight.angle = Math.PI / 6; // spread of light
// spotLight.penumbra = 0.2;      // softness on the edges
// spotLight.decay = 2;           // how it fades over distance
// spotLight.distance = 100;      // max reach of the light

// // Optional: enable shadows
// spotLight.castShadow = true;
// spotLight.shadow.mapSize.width = 1024;
// spotLight.shadow.mapSize.height = 1024;
// spotLight.shadow.camera.near = 1;
// spotLight.shadow.camera.far = 100;

// // Add to scene
// scene.add(spotLight);

// const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
// scene.add(ambientLight);

// Place after you call setupLights()
const lights = setupLights(scene);

// GUI Controls
const gui = new GUI();
const lightFolder = gui.addFolder('Lights');

const lightConfig = {
  'Point Light': true,
  'Spot Light': true,
};

lightFolder.add(lightConfig, 'Point Light').onChange((val: boolean) => {
  lights.point.visible = val;
});
lightFolder.add(lightConfig, 'Spot Light').onChange((val: boolean) => {
  lights.spot.visible = val;
});
lightFolder.open();



function render() {
  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update(); // Required if damping is enabled
  render();
}
animate();

import "./style.css";
import * as THREE from "three";
import { OBB } from "three/addons/math/OBB.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { setupLights } from "./lighting";
import { Domino, Axis } from "./Domino";

const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x222222)
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
// camera.position.z = 7;
camera.position.z = 4;
camera.position.y = 3;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", onWindowResize, false);
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
const texture = loader.load("/textures/checker.png");
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
mesh.rotateX(Math.PI * -0.5);
scene.add(mesh);

// const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
// scene.add(ambientLight);

// Place after you call setupLights()
const lights = setupLights(scene);

// GUI Controls
const gui = new GUI();
const lightFolder = gui.addFolder("Lights");

const lightConfig = {
  "Point Light": true,
  "Spot Light": true,
};

lightFolder.add(lightConfig, "Point Light").onChange((val: boolean) => {
  lights.point.visible = val;
});
lightFolder.add(lightConfig, "Spot Light").onChange((val: boolean) => {
  lights.spot.visible = val;
});
lightFolder.open();

/*
// Overhead Camera
const overheadCam = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
overheadCam.position.set(0, 20, 20);
overheadCam.lookAt(0, 0, 0);

// Follow Camera
const followCam = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const trackballControls = new TrackballControls(overheadCam, renderer.domElement);
trackballControls.noZoom = false;

let activeCamera = overheadCam;
// let followTarget = movingObject; // replace with your actual object
let followTarget = null;
let followOffset = new THREE.Vector3(0, 2, -5); // slightly above and behind

let followYaw = 0; // rotation around Y-axis

let currentMode = 'overhead'; // or 'follow'

window.addEventListener('keydown', (e) => {
  if (e.key === 'c') {
    currentMode = currentMode === 'overhead' ? 'follow' : 'overhead';
    activeCamera = currentMode === 'overhead' ? overheadCam : followCam;
    console.log(`Switched to ${currentMode} camera.`);
  }
  if (currentMode === 'follow') {
    if (e.key === 'ArrowLeft') followYaw += 0.05;
    if (e.key === 'ArrowRight') followYaw -= 0.05;
  }
});
*/

// const v1 = new THREE.Vector3(-4, 0, 3);
// const v2 = new THREE.Vector3(3, 0, 3);
// const v3 = new THREE.Vector3(-4, 0, -5);
// // const v3 = new THREE.Vector3(4,0,-1);
// const vc1 = v2.clone().lerp(v3, 0.5).add( new THREE.Vector3(4,0,-1) );
// const curve = new THREE.CurvePath();
// curve.add( new THREE.LineCurve3( v1, v2 ) );
// // curve.add( new THREE.QuadraticBezierCurve3( v2, vc1, v3 ) );
// curve.add( new THREE.LineCurve3( v3, v1 ) );

const v1 = new THREE.Vector3(-5, 0, 0);
const v2 = new THREE.Vector3(0, 0, 3);
const v3 = new THREE.Vector3(3, 0, 0);
const v4 = new THREE.Vector3(-2, 0, -3);

// const v1 = new THREE.Vector3(-5, 0, 0);
// const v2 = new THREE.Vector3(0, 0, 5);
// const v3 = new THREE.Vector3(5, 0, 0);
// const v4 = new THREE.Vector3(0, 0, -5);
const vc1 = v2
  .clone()
  .lerp(v3, 0.5)
  .add(new THREE.Vector3(2, 0, 2));
const curve = new THREE.CurvePath();
curve.add(new THREE.LineCurve3(v1, v2));
curve.add(new THREE.LineCurve3(v2, v3))
curve.add(new THREE.QuadraticBezierCurve3(v2, vc1, v3));
curve.add(new THREE.LineCurve3(v3, v4));

let pts = 30
console.log(curve.getSpacedPoints(pts));

const points1 = new THREE.Points(
  new THREE.BufferGeometry().setFromPoints(curve.getSpacedPoints(pts)),
  new THREE.PointsMaterial({ size: 0.4, color: 0xff0000 }),
);
scene.add(points1);

function createDominos(
  count: number,
  dimensions: [number, number, number] = [1, 1, 1],
  textureUrl?: string,
): Domino[] {
  const [width, height, depth] = dimensions;
  const dominos: Domino[] = [];

  for (let i = 0; i < count; i++) {
    const domino = new Domino(width, height, depth);

    if (textureUrl) {
      domino.applyTexture(textureUrl);
    }

    dominos.push(domino);
    scene.add(domino.mesh); // Assuming `scene` is global
  }

  return dominos;
}

function arrangeObjects(
  objectsList: Domino[],
  curvePath: THREE.CurvePath<THREE.Vector3>,
) {
  const totalPoints = objectsList.length;
  const curve = curvePath.getSpacedPoints(totalPoints);
  
  for (let i = 0; i < totalPoints; i++) {
    const point = curve[i];
    const tangent = curvePath.getTangent(i / (totalPoints - 1)).normalize();
    // const yOffset = .5 // height / 2

    const domino = objectsList[i];
    const yOffset = domino.height / 2 // height / 2
    domino.setPosition(point.x, point.y, point.z);
    // domino.setPosition(point.x, yOffset + point.y, point.z);
    domino.setAnchor(point.x, point.y, point.z);
    // Align domino to face forward along the path
    const axis = new THREE.Vector3(0, 0, 1); // default forward direction
    const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, tangent);
    domino.mesh.setRotationFromQuaternion(quaternion);

    domino.updateOBB(); // if your class tracks collision
  }
}

// const dominos = createDominos(40, [0.3, 1, 0.1]);
const dominos = createDominos(pts, [0.3, 1.4, 0.1]);
arrangeObjects(dominos, curve);

// function updateDominoAnimation(dominos: Domino[]) {
//   for (let i = 0; i < dominos.length; i++) {
//     const current = dominos[i];

//     if (current.isAnimating && !current.hasFallen) {
//       current.rotate(Axis.X, 2);

//       // Check collision with next domino
//       const next = dominos[i + 1];
//       // if (next && current.collides(next)) {
//       if (next && current.collidesAABB(next)) {
//         next.isAnimating = true;
//       }
//     }
//   }
// }

function updateDominoAnimation(dominos: Domino[]) {
  for (let i = 0; i < dominos.length; i++) {
    const current = dominos[i];

    if (current.isAnimating && !current.hasFallen) {
      current.rotate(Axis.X, 2);

      // Check collisions with next 3 dominos
      for (let j = 1; j <= (dominos.length-1-i); j++) {
        const next = dominos[i + j];
        if (next && current.collidesAABB(next)) {
          next.isAnimating = true;
        }
      }
    }
  }
}



function render() {
  renderer.render(scene, camera);
  // renderer.render(scene, activeCamera);
}

dominos[0].isAnimating = true
function animate() {
  requestAnimationFrame(animate);
  // if (currentMode === 'follow') {
  //   const offsetRotated = followOffset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), followYaw);
  //   followCam.position.copy(followTarget.position).add(offsetRotated);
  //   followCam.lookAt(followTarget.position);
  // } else {
  //   trackballControls.update();
  // }

  dominos.forEach((domino) => {
    // domino.rotate(Axis.X, -2);
  });
  
  updateDominoAnimation(dominos);

  controls.update(); // Required if damping is enabled
  render();
}
animate();

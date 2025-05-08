import "./style.css";
import * as THREE from "three";
import { OBB } from "three/addons/math/OBB.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { setupLights } from "./lighting";
import { Domino, Axis } from "./Domino";
import { Ball } from "./Ball";

const showBB = false;
const planeSize = 40;
const repeats = planeSize / 2;
const boxes = [];
let pts = 30;

const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x222222)
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
const overheadCam = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const renderer = new THREE.WebGLRenderer();

const controls = new OrbitControls(overheadCam, renderer.domElement);
const trackballControls = new TrackballControls(
  camera,
  renderer.domElement,
);

console.log(trackballControls);

const clock = new THREE.Clock();

const loader = new THREE.TextureLoader();
const texture = loader.load("/textures/checker.png");
const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
const planeMat = new THREE.MeshPhongMaterial({
  map: texture,
  side: THREE.DoubleSide,
});
const planeMesh = new THREE.Mesh(planeGeo, planeMat);
const ballRadius = 0.3;
const ball = new Ball(ballRadius);

const lights = setupLights(scene);
const gui = new GUI();
const lightFolder = gui.addFolder("Lights");
const lightConfig = {
  "Point Light": true,
  "Spot Light": true,
  "Follower Spot Light": true,
};

const v1 = new THREE.Vector3(-5, 0, 0);
const v2 = new THREE.Vector3(0, 0, 3);
const v3 = new THREE.Vector3(3, 0, 0);
const v4 = new THREE.Vector3(-2, 0, -3);

console.log("vector", v1, v1[0]);
// const v1 = new THREE.Vector3(-5, 0, 0);
// const v2 = new THREE.Vector3(0, 0, 5);
// const v3 = new THREE.Vector3(5, 0, 0);
// const v4 = new THREE.Vector3(0, 0, -5);

const curve = setupCurve();
const dominos = createDominos(pts, [0.3, 1.4, 0.1], "/textures/woodgrain.jpg");

function init() {
  // camera.position.z = 7;
  // camera.position.z = 4;
  // camera.position.z = 0;
  // camera.position.y = 6;
  const a = curve.getPoint(0);
  const a2 = curve.getPoint(Math.min(0 + 0.1, 1)); // forward-looking point

  a.y = 4;
  camera.position.copy(a);
  camera.lookAt(a2);

  overheadCam.position.set(0, 4, 8);
  overheadCam.lookAt(0, 0, 0);

  trackballControls.noZoom = false;

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.repeat.set(repeats, repeats);

  lights.point.visible = lightConfig["Point Light"]; // Apply config to light
  lights.spot.visible = lightConfig["Spot Light"];
  spotlight.visible = lightConfig["Follower Spot Light"]

  lightFolder.add(lightConfig, "Point Light").onChange((val: boolean) => {
    lights.point.visible = val;
  });
  lightFolder.add(lightConfig, "Spot Light").onChange((val: boolean) => {
    lights.spot.visible = val;
  });
  lightFolder.add(lightConfig, "Follower Spot Light").onChange((val: boolean) => {
    spotlight.visible = val;
  });
  lightFolder.open();

  planeMesh.rotateX(Math.PI * -0.5);

  scene.add(planeMesh);
  scene.add(ball.mesh);

  document.body.appendChild(renderer.domElement);
  window.addEventListener("resize", onWindowResize, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setAnimationLoop(animate);

  controls.target.set(0, 0, 0);
  controls.update();

  trackballControls.update();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

function setupCurve() {
  const vc1 = v2
    .clone()
    .lerp(v3, 0.5)
    .add(new THREE.Vector3(2, 0, 2));
  const curve = new THREE.CurvePath();
  curve.add(new THREE.LineCurve3(v1, v2));
  curve.add(new THREE.LineCurve3(v2, v3));
  curve.add(new THREE.QuadraticBezierCurve3(v2, vc1, v3));
  curve.add(new THREE.LineCurve3(v3, v4));

  console.log(curve.getSpacedPoints(pts));

  const points1 = new THREE.Points(
    new THREE.BufferGeometry().setFromPoints(curve.getSpacedPoints(pts)),
    new THREE.PointsMaterial({ size: 0.4, color: 0xff0000 }),
  );
  scene.add(points1);

  return curve;
}

function createDominos(
  count: number,
  dimensions: [number, number, number] = [1, 1, 1],
  textureUrl?: string,
): Domino[] {
  const [width, height, depth] = dimensions;
  const dominos: Domino[] = [];

  let texture: THREE.Texture | undefined;
  if (textureUrl) {
    const loader = new THREE.TextureLoader();
    texture = loader.load(textureUrl);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
  }
  for (let i = 0; i < count; i++) {
    const domino = new Domino(width, height, depth);

    if (texture) {
      // console.log("Applying texture", texture);
      domino.applyTexture(texture);
    }

    dominos.push(domino);
    scene.add(domino.mesh); // Assuming `scene` is global
    if (showBB) {
      const box = new THREE.BoxHelper(domino.mesh, 0xffff00);
      boxes.push(box);
      scene.add(box);
    }
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
    const yOffset = domino.height / 2; // height / 2
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

function updateDominoAnimation(dominos: Domino[]) {
  for (let i = 0; i < dominos.length; i++) {
    const current = dominos[i];

    if (current.isAnimating && !current.hasFallen) {
      currentDominoInSpotlight = current;
      spotlight.target = current.mesh;
      current.rotate(Axis.X, 2);
      // current.updateOBB()
      if (showBB) boxes[i].update();

      // Check collisions with next 3 dominos
      for (let j = 1; j <= dominos.length - 1 - i; j++) {
        // let j = 1
        const next = dominos[i + j];
        // if (next && current.collides(next)) {
        if (next && current.collidesAABB(next)) {
          next.isAnimating = true;
          currentDominoInSpotlight = next;
          spotlight.target = next.mesh;
        }
      }
    }
  }
}

function render() {
  if (cameraMode === 'follow')
    renderer.render(scene, camera);
  else 
    renderer.render(scene, overheadCam);

  // renderer.render(scene, overheadCam);
  // renderer.render(scene, activeCamera);
}


const spotlight = new THREE.SpotLight(0x0000ff, 100); // Blue, full intensity
spotlight.angle = Math.PI / 8;
spotlight.penumbra = 0.2;
spotlight.decay = 2;
spotlight.distance = 13;
spotlight.position.set(0, 3, 0); // Above the scene

spotlight.castShadow = true;

const spotlightTarget = new THREE.Object3D();
scene.add(spotlightTarget);
// spotlight.target = spotlightTarget;
// spotlight.target = dominos[0].mesh;
// spotlight.target.position.set(0, 0, 0);


scene.add(spotlight);
scene.add(spotlight.target);

const helper = new THREE.SpotLightHelper(spotlight);
scene.add(helper);

// Optional: update each frame
// setInterval(() => {
//   helper.update();
// }, 16);


let currentDominoInSpotlight: Domino | null = null;

let cameraMode = 'overhead';
let cameraProgress = 0;
let isCameraAnimating = false;
const cameraSpeed = 0.001; // tweak as needed

ball.setPosition(-10, ballRadius, -2);
ball.setRotateDirection(v1);
const v11 = v1.clone();
v11.y = ballRadius;
ball.setMoveTarget(...v11);
// dominos[0].isAnimating = true;

init();
arrangeObjects(dominos, curve);

function animate() {
  const delta = clock.getDelta();

  if (!ball.collidesWith(dominos[0].mesh)) {
    ball.update(0.01);
  } else {
    dominos[0].isAnimating = true;
    if (!isCameraAnimating && cameraMode === 'follow') {
      isCameraAnimating = true;
      cameraProgress = 0;
    }
  }

  // Animate camera along curve if triggered
  if (isCameraAnimating && cameraProgress <= 1) {
    const a = curve.getPoint(cameraProgress);
    const a2 = curve.getPoint(Math.min(cameraProgress + 0.1, 1)); // forward-looking point

    a.y = 4;
    camera.position.copy(a);
    camera.lookAt(a2);
    cameraProgress += cameraSpeed;
  }

  updateDominoAnimation(dominos);
  if (currentDominoInSpotlight) {
    spotlightTarget.position.copy(currentDominoInSpotlight.mesh.position);
    helper.update();

    // spotlight.target = 
  }

  trackballControls.update();
  render();
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'c') {
    cameraMode = cameraMode === 'overhead' ? 'follow' : 'overhead';
    if (cameraMode === 'overhead') {
      isCameraAnimating = false;
    }
    // activeCamera = cameraMode === 'overhead' ? overheadCam : followCam;
    console.log(`Switched to ${cameraMode} camera.`);
 
  }
})

// function animate() {
//   // requestAnimationFrame(animate);
//   // if (currentMode === 'follow') {
//   //   const offsetRotated = followOffset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), followYaw);
//   //   followCam.position.copy(followTarget.position).add(offsetRotated);
//   //   followCam.lookAt(followTarget.position);
//   // } else {
//   //   trackballControls.update();
//   // }

//   // dominos.forEach((domino) => {
//   //   // domino.rotate(Axis.X, -2);
//   // });
//   const delta = clock.getDelta();
//   // ball.move(delta*.1);
//   if (!ball.collidesWith(dominos[0].mesh))
//     // ball.update(delta*.4)
//     ball.update(.01)
//   else
//     dominos[0].isAnimating = true;

//   updateDominoAnimation(dominos);
//   trackballControls.update();
//   // controls.update(); // Required if damping is enabled
//   render();
// }

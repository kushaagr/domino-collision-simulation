// dominoSetup.js
import * as THREE from "three";
import * as dat from "dat.gui";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import {
  gouradfragmentsrc,
  gouradvertexsrc,
  phongfragmentsrc,
  phongvertexsrc,
  blinngouraudvertexsrc,
  blinngouraudfragmentsrc,
  blinnphongvertexsrc,
  blinnphongfragmentsrc,
} from "./Shader_lib/shaders.js";

import { setupLights } from "./lighting";
import { Domino, Axis } from "./Domino";
import { Ball } from "./Ball";

let pts = 39;
// const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x222222)
// const renderer = new THREE.WebGLRenderer();

const c0v1 = new THREE.Vector3(-5, 0, 0);
const c0v2 = new THREE.Vector3(0, 0, 3);
const c0v3 = new THREE.Vector3(3, 0, 0);
const c0v4 = new THREE.Vector3(-2, 0, -3);

const c0vc1 = c0v2
  .clone()
  .lerp(c0v3, 0.5)
  .add(new THREE.Vector3(2, 0, 2));
const curve0 = new THREE.CurvePath();
curve0.add(new THREE.LineCurve3(c0v1, c0v2));
// curve0.add(new THREE.LineCurve3(c0v2, c0v3));
curve0.add(new THREE.QuadraticBezierCurve3(c0v2, c0vc1, c0v3));
curve0.add(new THREE.LineCurve3(c0v3, c0v4));

const c1v1 = new THREE.Vector3(-5, 0, 0);
const c1v2 = new THREE.Vector3(0, 0, 3);
const c1v3 = new THREE.Vector3(3, 0, 0);
const c1v4 = new THREE.Vector3(-2, 0, -3);

const vc1 = c1v2
  .clone()
  .lerp(c1v3, 0.5)
  .add(new THREE.Vector3(2, 0, 2));
const curve1 = new THREE.CurvePath();
curve1.add(new THREE.LineCurve3(c1v1, c1v2));
curve1.add(new THREE.LineCurve3(c1v2, c1v3));
curve1.add(new THREE.QuadraticBezierCurve3(c1v2, vc1, c1v3));
curve1.add(new THREE.LineCurve3(c1v3, c1v4));

const c2v1 = new THREE.Vector3(-2.12132034, 0, -2.12132034);
const c2v2 = new THREE.Vector3(0, 0, 0);
const c2v3 = new THREE.Vector3(0, 0, 2.82842712);
const c2v4 = new THREE.Vector3(2.82842712, 0, 0);
const c2v31 = new THREE.Vector3(-4.94974747, 0, 2.12132034);
const c2v41 = new THREE.Vector3(2.12132034, 0, -4.94974747);

const curve2 = new THREE.CurvePath();
curve2.add(new THREE.LineCurve3(c2v1, c2v2));
curve2.add(new THREE.LineCurve3(c2v2, c2v3));
curve2.add(new THREE.LineCurve3(c2v2, c2v4));
curve2.add(new THREE.LineCurve3(c2v3, c2v31));
curve2.add(new THREE.LineCurve3(c2v4, c2v41));

const c3v1 = new THREE.Vector3(0, 0, 3);
const c3v2 = new THREE.Vector3(0, 0, 0);
const c3v3 = new THREE.Vector3(2, 0, -2);
const c3v4 = new THREE.Vector3(-2, 0, -2);
const c3v31 = new THREE.Vector3(5, 0, 2);
const c3v41 = new THREE.Vector3(-5, 0, 2);

const curve3 = new THREE.CurvePath();
curve3.add(new THREE.LineCurve3(c3v1, c3v2));
curve3.add(new THREE.LineCurve3(c3v2, c3v3));
curve3.add(new THREE.LineCurve3(c3v2, c3v4));
curve3.add(new THREE.LineCurve3(c3v3, c3v31));
curve3.add(new THREE.LineCurve3(c3v4, c3v41));

const curvePaths = [
  curve0,
  curve1,
  curve2,
  // curve3
];

// console.log(curve.getSpacedPoints(pts));

// const points1 = new THREE.Points(
//   new THREE.BufferGeometry().setFromPoints(curve.getSpacedPoints(pts)),
//   new THREE.PointsMaterial({ size: 0.4, color: 0xff0000 }),
// );
// scene.add(points1);

// dominoSetup(curve, scene, renderer)

// Initialize scene and renderer
const gui = new GUI();
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let currentCurveIndex = 0;

// GUI setup
const config = {
  curveSetupIndex: 0,
};

const savedGui = gui
  .add(config, "curveSetupIndex", 0, curvePaths.length - 1, 1)
  .name("Domino Path")
  .onChange((value: number) => {
    currentCurveIndex = value;
    dominoSetup(curvePaths[currentCurveIndex], scene, renderer, gui);
  })
  .save();

console.log(savedGui);

// Keybindings for switching setups
window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    currentCurveIndex =
      (currentCurveIndex - 1 + curvePaths.length) % curvePaths.length;
    config.curveSetupIndex = currentCurveIndex;
    gui.controllers[0].updateDisplay();
    // dominoSetup(curvePaths[currentCurveIndex], scene, renderer, gui.reset().load(savedGui));
    dominoSetup(curvePaths[currentCurveIndex], scene, renderer, new GUI());
  } else if (event.key === "ArrowRight") {
    currentCurveIndex = (currentCurveIndex + 1) % curvePaths.length;
    config.curveSetupIndex = currentCurveIndex;
    gui.controllers[0].updateDisplay();
    // dominoSetup(curvePaths[currentCurveIndex], scene, renderer, gui.reset().load(savedGui));
    dominoSetup(curvePaths[currentCurveIndex], scene, renderer, new GUI());
  }
});

window.addEventListener("load", () => {
  // Initialize with the first curve setup
  dominoSetup(curvePaths[0], scene, renderer, new GUI());
});
// dominoSetup(curvePaths[config.curveSetupIndex], scene, renderer, gui);

const lightPositions = [
  new THREE.Vector3(2, 2, 2),
  new THREE.Vector3(-1, 3, 0),
  new THREE.Vector3(-5, -5, 0),
];
const lightColors = [
  new THREE.Color(0xffffff),
  new THREE.Color(0xffffff),
  new THREE.Color(0xffffff),
];

const blinn_phong_gouraudMaterial = new THREE.ShaderMaterial({
  vertexShader: blinngouraudvertexsrc,
  fragmentShader: blinngouraudfragmentsrc,
  uniforms: {
    numLights: { value: 2 },
    lightPositions: { value: lightPositions },
    lightColors: { value: lightColors },
    diffuseColor: { value: new THREE.Color(0x555022) },
    specularColor: { value: new THREE.Color(0xf0f0ff) },
    ambientColor: { value: new THREE.Color(0, 1, 0) },
    shininess: { value: 50.0 },
  },
});

export function dominoSetup(curvePath, scene, renderer, gui, showBB = false) {
  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }

  const boxes = [];
  const dominos = createDominos(
    pts,
    [0.3, 1.4, 0.1],
    "/textures/woodgrain.jpg",
    // blinn_phong_gouraudMaterial
  );
  dominos.forEach((domino) => {
    scene.add(domino.mesh);
  });

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

  const controls = new OrbitControls(overheadCam, renderer.domElement);
  const trackballControls = new TrackballControls(camera, renderer.domElement);

  const ballRadius = 0.3;
  const ball = new Ball(ballRadius);

  const lights = setupLights(scene);

  const spotlight = new THREE.SpotLight(0x0000ff, 100);
  spotlight.angle = Math.PI / 8;
  spotlight.penumbra = 0.2;
  spotlight.decay = 2;
  spotlight.distance = 13;
  spotlight.position.set(0, 3, 0);
  spotlight.castShadow = true;
  const spotlightTarget = new THREE.Object3D();
  scene.add(spotlight);
  scene.add(spotlightTarget);
  scene.add(spotlight.target);
  const helper = new THREE.SpotLightHelper(spotlight);
  scene.add(helper);

  // const existingFolder = gui.folders.find((f) => f._title === "Lights");
  // if (existingFolder) {
  //   gui.removeFolder(existingFolder);
  // }

  // gui.reset()
  const lightFolder = gui.addFolder("Lights");
  const lightConfig = {
    "Point Light": true,
    "Spot Light": true,
    "Follower Spot Light": true,
  };

  lights.point.visible = lightConfig["Point Light"];
  lights.spot.visible = lightConfig["Spot Light"];
  spotlight.visible = lightConfig["Follower Spot Light"];

  lightFolder
    .add(lightConfig, "Point Light")
    .onChange((val) => (lights.point.visible = val));
  lightFolder
    .add(lightConfig, "Spot Light")
    .onChange((val) => (lights.spot.visible = val));
  lightFolder
    .add(lightConfig, "Follower Spot Light")
    .onChange((val) => (spotlight.visible = val));
  lightFolder.open();

  const clock = new THREE.Clock();
  const texture = new THREE.TextureLoader().load("/textures/checker.png");
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.repeat.set(20, 20);

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshPhongMaterial({ map: texture, side: THREE.DoubleSide }),
  );
  plane.rotateX(-Math.PI / 2);
  scene.add(plane);

  arrangeObjects(dominos, curvePath);

  scene.add(ball.mesh);
  document.body.appendChild(renderer.domElement);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  let currentDominoInSpotlight = null;
  let cameraMode = "overhead";
  let cameraProgress = 0;
  let isCameraAnimating = false;
  const cameraSpeed = 0.001;

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener("resize", onWindowResize);

  window.addEventListener("keydown", (e) => {
    if (e.key === "c") {
      cameraMode = cameraMode === "overhead" ? "follow" : "overhead";
      isCameraAnimating = cameraMode === "follow";
    }
  });

  const render = () => {
    if (cameraMode === "follow") renderer.render(scene, camera);
    else renderer.render(scene, overheadCam);
  };

  const animate = () => {
    const delta = clock.getDelta();

    if (!ball.collidesWith(dominos[0].mesh)) {
      ball.update(0.01);
    } else {
      dominos[0].isAnimating = true;
      if (!isCameraAnimating) {
        isCameraAnimating = true;
        cameraProgress = 0;
      }
    }

    if (isCameraAnimating && cameraProgress <= 1) {
      const a = curvePath.getPoint(cameraProgress);
      const a2 = curvePath.getPoint(Math.min(cameraProgress + 0.1, 1));
      a.y = 4;
      camera.position.copy(a);
      camera.lookAt(a2);
      cameraProgress += cameraSpeed;
    }

    for (let i = 0; i < dominos.length; i++) {
      const current = dominos[i];
      if (current.isAnimating && !current.hasFallen) {
        currentDominoInSpotlight = current;
        spotlight.target = current.mesh;
        current.rotate(Axis.X, 2);
        if (showBB) boxes[i].update();
        for (let j = 1; j <= dominos.length - 1 - i; j++) {
          const next = dominos[i + j];
          if (next && current.collidesAABB(next)) {
            next.isAnimating = true;
            currentDominoInSpotlight = next;
            spotlight.target = next.mesh;
          }
        }
      }
    }

    if (currentDominoInSpotlight) {
      spotlightTarget.position.copy(currentDominoInSpotlight.mesh.position);
      helper.update();
    }

    trackballControls.update();
    render();
  };

  const start = () => {
    const startPos = curvePath.getPoint(0).clone();
    startPos.y = ballRadius;
    ball.setPosition(-10, ballRadius, -2);
    ball.setRotateDirection(startPos);
    ball.setMoveTarget(...startPos);
    overheadCam.position.set(0, 4, 8);
    overheadCam.lookAt(0, 0, 0);
    renderer.setAnimationLoop(animate);
  };

  start();
}

function createDominos(count, dimensions = [1, 1, 1], textureUrl, material=null) {
  const [width, height, depth] = dimensions;
  const dominos = [];
  let texture;
  if (textureUrl) {
    texture = new THREE.TextureLoader().load(textureUrl);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
  }
  for (let i = 0; i < count; i++) {
    const domino = new Domino(width, height, depth);
    if (texture) domino.applyTexture(texture);
    if (material) {
      domino.updateMaterial(material);
    }
    dominos.push(domino);
  }
  return dominos;
}

function arrangeObjects(objects, curvePath) {
  const total = objects.length;
  const curve = curvePath.getSpacedPoints(total);
  for (let i = 0; i < total; i++) {
    const pt = curve[i];
    const tangent = curvePath.getTangent(i / (total - 1)).normalize();
    const obj = objects[i];
    const axis = new THREE.Vector3(0, 0, 1);
    const q = new THREE.Quaternion().setFromUnitVectors(axis, tangent);
    obj.setPosition(pt.x, pt.y, pt.z);
    obj.setAnchor(pt.x, pt.y, pt.z);
    obj.mesh.setRotationFromQuaternion(q);
    obj.updateOBB();
  }
}

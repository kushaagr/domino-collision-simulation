import * as THREE from 'three';

export function setupLights(scene: THREE.Scene) {
  const lights = {
    point: new THREE.PointLight(0xffffff, 150),
    spot: new THREE.SpotLight(0xaaaa00, 100),
  };

  // Point Light
  lights.point.position.set(0, 10, 0);
  scene.add(lights.point);

  // Spot Light
  lights.spot.position.set(3, 5, 0);
  lights.spot.angle = Math.PI / 6;
  lights.spot.penumbra = 0.2;
  lights.spot.decay = 2;
  lights.spot.distance = 100;
  lights.spot.castShadow = true;
  lights.spot.shadow.mapSize.set(1024, 1024);
  lights.spot.shadow.camera.near = 1;
  lights.spot.shadow.camera.far = 100;

  // Spot target
  lights.spot.target.position.set(0, 0, 0);
  scene.add(lights.spot.target);
  scene.add(lights.spot);

  return lights;
}

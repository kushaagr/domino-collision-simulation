import * as THREE from "three";

export class Ball {
  mesh: THREE.Mesh;
  private startPosition: THREE.Vector3;
  private targetPosition: THREE.Vector3 | null = null;
  private moveTime = 0;
  private duration = 1; // seconds to reach the target
  private rotating = false;
  private rotationAxis = new THREE.Vector3();
  private rotationSpeed = 0.05; // radians per frame

  constructor(radius = 1, color = 0xff0000) {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    // const material = new THREE.MeshStandardMaterial({ color })
    const material = new THREE.MeshNormalMaterial({ wireframe: true });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.geometry.computeBoundingSphere();
    this.startPosition = this.mesh.position.clone();
    this.targetPosition = null;

    this.mesh.add(new THREE.AxesHelper(radius * 2));
  }

  setPosition(x: number, y: number, z: number) {
    this.mesh.position.set(x, y, z);
    this.startPosition = this.mesh.position.clone();
  }

  setMoveTarget(x: number, y: number, z: number, duration = 1) {
    this.startPosition = this.mesh.position.clone();
    this.targetPosition = new THREE.Vector3(x, y, z);
    this.moveTime = 0;
    this.duration = duration;
  }

  setRotateDirection(targetVec: THREE.Vector3) {
    const direction = targetVec.clone().sub(this.mesh.position).normalize();
    this.rotationAxis = new THREE.Vector3(0, 1, 0).cross(direction).normalize();
    this.rotating = true;
  }

  rotate() {
    if (!this.rotating) return;
    this.mesh.rotateOnAxis(this.rotationAxis, this.rotationSpeed);
  }

  move(delta: number) {
    if (!this.targetPosition) return;

    this.moveTime += delta;
    const t = Math.min(this.moveTime / this.duration, 1);

    // Ease-in-out cubic interpolation
    const easedT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const newPosition = new THREE.Vector3().lerpVectors(
      this.startPosition,
      this.targetPosition,
      easedT,
    );

    this.mesh.position.copy(newPosition);

    if (t >= 1) this.targetPosition = null; // Stop moving when done
  }

  update(delta: number) {
    this.move(delta);
    this.rotate();
  }

  collidesWith(otherMesh: THREE.Mesh): boolean {
    // Get the bounding sphere for the ball
    this.mesh.geometry.computeBoundingSphere();
    const sphere = this.mesh.geometry.boundingSphere!.clone();
    sphere.center.add(this.mesh.position);

    // Compute or get the AABB of the other mesh
    const box = new THREE.Box3().setFromObject(otherMesh);

    // Clamp sphere center to box to find closest point
    const closestPoint = new THREE.Vector3()
      .copy(sphere.center)
      .clamp(box.min, box.max);

    // Check if the distance from the sphere center to the closest point on the box is less than the radius
    const distanceSq = sphere.center.distanceToSquared(closestPoint);
    return distanceSq < sphere.radius * sphere.radius;
  }
}

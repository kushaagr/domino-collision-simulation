import * as THREE from "three";
import { OBB } from "three/addons/math/OBB.js";

export const Axis = Object.freeze({
  X: new THREE.Vector3(1, 0, 0),
  Y: new THREE.Vector3(0, 1, 0),
  Z: new THREE.Vector3(0, 0, 1),
});

export class Domino {
  mesh: THREE.Mesh;
  obb: OBB;
  anchor: THREE.Vector3;
  isAnimating: boolean = false;
  hasFallen: boolean = false;
  obbHelper: THREE.LineSegments | null = null; // 👈 OBB Helper
  private accumulatedRotation = 0;


  constructor(
    width: number,
    height: number,
    depth: number,
    color: number = 0xffffff,
  ) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshPhongMaterial({ color });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    this.width = width;
    this.height = height;
    this.depth = depth;
    this.anchor = new THREE.Vector3(0, 0, 0);

    this.mesh.geometry.computeBoundingBox();
    this.obb = new OBB().fromBox3(this.mesh.geometry.boundingBox as THREE.Box3);
    this.updateOBB();

    // this.createOBBHelper(); // Create OBB visualization
  }

  setAnchor(x: number, y: number, z: number) {
    this.anchor.set(x, y, z);
  }

  setPosition(x: number, y: number, z: number) {
    this.mesh.position.set(x, y, z);
    this.updateOBB();
  }

  applyTexture(textureUrl: string) {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(textureUrl);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshPhongMaterial({ map: texture });
    this.mesh.material = material;
  }

  // rotate(axis = new THREE.Vector3(0, 1, 0), degrees = 1) {
  //   const radians = THREE.MathUtils.degToRad(degrees);
  //   rotateAboutPoint(this.mesh, this.anchor, axis, radians);
  //   this.updateOBB();
  // }

  // rotate(axis: THREE.Vector3 = Axis.Y, degrees = 1) {
  //   const radians = THREE.MathUtils.degToRad(degrees);
  //   rotateAboutPoint(this.mesh, this.anchor, axis, radians);
  //   this.updateOBB();
  // }

  rotate(axis: THREE.Vector3 = Axis.Y, degrees = 1) {
    if (this.hasFallen) return;

    const radians = THREE.MathUtils.degToRad(degrees);
    this.mesh.rotateOnAxis(axis, radians); // This rotates around local axis
    this.updateOBB();

    // Check if fallen past tipping point
    // if (this.mesh.rotation.x <= -Math.PI / 2) {
    // if (this.mesh.rotation.x >= Math.PI / 2) {
    //   this.hasFallen = true;
    //   this.isAnimating = false;

    //   // Optional: visually indicate fallen state
    //   (this.mesh.material as THREE.MeshPhongMaterial).color.set(0xff0000); // red
    // }
    // Accumulate total rotation if rotating around tipping axis
    if (axis.equals(Axis.X)) {
      this.accumulatedRotation += Math.abs(radians);
    }

    // Check if domino has tipped over
    if (this.accumulatedRotation >= Math.PI / 2) {
      this.hasFallen = true;
      this.isAnimating = false;
      (this.mesh.material as THREE.MeshPhongMaterial).color.set(0xff0000); // red
    }

  }

  // rotate(axis: THREE.Vector3 = Axis.Y, degrees = 1, anchor?: THREE.Vector3) {
  //   const radians = THREE.MathUtils.degToRad(degrees);
  //   const pivot = anchor ?? this.anchor;

  //   // World position of the anchor point
  //   const worldPivot = pivot.clone().applyMatrix4(this.mesh.matrixWorld);

  //   rotateAboutPoint(this.mesh, worldPivot, axis, radians, true); // anchor is in world space
  //   this.updateOBB();
  // }

  collides(other: Domino): boolean {
    return this.obb.intersectsOBB(other.obb);
  }

  collidesAABB(other: Domino): boolean {
    const aBox = new THREE.Box3().setFromObject(this.mesh);
    const bBox = new THREE.Box3().setFromObject(other.mesh);
    return aBox.intersectsBox(bBox);
  }


  /*
  updateOBB() {
    // this.obb = new OBB();
    if (!this.mesh.geometry.boundingBox) {
      this.mesh.geometry.computeBoundingBox();
    }
    console.log(this.mesh.geometry.boundingBox);
    this.obb.copy(this.mesh.geometry.boundingBox);

    // console.log(this.mesh.geometry.obb);
    // this.obb.copy(this.mesh.geometry.boundingBox || new THREE.Box3().setFromObject(this.mesh));
    // this.obb.copy(this.mesh.geometry.boundingBox || new THREE.Box3().setFromObject(this.mesh));
    // this.obb.copy(this.mesh.geometry.obb)
    this.obb.applyMatrix4(this.mesh.matrixWorld)
    // this.obb.applyMatrix4(this.mesh.matrixWorld);
  }
  */

  updateOBB() {
    if (!this.mesh.geometry.boundingBox) {
      this.mesh.geometry.computeBoundingBox();
    }
    this.obb.fromBox3(this.mesh.geometry.boundingBox as THREE.Box3);
    this.obb.applyMatrix4(this.mesh.matrixWorld);

    // Update the OBB Helper position and orientation
    if (this.obbHelper) {
      this.obbHelper.position.copy(this.obb.center);
      this.obbHelper.rotation.setFromRotationMatrix(this.mesh.matrixWorld);
    }
  }

  createOBBHelper() {
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];

    const halfSize = this.obb.halfSize;
    const center = this.obb.center.clone();
    const rotation = this.obb.rotation;

    const axes = [
      new THREE.Vector3(1, 0, 0)
        .applyMatrix3(rotation)
        .multiplyScalar(halfSize.x),
      new THREE.Vector3(0, 1, 0)
        .applyMatrix3(rotation)
        .multiplyScalar(halfSize.y),
      new THREE.Vector3(0, 0, 1)
        .applyMatrix3(rotation)
        .multiplyScalar(halfSize.z),
    ];

    // 8 corners of the box
    const corners: THREE.Vector3[] = [];
    for (let dx of [-1, 1]) {
      for (let dy of [-1, 1]) {
        for (let dz of [-1, 1]) {
          const corner = center
            .clone()
            .add(axes[0].clone().multiplyScalar(dx))
            .add(axes[1].clone().multiplyScalar(dy))
            .add(axes[2].clone().multiplyScalar(dz));
          corners.push(corner);
        }
      }
    }

    // Define the edges between corners
    const edgeIndices = [
      [0, 1],
      [1, 3],
      [3, 2],
      [2, 0], // bottom face
      [4, 5],
      [5, 7],
      [7, 6],
      [6, 4], // top face
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7], // verticals
    ];

    for (const [i1, i2] of edgeIndices) {
      vertices.push(
        corners[i1].x,
        corners[i1].y,
        corners[i1].z,
        corners[i2].x,
        corners[i2].y,
        corners[i2].z,
      );
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    const line = new THREE.LineSegments(geometry, material);
    this.obbHelper = line;
    this.mesh.add(this.obbHelper); // or scene.add(this.obbHelper) for world-aligned
  }

  addToScene(scene: THREE.Scene) {
    scene.add(this.mesh);
  }
}

export function rotateAboutPoint(
  obj: THREE.Object3D,
  point: THREE.Vector3,
  axis: THREE.Vector3,
  theta: number,
  pointIsWorld = false,
) {
  if (pointIsWorld) {
    obj.parent?.localToWorld(obj.position);
  }

  obj.position.sub(point);
  obj.position.applyAxisAngle(axis, theta);
  obj.position.add(point);

  if (pointIsWorld) {
    obj.parent?.worldToLocal(obj.position);
  }

  // obj.rotateOnAxis(axis, theta);
  obj.rotateOnWorldAxis(axis, theta); // ensures rotation follows world axis, not object's local
}

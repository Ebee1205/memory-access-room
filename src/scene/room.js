import { ROOM_LAYOUT, sofaPlacement } from './layout.js';
import * as THREE from 'three';

const material = (color, options = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.86, metalness: 0.08, ...options });
const burgundy = material('#451e25');
const burgundyLight = material('#74343e');
const seam = material('#1e1519');
const walnut = material('#342621', { roughness: 0.48 });
const steel = material('#454744', { metalness: 0.75, roughness: 0.42 });
const dark = material('#131716', { roughness: 0.55 });
const red = material('#7f302e', { metalness: 0.34, roughness: 0.58 });
const silver = material('#b9b0a0', { metalness: 0.52 });

function box(parent, w, h, d, x, y, z, mat, bevel = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
function cylinder(parent, radius, height, x, y, z, mat, segments = 8) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments), mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}
function labelTexture(text, foreground = '#b9cebe', background = '#111a1b') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = '#687d72';
  ctx.strokeRect(8, 8, 496, 112);
  ctx.fillStyle = foreground;
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, 256, 78);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}
function setShadows(root) {
  root.traverse((child) => {
    if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
  });
}

function makeChair(x, z, rotation) {
  const chair = new THREE.Group();
  chair.position.set(x, 0, z);
  chair.rotation.y = rotation;
  box(chair, 1.52, 0.38, 1.24, 0, 0.72, 0.05, burgundy);
  box(chair, 1.42, 0.16, 1.08, 0, 0.98, 0.13, burgundyLight);
  const back = box(chair, 1.55, 1.75, 0.35, 0, 1.72, -0.59, burgundy);
  back.rotation.x = -0.08;
  box(chair, 1.23, 1.36, 0.1, 0, 1.68, -0.35, burgundyLight);
  for (const dx of [-0.67, 0.67]) {
    box(chair, 0.29, 0.66, 1.28, dx, 1.04, 0.0, burgundy);
    box(chair, 0.23, 0.11, 1.25, dx, 1.39, 0, burgundyLight);
  }
  for (const dx of [-0.55, 0.55]) for (const dz of [-0.47, 0.45]) {
    const leg = cylinder(chair, 0.075, 0.48, dx, 0.28, dz, walnut, 6);
    leg.rotation.z = dx * 0.15;
  }
  // Sparse deep-button pattern, intentionally faceted rather than detailed realism.
  for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 0), seam);
    b.position.set((col - 1) * 0.35 + (row % 2 ? 0.13 : 0), 1.33 + row * 0.37, -0.282);
    chair.add(b);
  }
  setShadows(chair);
  return chair;
}

function makeTelevision() {
  const root = new THREE.Group();
  root.position.set(ROOM_LAYOUT.tv.x, 0, ROOM_LAYOUT.tv.z);
  box(root, 2.32, 1.71, 0.95, 0, 1.33, 0, walnut);
  box(root, 2.18, 1.54, 0.11, 0, 1.37, 0.52, steel);
  box(root, 1.83, 1.23, 0.025, -0.09, 1.43, 0.59, dark);
  const screenLabel = new THREE.Mesh(new THREE.PlaneGeometry(1.69, 1.06), new THREE.MeshBasicMaterial({ map: labelTexture('MEMORY / 001'), toneMapped: false }));
  screenLabel.position.set(-0.09, 1.44, 0.611);
  root.add(screenLabel);
  box(root, 0.19, 1.25, 0.04, 1.02, 1.42, 0.59, walnut);
  for (const y of [1.62, 1.27]) {
    const knob = cylinder(root, 0.084, 0.04, 1.02, y, 0.65, silver, 10);
    knob.rotation.x = Math.PI / 2;
  }
  for (const x of [-0.86, 0.86]) {
    box(root, 0.18, 0.72, 0.18, x, 0.2, -0.1, steel);
  }
  const power = new THREE.PointLight(0x95c9a9, 2.0, 4.5, 2);
  power.position.set(0, 1.46, 0.85);
  root.add(power);
  setShadows(root);
  return { root, power };
}

function makePhoneBooth() {
  const root = new THREE.Group();
  root.position.set(ROOM_LAYOUT.phone.x, 0, ROOM_LAYOUT.phone.z);
  box(root, 1.48, 0.14, 1.36, 0, 0.09, 0, steel);
  box(root, 1.6, 0.18, 1.5, 0, 3.14, 0, red);
  for (const x of [-0.68, 0.68]) for (const z of [-0.61, 0.61]) box(root, 0.14, 3.1, 0.14, x, 1.62, z, red);
  for (const side of [-1, 1]) {
    const glass = box(root, 0.018, 2.32, 1.11, side * 0.675, 1.65, 0, material('#98a3a0', { transparent: true, opacity: 0.21, depthWrite: false, metalness: 0.15 }));
    glass.castShadow = false;
  }
  box(root, 1.26, 0.65, 0.10, 0, 1.52, -0.52, steel);
  box(root, 0.34, 0.52, 0.17, 0.0, 1.58, -0.42, dark);
  const receiver = cylinder(root, 0.12, 0.52, 0.11, 1.80, -0.25, red, 8);
  receiver.rotation.z = Math.PI / 2;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.26, 0.32), new THREE.MeshBasicMaterial({ map: labelTexture('EXTERNAL LINE', '#fbdbcc', '#471a20'), toneMapped: false }));
  sign.position.set(0, 2.83, 0.70);
  root.add(sign);
  const lamp = new THREE.PointLight(0xd93f37, 1.3, 3.5, 2);
  lamp.position.set(0, 2.73, 0.4);
  root.add(lamp);
  setShadows(root);
  return { root, lamp };
}

function makePlayer() {
  const root = new THREE.Group();
  root.position.set(ROOM_LAYOUT.spawn.x, 0, ROOM_LAYOUT.spawn.z);
  const uniform = material('#252e31');
  const skin = material('#b7a69a');
  cylinder(root, 0.24, 0.62, 0, 0.87, 0, uniform, 6);
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.31, 0), skin);
  head.position.y = 1.39;
  head.castShadow = true;
  root.add(head);
  box(root, 0.23, 0.17, 0.27, 0, 1.57, -0.065, uniform);
  for (const x of [-0.15, 0.15]) {
    box(root, 0.15, 0.5, 0.15, x, 0.35, 0, uniform);
  }
  for (const x of [-0.29, 0.29]) {
    box(root, 0.12, 0.56, 0.12, x, 0.87, 0, uniform);
  }
  const marker = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.4, 24), new THREE.MeshBasicMaterial({ color: 0x8b3b3c, transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
  marker.rotation.x = -Math.PI / 2;
  marker.position.y = 0.025;
  root.add(marker);
  return root;
}

export function populateRoom(scene) {
  const television = makeTelevision();
  const booth = makePhoneBooth();
  const left = sofaPlacement('left');
  const right = sofaPlacement('right');
  const leftChair = makeChair(left.x, left.z, left.rotation);
  const rightChair = makeChair(right.x, right.z, right.rotation);
  const player = makePlayer();
  scene.add(television.root, booth.root, leftChair, rightChair, player);

  const interactables = [
    { id: 'tv', label: 'MEMORY ARCHIVE / TV', root: television.root, position: television.root.position, radius: ROOM_LAYOUT.tv.interactionRadius },
    { id: 'sofa', side: 'left', label: 'OBSERVATION / SOFA', root: leftChair, position: leftChair.position, radius: ROOM_LAYOUT.sofas.left.interactionRadius },
    { id: 'sofa', side: 'right', label: 'OBSERVATION / SOFA', root: rightChair, position: rightChair.position, radius: ROOM_LAYOUT.sofas.right.interactionRadius },
    { id: 'phone', label: 'EXTERNAL LINE / PHONE', root: booth.root, position: booth.root.position, radius: ROOM_LAYOUT.phone.interactionRadius },
  ];
  return {
    player,
    interactables,
    update(time) {
      television.power.intensity = 1.35 + 0.18 * Math.sin(time * 14) + 0.08 * Math.sin(time * 31);
      booth.lamp.intensity = 0.8 + 0.5 * (0.5 + 0.5 * Math.sin(time * 2.1));
    },
  };
}

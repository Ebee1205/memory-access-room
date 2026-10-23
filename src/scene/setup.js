import { ROOM_LAYOUT, seatPlacement } from './layout.js';
import * as THREE from 'three';

export function createScene(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#e9e9e5');
  scene.fog = new THREE.Fog('#e9e9e5', 22, 47);

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.55;
  renderer.domElement.className = 'scene-canvas';
  renderer.domElement.setAttribute('aria-label', '탐색 가능한 3D 방');
  container.appendChild(renderer.domElement);

  const camera = new THREE.OrthographicCamera(-10, 10, 7, -7, 0.1, 100);
  // Frontal elevated viewpoint: symmetric furniture, with the distant booth in frame.
  const overviewPosition = new THREE.Vector3(0, 13, 18);
  const overviewLook = new THREE.Vector3(0, 0.9, -0.85);
  camera.position.copy(overviewPosition);
  camera.lookAt(overviewLook);

  scene.add(new THREE.HemisphereLight(0xf6f8ff, 0x999791, 2.25));
  const key = new THREE.DirectionalLight(0xfff6ed, 3.8);
  key.position.set(-6, 13, 8);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -12;
  key.shadow.camera.right = 12;
  key.shadow.camera.top = 12;
  key.shadow.camera.bottom = -12;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 35;
  key.shadow.bias = -0.0002;
  scene.add(key);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(250, 250), new THREE.MeshStandardMaterial({ color: 0xe9e9e5, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const guide = new THREE.GridHelper(22, 22, 0xc7c9c7, 0xc7c9c7);
  guide.material.transparent = true;
  guide.material.opacity = 0.075;
  guide.position.y = 0.005;
  scene.add(guide);

  let pixelScale = 0.52;
  function resize() {
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    const aspect = width / height;
    const span = aspect < 0.95 ? 9.2 : 7.35;
    camera.left = -span * aspect;
    camera.right = span * aspect;
    camera.top = span;
    camera.bottom = -span;
    camera.updateProjectionMatrix();
    renderer.setSize(Math.round(width * pixelScale), Math.round(height * pixelScale), false);
    renderer.domElement.style.width = `${width}px`;
    renderer.domElement.style.height = `${height}px`;
  }
  window.addEventListener('resize', resize);
  resize();

  const desiredCameraPos = overviewPosition.clone();
  const desiredLook = overviewLook.clone();
  const cameraLook = overviewLook.clone();
  function setView(mode, side = 'left') {
    if (mode === 'seat') {
      const seat = seatPlacement(side);
      desiredCameraPos.set(seat.cameraX, 3.25, seat.cameraZ);
      desiredLook.set(ROOM_LAYOUT.tv.x, 1.55, ROOM_LAYOUT.tv.z);
    } else {
      desiredCameraPos.copy(overviewPosition);
      desiredLook.copy(overviewLook);
    }
  }
  function tickCamera(dt) {
    const smooth = 1 - Math.exp(-3.1 * dt);
    camera.position.lerp(desiredCameraPos, smooth);
    cameraLook.lerp(desiredLook, smooth);
    camera.lookAt(cameraLook);
  }
  function dispose() {
    window.removeEventListener('resize', resize);
    renderer.dispose();
    renderer.domElement.remove();
  }
  return { scene, renderer, camera, setView, tickCamera, dispose };
}

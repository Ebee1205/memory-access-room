import * as THREE from 'three';
import { createScene } from './scene/setup.js';
import { populateRoom } from './scene/room.js';
import { createController } from './game/controller.js';
import { createPanel } from './ui/panel.js';
import './styles/main.css';

const viewport = document.getElementById('viewport');
const prompt = document.getElementById('interaction-prompt');
const promptLabel = document.getElementById('interaction-label');
const statusLabel = document.getElementById('status-label');
const notice = document.getElementById('notice');

async function loadProfile() {
  const response = await fetch(`${import.meta.env.BASE_URL}data/profile.json`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Profile request failed (${response.status})`);
  return response.json();
}

function start(profile) {
  const stage = createScene(viewport);
  const room = populateRoom(stage.scene);
  const panel = createPanel(profile);
  const clock = new THREE.Clock();
  let controller;
  let noticeTimer;

  const showNotice = (message) => {
    notice.textContent = message;
    notice.hidden = false;
    window.clearTimeout(noticeTimer);
    noticeTimer = window.setTimeout(() => { notice.hidden = true; }, 2700);
  };
  const action = (id, item = null) => {
    if (id === 'sofa') {
      const next = !controller.seated;
      const side = item?.side ?? 'left';
      controller.setSeated(next, side);
      room.player.visible = !next; // Hide the standing mesh during observation mode.
      stage.setView(next ? 'seat' : 'overview', side);
      showNotice(next ? 'OBSERVATION MODE / PRESS E TO STAND' : 'EXPLORATION MODE');
    } else if (id === 'tv' || id === 'phone') {
      if (controller.seated) {
        controller.setSeated(false);
        room.player.visible = true;
        stage.setView('overview');
      }
      panel.open(id);
    }
  };
  controller = createController(room.player, room.interactables, {
    onAction: action,
    isLocked: () => panel.opened,
    onNearbyChange: (item) => {
      prompt.hidden = !item;
      if (item) promptLabel.textContent = item.label;
    },
  });
  for (const button of document.querySelectorAll('[data-open]')) {
    button.addEventListener('click', () => action(button.dataset.open));
  }
  // Allow clicking objects directly, including when the visitor uses a mouse instead of WASD.
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const roots = room.interactables.map((item) => item.root);
  function pickedItem(event) {
    const bounds = stage.renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    raycaster.setFromCamera(pointer, stage.camera);
    const hits = raycaster.intersectObjects(roots, true);
    for (const hit of hits) {
      let ancestor = hit.object;
      while (ancestor) {
        const item = room.interactables.find((candidate) => candidate.root === ancestor);
        if (item) return item;
        ancestor = ancestor.parent;
      }
    }
    return null;
  }
  stage.renderer.domElement.addEventListener('click', (event) => {
    if (panel.opened) return;
    const target = pickedItem(event);
    if (target) action(target.id, target);
  });
  stage.renderer.domElement.addEventListener('pointermove', (event) => {
    stage.renderer.domElement.style.cursor = pickedItem(event) ? 'pointer' : 'default';
  });

  statusLabel.textContent = profile.meta?.approved ? 'ARCHIVE ONLINE' : 'PROTOTYPE // SAMPLE CONTENT';
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    controller.update(dt);
    stage.tickCamera(dt);
    room.update(clock.elapsedTime);
    stage.renderer.render(stage.scene, stage.camera);
    requestAnimationFrame(frame);
  }
  frame();
}

loadProfile()
  .then(start)
  .catch((error) => {
    console.error(error);
    statusLabel.textContent = 'ARCHIVE UNAVAILABLE';
    notice.hidden = false;
    notice.textContent = '프로필 데이터를 읽지 못했어요. 개발 서버에서 접속 중인지 확인해 주세요.';
  });

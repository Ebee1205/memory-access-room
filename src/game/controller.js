import { ROOM_LAYOUT, COLLIDERS, seatPlacement } from '../scene/layout.js';

const SPEED = 3.05;

export function createController(player, interactables, { onAction, onNearbyChange, isLocked }) {
  const pressed = new Set();
  let seated = false;
  let nearest = null;
  let walkTime = 0;
  let seatedSide = 'left';
  const origin = { x: player.position.x, z: player.position.z };

  function getClosest() {
    let target = null;
    let closest = Infinity;
    for (const item of interactables) {
      const distance = Math.hypot(player.position.x - item.position.x, player.position.z - item.position.z);
      if (distance < item.radius && distance < closest) {
        closest = distance;
        target = item;
      }
    }
    return target;
  }
  function updateNearest() {
    const next = seated ? { id: 'sofa', side: seatedSide, label: 'STAND UP' } : getClosest();
    if (next?.id !== nearest?.id || next?.label !== nearest?.label) {
      nearest = next;
      onNearbyChange(next);
    }
  }
  function keydown(event) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
    if (event.code === 'KeyE' && !event.repeat && !isLocked()) {
      if (seated) onAction('sofa', { side: seatedSide });
      else if (nearest) onAction(nearest.id, nearest);
    }
    pressed.add(event.code);
  }
  function keyup(event) { pressed.delete(event.code); }
  function reset() { pressed.clear(); }
  window.addEventListener('keydown', keydown);
  window.addEventListener('keyup', keyup);
  window.addEventListener('blur', reset);

  function blocked(x, z) {
    return COLLIDERS.some((p) => Math.hypot(p.x - x, p.z - z) < p.collisionRadius);
  }
  function update(dt) {
    if (seated || isLocked()) { updateNearest(); return; }
    const dx = Number(pressed.has('KeyD') || pressed.has('ArrowRight')) - Number(pressed.has('KeyA') || pressed.has('ArrowLeft'));
    const dz = Number(pressed.has('KeyS') || pressed.has('ArrowDown')) - Number(pressed.has('KeyW') || pressed.has('ArrowUp'));
    const length = Math.hypot(dx, dz);
    if (length) {
      const moveX = (dx / length) * SPEED * dt;
      const moveZ = (dz / length) * SPEED * dt;
      const x = Math.min(ROOM_LAYOUT.limits.xMax, Math.max(ROOM_LAYOUT.limits.xMin, player.position.x + moveX));
      const z = Math.min(ROOM_LAYOUT.limits.zMax, Math.max(ROOM_LAYOUT.limits.zMin, player.position.z + moveZ));
      if (!blocked(x, player.position.z)) player.position.x = x;
      if (!blocked(player.position.x, z)) player.position.z = z;
      player.rotation.y = Math.atan2(-dx, -dz);
      walkTime += dt * 11;
      player.children[0].rotation.z = Math.sin(walkTime) * 0.035;
      player.position.y = Math.abs(Math.sin(walkTime)) * 0.025;
    } else {
      player.position.y = 0;
    }
    updateNearest();
  }
  function setSeated(value, side = 'left') {
    if (value && !seated) {
      origin.x = player.position.x;
      origin.z = player.position.z;
    }
    seated = value;
    if (value) {
      seatedSide = side === 'right' ? 'right' : 'left';
      const seat = seatPlacement(seatedSide);
      player.position.set(seat.x, 0.13, seat.z);
      player.rotation.y = seat.rotation;
    } else {
      player.position.set(origin.x, 0, origin.z);
    }
    reset();
    updateNearest();
  }
  updateNearest();
  return { update, setSeated, get seated() { return seated; }, dispose() {
    window.removeEventListener('keydown', keydown);
    window.removeEventListener('keyup', keyup);
    window.removeEventListener('blur', reset);
  } };
}

import { ROOM_LAYOUT, sofaPlacement, seatPlacement } from '../src/scene/layout.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createController } from '../src/game/controller.js';

function makeHarness() {
  const handlers = new Map();
  globalThis.window = {
    addEventListener(name, fn) { handlers.set(name, fn); },
    removeEventListener(name) { handlers.delete(name); },
  };
  const position = { x: 0, y: 0, z: 4.2, set(x, y, z) { Object.assign(this, { x, y, z }); } };
  const player = { position, rotation: { y: 0 }, children: [{ rotation: { z: 0 } }] };
  const interactables = [
    { id: 'tv', label: 'TV', position: ROOM_LAYOUT.tv, radius: ROOM_LAYOUT.tv.interactionRadius },
    { id: 'sofa', side: 'left', label: 'SOFA', position: ROOM_LAYOUT.sofas.left, radius: ROOM_LAYOUT.sofas.left.interactionRadius },
    { id: 'sofa', side: 'right', label: 'SOFA', position: ROOM_LAYOUT.sofas.right, radius: ROOM_LAYOUT.sofas.right.interactionRadius },
    { id: 'phone', label: 'PHONE', position: ROOM_LAYOUT.phone, radius: ROOM_LAYOUT.phone.interactionRadius },
  ];
  let locked = false;
  const actions = [];
  const nearby = [];
  const controller = createController(player, interactables, {
    onAction: (id, item) => actions.push({ id, side: item?.side ?? null }),
    onNearbyChange: (item) => nearby.push(item?.id ?? null),
    isLocked: () => locked,
  });
  const key = (type, code) => handlers.get(type)?.({ code, repeat: false, preventDefault() {} });
  return { controller, player, actions, nearby, key, setLocked(value) { locked = value; } };
}

test('W moves the visitor toward the TV and E selects it when nearby', () => {
  const h = makeHarness();
  h.key('keydown', 'KeyW');
  for (let i = 0; i < 28; i++) h.controller.update(0.05);
  h.key('keyup', 'KeyW');
  assert.ok(h.player.position.z < 4.2);
  assert.equal(h.nearby.at(-1), 'tv');
  h.key('keydown', 'KeyE');
  assert.deepEqual(h.actions, [{ id: 'tv', side: null }]);
  h.controller.dispose();
});

test('locked UI blocks movement and sofa mode toggles into stand up prompt', () => {
  const h = makeHarness();
  h.setLocked(true);
  h.key('keydown', 'KeyW');
  h.controller.update(0.05);
  assert.equal(h.player.position.z, 4.2);
  h.setLocked(false);
  h.controller.setSeated(true);
  assert.equal(h.controller.seated, true);
  h.key('keydown', 'KeyE');
  assert.deepEqual(h.actions, [{ id: 'sofa', side: 'left' }]);
  h.controller.setSeated(false);
  assert.equal(h.controller.seated, false);
  h.controller.dispose();
});


test('the sofas are mirrored and both directly face the centered television', () => {
  const left = sofaPlacement('left');
  const right = sofaPlacement('right');
  const tv = ROOM_LAYOUT.tv;
  assert.equal(tv.x, 0);
  assert.equal(left.x, -right.x);
  assert.equal(left.z, right.z);
  assert.ok(Math.abs(left.rotation + right.rotation) < 1e-10);
  for (const chair of [left, right]) {
    const tx = tv.x - chair.x;
    const tz = tv.z - chair.z;
    const length = Math.hypot(tx, tz);
    const facing = Math.sin(chair.rotation) * tx / length + Math.cos(chair.rotation) * tz / length;
    assert.ok(facing > 0.9999, 'sofa forward vector points at TV');
  }
});

test('phone booth is isolated from the seating area and both sofas are interactive', () => {
  for (const side of ['left', 'right']) {
    const chair = ROOM_LAYOUT.sofas[side];
    assert.ok(Math.hypot(chair.x - ROOM_LAYOUT.phone.x, chair.z - ROOM_LAYOUT.phone.z) > 7);
  }
  const h = makeHarness();
  const right = ROOM_LAYOUT.sofas.right;
  h.player.position.set(right.x, 0, right.z + 1.3);
  h.controller.update(0);
  assert.equal(h.nearby.at(-1), 'sofa');
  h.key('keydown', 'KeyE');
  assert.deepEqual(h.actions, [{ id: 'sofa', side: 'right' }]);
  h.controller.setSeated(true, 'right');
  const seat = seatPlacement('right');
  assert.ok(Math.abs(h.player.position.x - seat.x) < 1e-10);
  h.key('keydown', 'KeyE');
  assert.deepEqual(h.actions.at(-1), { id: 'sofa', side: 'right' });
  h.controller.setSeated(false);
  assert.equal(h.player.position.x, right.x);
  assert.equal(h.player.position.z, right.z + 1.3);
  h.controller.dispose();
});

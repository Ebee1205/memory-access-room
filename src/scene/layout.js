// World layout in XZ coordinates. +Z faces the visitor; the TV screen faces +Z.
// All movement, interaction and camera viewpoints share these placements.
export const ROOM_LAYOUT = Object.freeze({
  tv: Object.freeze({ x: 0, z: -2.4, collisionRadius: 1.24, interactionRadius: 2.65 }),
  sofas: Object.freeze({
    left: Object.freeze({ x: -2.7, z: 1.2, collisionRadius: 1.12, interactionRadius: 2.15 }),
    right: Object.freeze({ x: 2.7, z: 1.2, collisionRadius: 1.12, interactionRadius: 2.15 }),
  }),
  phone: Object.freeze({ x: 7.3, z: -5.3, collisionRadius: 1.02, interactionRadius: 2.2 }),
  spawn: Object.freeze({ x: 0, z: 4.2 }),
  limits: Object.freeze({ xMin: -9.0, xMax: 9.0, zMin: -8.0, zMax: 6.5 }),
});

export function sofaPlacement(side = 'left') {
  const name = side === 'right' ? 'right' : 'left';
  const sofa = ROOM_LAYOUT.sofas[name];
  const tv = ROOM_LAYOUT.tv;
  // The chair is modelled facing its local +Z axis.
  const rotation = Math.atan2(tv.x - sofa.x, tv.z - sofa.z);
  return { ...sofa, rotation, side: name };
}

export function seatPlacement(side = 'left') {
  const sofa = sofaPlacement(side);
  return {
    x: sofa.x + Math.sin(sofa.rotation) * 0.12,
    z: sofa.z + Math.cos(sofa.rotation) * 0.12,
    rotation: sofa.rotation - Math.PI, // The avatar faces local -Z.
    cameraX: sofa.x - Math.sin(sofa.rotation) * 1.6,
    cameraZ: sofa.z - Math.cos(sofa.rotation) * 1.6,
  };
}

export const COLLIDERS = Object.freeze([
  ROOM_LAYOUT.tv, ROOM_LAYOUT.sofas.left,
  ROOM_LAYOUT.sofas.right, ROOM_LAYOUT.phone,
]);

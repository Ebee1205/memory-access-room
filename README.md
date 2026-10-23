# Memory Access Room

A small interactive 3D portfolio built with **Three.js + HTML/CSS + Vite**. Inspired by an infinite white interview room and retro sci-fi pixel-rendering aesthetics. No copyrighted game assets are included.

## Run locally

```bash
npm install
npm run dev
```

Build / verify:

```bash
npm run build
npm run preview
```

## Controls

- **WASD / arrow keys** — move the visitor character
- **E** — interact with nearby TV, either sofa or telephone booth
- **Mouse click** — interact with an object directly
- **Esc** — close a panel
- **Top-right links** — accessible alternative for opening the TV and contact panels

The TV shows a public profile in several archive channels. The sofa switches the camera to an observation viewpoint; the phone booth opens outgoing contact links.

## Project structure

```text
index.html                # HTML overlay / HUD
src/main.js               # 3D app bootstrap
src/scene/setup.js        # camera, lighting, pixel-rendered canvas
src/scene/room.js         # procedural low-poly furniture and visitor
src/scene/layout.js       # centralized furniture placement, facing and collision data
src/game/controller.js    # keyboard movement and proximity checks
src/ui/panel.js           # TV archive and contact DOM panels
src/styles/main.css       # sci-fi/CRT-inspired interface
public/data/profile.json # static, public and explicitly unapproved sample
scripts/validate-profile.mjs
.github/workflows/deploy.yml
```

## Knowledge / LLM integration (later)

The 3D site is deliberately static and makes **no runtime LLM API calls**. A separate `daiquery` generator can transform the private knowledge repository into a **reviewed** `public/data/profile.json` containing only public information.

1. Generate public candidate JSON from an allowlisted subset of private knowledge.
2. Validate with `npm run validate:profile`.
3. Review the generated diff and explicitly approve it before merging/publishing.
4. Deploy the updated static site.

Never publish the original journal, private knowledge repo, access tokens, prompt secrets, or unreviewed generations. The example JSON is marked `approved: false` and rendered as prototype content.

## Deploy

This repo includes a GitHub Pages Actions workflow. In **Settings → Pages → Build and deployment**, select **GitHub Actions**. The workflow builds the Vite app for the repo path using the relative `base: './'` setting. Any first deployment requires enabling Pages in repository settings.

## Roadmap

- [x] Infinite white floor, two sofas, television, phone booth, low-poly visitor
- [x] Keyboard movement, distance-based actions and mouse picking
- [x] TV archive and phone contact panels
- [x] Public JSON schema validation
- [ ] Replace procedural meshes with original/licensed GLB models (optional)
- [ ] Expand mobile touch movement and character animation
- [ ] Approved `daiquery` export workflow and content review
- [ ] Refine TV display effects and ambient sound (respect reduced motion)

## Scene layout

Inspired by the furniture arrangement of [pazdera/matrix-vr](https://github.com/pazdera/matrix-vr), but adjusted to a symmetrical interview composition. The television faces the spawn at the center, both sofas have mirrored X coordinates and dynamically rotate to look toward the TV, and the telephone booth is isolated further away.

All editable locations and interaction radii live in `src/scene/layout.js`; changes automatically propagate to player collision, sofa seating and camera targets.

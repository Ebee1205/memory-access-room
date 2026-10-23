# Architecture and scope

## Objective

Memory Access Room is a **static client** for publicly approved interpretation of a personal knowledge archive. The game world and knowledge generation system must be independently deployable.

## Current flow

1. `main.js` fetches `public/data/profile.json` at startup.
2. Three.js renders a white void with procedural TV, two chairs, phone booth, and visitor.
3. `controller.js` manages movement and reports the closest interactable.
4. `Raycaster` allows direct pointer selection; the `E` key works near objects.
5. UI content is rendered with DOM `textContent` rather than injecting generated HTML. Links are restricted to `https://` and `mailto:`.
6. Camera changes for sofa observation mode. No collision/physics engine is needed for MVP.

## Public content contract

```json
{
  "meta": { "schemaVersion": 1, "generatedAt": null, "generator": "manual-placeholder", "approved": false, "visibility": "public" },
  "channels": [
    {
      "id": "about", "label": "IDENTITY", "title": "TITLE", "summary": "SUMMARY",
      "entries": [{ "heading": "SECTION", "body": "PLAIN TEXT", "tags": ["OPTIONAL"], "link": { "label": "OPTIONAL", "href": "https://example.com" } }]
    }
  ],
  "contacts": [{ "label": "GITHUB", "description": "MY PROFILE", "href": "https://github.com/..." }]
}
```

The browser must not call a language model or read private repositories. This first release provides **no live AI chat**. The upstream generator should use explicit allowlists, schema validation, and human approval before opening a PR with updated public JSON. `meta.approved` is only a display indicator; **never rely on it for access control**.

## Design constraints

- Minimal dependencies; no React, state manager, physics engine or server.
- Keep the room static and recognizable as a memory access lobby.
- Keep long text in a high-contrast HTML overlay; do not put paragraphs inside low-resolution WebGL textures.
- Pointer clicks and direct-navigation buttons must work even if keyboard exploration is unavailable.
- The initial sofa, phone booth, TV and character are **code-generated placeholders** and can be swapped for properly licensed GLB assets later.
- The `public` folder must contain only material that is safe for anyone to download.

## Later integration

Use a separate workflow in the private knowledge / generator repo to produce a candidate JSON. Review changes in a PR against this public frontend repo. Once merged, GitHub Pages deployment publishes the new archive. Avoid pushing unreviewed generated responses from the private repo directly to `main`.

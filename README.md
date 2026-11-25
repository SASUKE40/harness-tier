# harness-tier

Interactive, draggable AI coding harness tier list built with React, TypeScript, Vite, and `@dnd-kit`.

## Features

- Drag and drop harnesses across tiers (including empty tiers) and reorder within any tier using pointer, touch, or keyboard controls
- Automatic persistence in `localStorage` across page reloads
- Toggle numeric scores on or off
- Export the tier board as a high-resolution PNG image
- Optional Unranked tray and Add Custom Harness modal (with URL, file upload, or generated monogram icons)
- Reset to default placements at any time
- Relative asset paths (`base: './'`) for static hosting anywhere (including GitHub Pages)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run typecheck
npm run build
npm run preview
```

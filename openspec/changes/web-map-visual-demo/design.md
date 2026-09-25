# Design

## Context

The web app is one React 19/Vite screen with plain CSS and no router, map package, or shared UI components. The API only exposes a health endpoint. See `proposal.md` for the reason to build this browser-only preview and `specs/web-map-visual-demo/spec.md` for the behavior contract.

## Goals / Non-Goals

**Goals:** Use a small, consistent component set; make image calibration and map interactions understandable; preserve demo configuration in the same browser; keep mock behavior visibly distinct from live device reporting.

**Non-Goals:** An API client, operator authentication, device commands, server persistence, map tiles, coordinate reprojection, or a product database schema.

## Decisions

### UI composition and design rules

- Add Tailwind CSS through its Vite plugin and define a compact theme in the CSS entry point. Keep custom CSS for the map transform, marker glow, and a few interaction details. Use the existing system font stack and tabular numerals for timestamps and coordinates.
- Use a restrained palette: deep slate for the navigation rail and headings, off-white canvas, white surfaces, muted slate text, and teal for active controls and device markers. Reserve amber/red for stale or invalid states. Use consistent 4/8 px spacing increments, 8-12 px corner radii, clear 1 px borders, and shadows only where panels need separation.
- Use one app shell with a left navigation sidebar, shared page header, form field, button, status badge, and panel patterns. Split the map, settings form, marker, tooltip, and device panel into components only where they own a distinct interaction or repeat styling. Avoid a generic UI framework.
- Use semantic navigation, form labels, button elements for markers and actions, visible focus rings, keyboard accessible zoom and panel dismissal, and `prefers-reduced-motion` for glow or transition effects. Hover summaries also appear on focus. At narrow widths, compact the left sidebar and display the detail panel as an overlay with a close button.
- Use two hash routes (`#/map` and `#/settings`) so direct links and browser back work without a routing dependency. The detail panel remains part of Map, not a third page.

### Background settings and storage

- Package a simple synthetic SVG map and sample bounds so the first visit has a usable visual demo. Save one uploaded image `Blob` plus bounds and interval in IndexedDB, which supports binary files without base64 size inflation. Keep the last valid values in React state until a new save succeeds. Show a storage error if a browser blocks or exhausts local storage.
- Accept PNG, JPEG, WebP, and SVG by type and verify the file decodes as an image before saving. Render SVG only through an image element and object URL; never inject its markup into the DOM. Revoke replaced object URLs. Bounds must be finite, latitude within -90 to 90, longitude within -180 to 180, north greater than south, and east greater than west. A rectangle crossing the antimeridian is outside this demo's bounds model.
- Keep settings browser-local. Production storage and propagation of the global upload interval remain governed by the existing tracking spec, not by this preview.

### Map geometry and interaction

- Render the image in one transformed layer with markers positioned as percentages of its natural rectangle: `x = (longitude - west) / (east - west)` and `y = (north - latitude) / (north - south)`. Altitude is displayed but does not affect marker placement. Filter out positions beyond `[0, 1]` and show their device names in a small outside-bounds list.
- Calculate fit scale from viewport and image dimensions with a 24 px margin, then allow zoom from fit to 8 times fit. Use pointer dragging, mouse wheel zoom, and visible zoom controls; touch users can drag and use the controls. Clamp translation after zoom, drag, resize, or image change: center an axis while its scaled image is smaller than the viewport, otherwise keep the image edge at or beyond the viewport edge. Image and markers share the same transform.
- Keep selected device ID in app state so updates always render the latest report in the detail panel. Close the panel when leaving Map.

### Mock data and updates

- Store a small fixed device set with realistic mock names, MAC and private IP values, initial reports, and a few history entries. Mark the map and refresh action as demo data. On an automatic tick, append a new nearby simulated report for each device. On force refresh, append one report for the selected device only. Keep a bounded recent history in memory for the demo and format dates in the browser's locale.
- The saved interval controls the simulated update timer while Map is mounted. Restart the timer when the interval changes; clean it up when leaving Map. React state changes update the map immediately, so no polling of the DOM or page reload is needed.

## Risks / Trade-offs

- **Linear latitude/longitude placement distorts large or rotated maps** → Label bounds calibration as a rectangular, north-up overlay; introduce control points or projection only with a later requirement.
- **Browser storage can be cleared or unavailable** → Keep the bundled sample usable and show a clear save error; no server persistence is implied.
- **Fast simulated intervals can grow history and trigger frequent renders** → Cap in-memory recent history and keep the supported interval at 1-3600 whole seconds.
- **Uploaded SVG can contain untrusted markup** → Decode and display it as an image resource only; do not insert SVG text into the document.

## Migration Plan

The change replaces the starter web screen and adds Tailwind build dependencies. Existing API, Android, database, and deployment services require no migration. Rollback is a web-only revert.

# Tasks

## 1. Demo shell and visual system

- [x] 1.1 Add Tailwind CSS with the Vite plugin, replace starter styles with the agreed color, spacing, type, focus, and responsive rules; verify `pnpm build` succeeds in `/workspace/web`.
- [x] 1.2 Build the shared shell with exactly Map and Settings hash routes and left navigation; verify direct links, active state, browser back, and narrow viewport access in the browser.
- [x] 1.3 Add the browser-only demo requirement to `docs/system-requirements.md` and describe the demo routes and mock-data boundary in `web/README.md`; verify both documents match the spec delta.

## 2. Settings and image calibration

- [x] 2.1 Add the sample background and bounds, plus browser-local storage for uploaded image, bounds, and interval; verify a saved configuration survives a reload.
- [x] 2.2 Build the Settings form with image decoding and geographic bound validation, preserving the last valid configuration on failure; verify supported formats save and invalid files or bounds show an error.
- [x] 2.3 Add focused checks for bounds, interval, and image validation; verify valid edges pass and invalid values fail.

## 3. Map and device inspection

- [x] 3.1 Implement image fit, bounded pan/zoom, resize handling, and geographic marker placement; verify the image fits with margin, stays reachable after drag/zoom, and maps all four bound corners correctly.
- [x] 3.2 Add mock devices, glowing markers, hover/focus summaries, and an outside-bounds device list; verify marker positions follow the image and out-of-bounds positions never appear beyond it.
- [x] 3.3 Add the right-side device detail panel with identity, latest report, location history, close behavior, and narrow-screen layout; verify mouse and keyboard selection show the correct current device details.
- [x] 3.4 Add a focused geometry check for coordinate conversion and pan clamping; verify corner positions and edge clamps.

## 4. Simulated updates and integration

- [x] 4.1 Refresh mock reports at the configured interval while Map is open and update one device on force refresh; verify timestamps, markers, and history change without reload and only the selected device changes on forced refresh.
- [x] 4.2 Verify the saved interval restarts the timer, leaving Map stops it, and demo labels remain visible; check the behavior in the browser and keep recent mock history bounded.
- [ ] 4.3 Run `cd /workspace/web && pnpm install --frozen-lockfile && pnpm build` in the development container, then check both pages, image reload, zoom/pan, keyboard marker access, and narrow layout in the browser; record any remaining limitations.

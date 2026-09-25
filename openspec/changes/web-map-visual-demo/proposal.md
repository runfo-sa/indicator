# Proposal

## Why

The web app is still a placeholder, so operators cannot review the intended map and settings experience. A browser-only visual demo will establish the two-page interface and coordinate behavior before device reporting and administration APIs exist.

## What Changes

- Replace the starter screen with a React and Tailwind CSS application shell with exactly two pages: Map and Settings, reached from a left sidebar.
- Let a user choose a map background image and calibrate it with north, south, east, and west geographic bounds.
- Show mock devices on a bounded, zoomable, pannable map, with hover or focus summaries and a right-side detail panel containing identity, latest position, history, and a simulated per-device refresh action.
- Let a user set one positive global location update interval; use it to drive simulated location updates in the demo.
- Keep demo settings and the uploaded image in the browser so the preview survives reloads. Clearly identify mock data and simulated actions in the UI.

## Capabilities

### New Capabilities

- `web-map-visual-demo`: Browser-only map and settings experience backed by mock device data.

### Modified Capabilities

None. The existing `device-location-tracking` requirements describe the eventual authenticated, server-backed system; this change adds a separate demo capability without weakening those requirements.

## Impact

- Web: replace `web/src/App.tsx` and its starter styles; add focused components, mock data, and browser-local settings storage.
- Dependencies: add Tailwind CSS with its Vite integration. No routing, map, or component library is required for two pages and a bounded image map.
- Documentation: align `docs/system-requirements.md` with the new demo requirement and explain demo behavior in `web/README.md`.
- API, Android, database, authentication, and deployment behavior remain outside this change.

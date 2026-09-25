# Indicator web demo

The React dashboard has two pages: **Map** and **Settings**. Use the left sidebar to switch between them. The Map page starts with the bundled floor plan (`/demo-map.png`) and eight mock devices; Settings lets you upload a PNG, JPEG, WebP, or SVG background, calibrate it with north/south/east/west bounds, and set the simulated update interval.

Settings are stored in IndexedDB in the current browser. Device reports, location history, and force refresh actions are mock behavior; this demo does not connect to the API or collect device locations.

From this directory, run `pnpm install --frozen-lockfile`, `pnpm dev`, or `pnpm build`. The development server listens on port 5173. pnpm waits 24 hours before resolving new releases, checks for a downgrade in package publishing trust, and blocks unreviewed dependency install scripts.

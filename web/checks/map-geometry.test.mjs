import assert from "node:assert/strict";
import test from "node:test";
import { clampView, fitView, projectLocation, zoomView } from "../src/map-geometry.ts";
import { supportedImage, validBounds, validInterval } from "../src/model.ts";

const bounds = { north: 10, south: -10, east: 20, west: -20 };
const viewport = { width: 1000, height: 800 };
const image = { width: 1400, height: 900 };

test("projects all four geographic bounds to image corners", () => {
  assert.deepEqual(projectLocation(10, -20, bounds), { x: 0, y: 0 });
  assert.deepEqual(projectLocation(10, 20, bounds), { x: 1, y: 0 });
  assert.deepEqual(projectLocation(-10, -20, bounds), { x: 0, y: 1 });
  assert.deepEqual(projectLocation(-10, 20, bounds), { x: 1, y: 1 });
  assert.equal(projectLocation(11, 0, bounds), null);
});

test("fits with margin and clamps panning to keep the image reachable", () => {
  const fit = fitView(viewport, image);
  assert.equal(fit.scale, 0.68);
  assert.ok(Math.abs(fit.x - 24) < 1e-9);
  assert.ok(Math.abs(fit.y - 94) < 1e-9);
  const zoomed = { scale: fit.scale * 2, x: -5000, y: 5000 };
  const clamped = clampView(zoomed, viewport, image, fit.scale, fit.scale * 8);
  assert.equal(clamped.scale, 1.36);
  assert.ok(Math.abs(clamped.x + 904) < 1e-9);
  assert.equal(clamped.y, 0);
});

test("zoom keeps the pointer anchor until map edges require clamping", () => {
  const fit = fitView(viewport, image);
  const zoomed = zoomView(fit, { x: 500, y: 400 }, 2, viewport, image, fit.scale);
  assert.equal(zoomed.scale, 1.36);
  assert.equal((500 - zoomed.x) / zoomed.scale, (500 - fit.x) / fit.scale);
  assert.equal((400 - zoomed.y) / zoomed.scale, (400 - fit.y) / fit.scale);
});

test("validates geographic bounds, update intervals, and image types", () => {
  assert.equal(validBounds(bounds), true);
  assert.equal(validBounds({ ...bounds, north: -10 }), false);
  assert.equal(validBounds({ ...bounds, east: 181 }), false);
  assert.equal(validInterval(1), true);
  assert.equal(validInterval(3600), true);
  assert.equal(validInterval(0), false);
  assert.equal(validInterval(1.5), false);
  assert.equal(supportedImage("plan.svg", "image/svg+xml"), true);
  assert.equal(supportedImage("plan.webp", ""), true);
  assert.equal(supportedImage("plan.gif", "image/gif"), false);
});

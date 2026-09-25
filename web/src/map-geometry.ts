export type Point = { x: number; y: number };
export type Size = { width: number; height: number };
export type View = { scale: number; x: number; y: number };

export function projectLocation(
  latitude: number,
  longitude: number,
  bounds: { north: number; south: number; east: number; west: number },
): Point | null {
  const x = (longitude - bounds.west) / (bounds.east - bounds.west);
  const y = (bounds.north - latitude) / (bounds.north - bounds.south);
  return x >= 0 && x <= 1 && y >= 0 && y <= 1 ? { x, y } : null;
}

export function fitView(viewport: Size, image: Size, margin = 24): View {
  const scale = Math.min((viewport.width - margin * 2) / image.width, (viewport.height - margin * 2) / image.height);
  return clampView(
    { scale, x: (viewport.width - image.width * scale) / 2, y: (viewport.height - image.height * scale) / 2 },
    viewport,
    image,
    scale,
    scale * 8,
  );
}

export function clampView(view: View, viewport: Size, image: Size, minScale: number, maxScale: number): View {
  const scale = Math.max(minScale, Math.min(maxScale, view.scale));
  const width = image.width * scale;
  const height = image.height * scale;
  const clampAxis = (position: number, content: number, available: number) =>
    content <= available ? (available - content) / 2 : Math.max(available - content, Math.min(0, position));
  return { scale, x: clampAxis(view.x, width, viewport.width), y: clampAxis(view.y, height, viewport.height) };
}

export function zoomView(view: View, anchor: Point, factor: number, viewport: Size, image: Size, minScale: number): View {
  const scale = Math.max(minScale, Math.min(minScale * 8, view.scale * factor));
  const ratio = scale / view.scale;
  return clampView(
    { scale, x: anchor.x - (anchor.x - view.x) * ratio, y: anchor.y - (anchor.y - view.y) * ratio },
    viewport,
    image,
    minScale,
    minScale * 8,
  );
}

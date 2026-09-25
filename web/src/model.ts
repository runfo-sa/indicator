export type Bounds = { north: number; south: number; east: number; west: number };
export type Report = { latitude: number; longitude: number; altitude?: number; time: string };
export type Device = { id: string; name: string; mac: string; ip: string; history: Report[] };
export type MapSettings = Bounds & { intervalSeconds: number; imageName: string; imageBlob?: Blob };

export const DEFAULT_SETTINGS: MapSettings = {
  north: -34.55,
  south: -34.66,
  east: -58.34,
  west: -58.47,
  intervalSeconds: 15,
  imageName: "Floor plan demo map",
};

export function validBounds(bounds: Bounds) {
  return Object.values(bounds).every(Number.isFinite)
    && bounds.north >= -90 && bounds.north <= 90
    && bounds.south >= -90 && bounds.south <= 90
    && bounds.east >= -180 && bounds.east <= 180
    && bounds.west >= -180 && bounds.west <= 180
    && bounds.north > bounds.south && bounds.east > bounds.west;
}

export function validInterval(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= 3600;
}

export function supportedImage(name: string, mimeType: string) {
  return ["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(mimeType)
    || /\.(png|jpe?g|webp|svg)$/i.test(name);
}

export const displayTime = (time: string) => new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium", timeStyle: "short",
}).format(new Date(time));

export const displayCoordinate = (value: number) => value.toFixed(5);

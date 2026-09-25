import type { Device, Report } from "./model";

const report = (latitude: number, longitude: number, minutesAgo: number, altitude: number): Report => ({
  latitude,
  longitude,
  altitude,
  time: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
});

export const MOCK_DEVICES: Device[] = [
  {
    id: "pixel-8a", name: "Pixel 8a · Front office", mac: "A4:5E:60:2C:91:07", ip: "192.168.1.24",
    history: [report(-34.576, -58.453, 18, 28), report(-34.575, -58.452, 9, 29), report(-34.574, -58.451, 0, 31)],
  },
  {
    id: "galaxy-a54", name: "Galaxy A54 · Workshop", mac: "D8:3A:DD:71:42:BC", ip: "192.168.1.37",
    history: [report(-34.583, -58.435, 25, 17), report(-34.582, -58.434, 12, 18), report(-34.581, -58.433, 0, 19)],
  },
  {
    id: "moto-g84", name: "Moto G84 · Operations", mac: "5C:AF:06:9B:10:3E", ip: "10.0.0.18",
    history: [report(-34.590, -58.418, 32, 42), report(-34.589, -58.417, 14, 43), report(-34.588, -58.416, 0, 44)],
  },
  {
    id: "nokia-x30", name: "Nokia X30 · Dispatch", mac: "2C:54:91:AA:67:13", ip: "192.168.1.52",
    history: [report(-34.608, -58.446, 16, 22), report(-34.607, -58.445, 0, 23)],
  },
  {
    id: "pixel-7a", name: "Pixel 7a · Storage", mac: "90:09:DF:35:81:2A", ip: "192.168.1.61",
    history: [report(-34.615, -58.422, 20, 14), report(-34.614, -58.421, 8, 15), report(-34.613, -58.420, 0, 16)],
  },
  {
    id: "galaxy-s23", name: "Galaxy S23 · Loading bay", mac: "64:BC:0C:72:18:9F", ip: "192.168.1.73",
    history: [report(-34.636, -58.453, 28, 7), report(-34.635, -58.452, 11, 8), report(-34.635, -58.451, 0, 8)],
  },
  {
    id: "moto-edge-40", name: "Moto Edge 40 · Inventory", mac: "F0:65:DD:44:29:10", ip: "10.0.0.29",
    history: [report(-34.642, -58.429, 23, 11), report(-34.641, -58.428, 10, 12), report(-34.640, -58.427, 0, 12)],
  },
  {
    id: "nokia-g60", name: "Nokia G60 · East wing", mac: "8C:7A:3D:91:54:06", ip: "192.168.1.88",
    history: [report(-34.613, -58.383, 19, 24), report(-34.612, -58.382, 7, 25), report(-34.611, -58.381, 0, 25)],
  },
];

export function nextMockReport(device: Device, tick: number): Device {
  const latest = device.history[device.history.length - 1];
  const angle = tick * 1.7 + device.id.length;
  const latitude = latest.latitude + Math.sin(angle) * 0.00008;
  const longitude = latest.longitude + Math.cos(angle) * 0.00008;
  const report: Report = {
    latitude,
    longitude,
    altitude: latest.altitude === undefined ? undefined : latest.altitude + Math.sin(angle / 2) * 0.4,
    time: new Date().toISOString(),
  };
  return { ...device, history: [...device.history.slice(-49), report] };
}

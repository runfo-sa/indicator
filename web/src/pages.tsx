import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { clampView, fitView, projectLocation, zoomView, type Size, type View } from "./map-geometry";
import { displayCoordinate, displayTime, supportedImage, validBounds, validInterval, type Device, type MapSettings } from "./model";

type MapPageProps = {
  settings: MapSettings;
  imageUrl: string;
  devices: Device[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  onRefresh: (id: string) => void;
};

function MapCanvas({ settings, imageUrl, devices, onSelect }: Pick<MapPageProps, "settings" | "imageUrl" | "devices" | "onSelect">) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<Size>({ width: 0, height: 0 });
  const [image, setImage] = useState<Size>({ width: 0, height: 0 });
  const [view, setView] = useState<View | null>(null);
  const drag = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const minScale = image.width && viewport.width ? Math.min((viewport.width - 48) / image.width, (viewport.height - 48) / image.height) : 1;

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setViewport({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setImage({ width: 0, height: 0 });
    setView(null);
  }, [imageUrl]);

  useEffect(() => {
    if (image.width && viewport.width && viewport.height) setView(fitView(viewport, image));
  }, [image, imageUrl, viewport]);

  const constrain = (next: View) => clampView(next, viewport, image, minScale, minScale * 8);
  const zoom = (factor: number, anchor: { x: number; y: number } = { x: viewport.width / 2, y: viewport.height / 2 }) => {
    setView(current => current && image.width ? zoomView(current, anchor, factor, viewport, image, minScale) : current);
  };

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    current.x = event.clientX;
    current.y = event.clientY;
    setView(value => value ? constrain({ ...value, x: value.x + dx, y: value.y + dy }) : value);
  };
  const stopDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId === event.pointerId) drag.current = null;
  };

  const placed = devices.flatMap(device => {
    const latest = device.history[device.history.length - 1];
    const point = projectLocation(latest.latitude, latest.longitude, settings);
    return point ? [{ device, latest, point }] : [];
  });
  const outside = devices.filter(device => {
    const latest = device.history[device.history.length - 1];
    return !projectLocation(latest.latitude, latest.longitude, settings);
  });

  return (
    <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-[#e9efed]" aria-label="Device map">
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-xl border border-white/80 bg-white/95 p-1.5 shadow-sm backdrop-blur">
        <button className="ui-transition grid size-9 place-items-center rounded-lg text-lg text-slate-700 hover:bg-slate-100 disabled:opacity-40" onClick={() => zoom(1 / 1.25)} disabled={!view || view.scale <= minScale * 1.001} aria-label="Zoom out">−</button>
        <span className="min-w-12 text-center text-xs font-semibold text-slate-500">{view ? `${Math.round((view.scale / minScale) * 100)}%` : "—"}</span>
        <button className="ui-transition grid size-9 place-items-center rounded-lg text-lg text-slate-700 hover:bg-slate-100 disabled:opacity-40" onClick={() => zoom(1.25)} disabled={!view || view.scale >= minScale * 7.99} aria-label="Zoom in">+</button>
        <span className="mx-1 h-6 w-px bg-slate-200" />
        <button className="ui-transition grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100" onClick={() => setView(image.width ? fitView(viewport, image) : null)} aria-label="Fit map to view">⌂</button>
      </div>
      <div className="absolute right-4 top-4 z-10 rounded-full border border-white/80 bg-white/95 px-3 py-2 text-[11px] font-bold uppercase tracking-[.12em] text-teal-800 shadow-sm">Mock data</div>
      <div
        ref={viewportRef}
        className="map-viewport relative flex-1 cursor-grab overflow-hidden active:cursor-grabbing"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        onWheel={event => {
          event.preventDefault();
          const rect = event.currentTarget.getBoundingClientRect();
          zoom(event.deltaY < 0 ? 1.12 : 1 / 1.12, { x: event.clientX - rect.left, y: event.clientY - rect.top });
        }}
      >
        <img className="hidden" src={imageUrl} alt="" aria-hidden="true" onLoad={event => setImage({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} />
        {image.width > 0 && view ? (
          <div
            className="absolute left-0 top-0"
            style={{ width: image.width, height: image.height, transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`, transformOrigin: "top left" }}
          >
            <img className="map-image h-full w-full" src={imageUrl} alt="Configured map background" draggable="false" />
            {placed.map(({ device, latest, point }) => (
              <button
                key={device.id}
                className="map-dot group grid size-10 place-items-center rounded-full focus-visible:z-10"
                style={{ "--x": `${point.x * 100}%`, "--y": `${point.y * 100}%`, "--inverse-scale": 1 / view.scale } as React.CSSProperties}
                onClick={() => onSelect(device.id)}
                aria-label={`${device.name}, last update ${displayTime(latest.time)}`}
                type="button"
              >
                <span className="map-dot-core" />
                <span className="map-dot-label hidden rounded-lg border border-slate-200 bg-white px-3 py-2 text-left shadow-xl group-hover:block group-focus:block">
                  <span className="block text-xs font-semibold text-slate-900">{device.name}</span>
                  <span className="mt-0.5 block text-[11px] text-slate-500">Updated {displayTime(latest.time)}</span>
                </span>
              </button>
            ))}
          </div>
        ) : <div className="absolute inset-0 grid place-items-center text-sm text-slate-500">Loading map…</div>}
      </div>
      <div className="flex min-h-11 items-center justify-between gap-3 border-t border-white/80 bg-white/90 px-4 text-xs text-slate-500">
        <span>{placed.length} devices in bounds</span>
        <span className="hidden sm:inline">Drag to pan · Scroll or use + / − to zoom</span>
        {outside.length > 0 && <span className="truncate text-amber-700" title={outside.map(device => device.name).join(", ")}>{outside.length} outside bounds: {outside.map(device => device.name).join(", ")}</span>}
      </div>
    </section>
  );
}

function DevicePanel({ device, onClose, onRefresh }: { device: Device; onClose: () => void; onRefresh: () => void }) {
  const latest = device.history[device.history.length - 1];
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);
  return (
    <aside className="map-detail-panel map-panel-shadow flex w-[360px] shrink-0 flex-col overflow-y-auto border-l border-slate-200 bg-white" aria-label={`${device.name} details`}>
      <div className="flex items-start justify-between border-b border-slate-100 p-5">
        <div><p className="text-[11px] font-bold uppercase tracking-[.14em] text-teal-700">Device details</p><h2 className="mt-1 text-lg font-semibold text-slate-900">{device.name}</h2></div>
        <button className="grid size-9 place-items-center rounded-lg text-xl text-slate-500 hover:bg-slate-100" onClick={onClose} aria-label="Close device details">×</button>
      </div>
      <div className="space-y-5 p-5">
        <div className="grid grid-cols-2 gap-3">
          <Info label="MAC address" value={device.mac} />
          <Info label="IP address" value={device.ip} />
        </div>
        <section className="rounded-xl bg-slate-50 p-4">
          <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Latest location</h3><span className="size-2 rounded-full bg-emerald-500" title="Mock device online" /></div>
          <p className="mt-1 text-xs text-slate-500">{displayTime(latest.time)}</p>
          <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 text-xs">
            <Info label="Latitude" value={displayCoordinate(latest.latitude)} />
            <Info label="Longitude" value={displayCoordinate(latest.longitude)} />
            <Info label="Altitude" value={latest.altitude === undefined ? "Unavailable" : `${latest.altitude.toFixed(1)} m`} />
          </dl>
        </section>
        <button className="ui-transition flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800" onClick={onRefresh}>↻ Force location refresh</button>
        <p className="-mt-3 text-center text-[11px] text-slate-500">Simulated action · demo data only</p>
        <section>
          <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold">Location history</h3><span className="text-[11px] text-slate-400">Recent</span></div>
          <ol className="space-y-3 border-l border-slate-200 pl-4">
            {[...device.history].reverse().map((entry, index) => (
              <li key={`${entry.time}-${index}`} className="relative text-xs before:absolute before:-left-[21px] before:top-1 before:size-2 before:rounded-full before:bg-teal-500">
                <p className="font-medium text-slate-700">{displayTime(entry.time)}</p>
                <p className="mt-0.5 text-slate-500">{displayCoordinate(entry.latitude)}, {displayCoordinate(entry.longitude)} · {entry.altitude === undefined ? "Alt unavailable" : `${entry.altitude.toFixed(1)} m`}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </aside>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-[10px] font-bold uppercase tracking-[.1em] text-slate-400">{label}</dt><dd className="mt-1 break-all font-medium text-slate-700">{value}</dd></div>;
}

export function MapPage(props: MapPageProps) {
  const selected = props.devices.find(device => device.id === props.selectedId);
  return <div className="flex min-h-0 flex-1 gap-0">
    <MapCanvas {...props} />
    {selected && <DevicePanel device={selected} onClose={props.onClose} onRefresh={() => props.onRefresh(selected.id)} />}
  </div>;
}

type SettingsPageProps = { settings: MapSettings; imageUrl: string; onSave: (settings: MapSettings) => Promise<void> };

function decodeImage(file: File) {
  return new Promise<void>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("This file could not be read as an image.")); };
    image.src = url;
  });
}

export function SettingsPage({ settings, imageUrl, onSave }: SettingsPageProps) {
  const [fields, setFields] = useState({ north: String(settings.north), south: String(settings.south), east: String(settings.east), west: String(settings.west), intervalSeconds: String(settings.intervalSeconds) });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const previewUrl = useRef<string | null>(null);
  const currentUrl = file && previewUrl.current ? previewUrl.current : imageUrl;

  useEffect(() => {
    setFields({ north: String(settings.north), south: String(settings.south), east: String(settings.east), west: String(settings.west), intervalSeconds: String(settings.intervalSeconds) });
    setFile(null);
  }, [settings]);
  useEffect(() => () => { if (previewUrl.current) URL.revokeObjectURL(previewUrl.current); }, []);

  const setField = (key: keyof typeof fields, value: string) => setFields(current => ({ ...current, [key]: value }));
  const chooseFile = (selected: File | undefined) => {
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = null;
    setFile(null);
    setError("");
    if (!selected) return;
    if (!supportedImage(selected.name, selected.type)) { setError("Choose a PNG, JPEG, WebP, or SVG image."); return; }
    previewUrl.current = URL.createObjectURL(selected);
    setFile(selected);
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const next = { north: Number(fields.north), south: Number(fields.south), east: Number(fields.east), west: Number(fields.west) };
    const intervalSeconds = Number(fields.intervalSeconds);
    if (["north", "south", "east", "west"].some(key => fields[key as keyof typeof fields].trim() === "") || !validBounds(next)) {
      setError("Check the bounds: latitude must be −90 to 90, longitude −180 to 180, north above south, and east to the right of west.");
      return;
    }
    if (!validInterval(intervalSeconds)) {
      setError("The update interval must be a whole number from 1 to 3600 seconds.");
      return;
    }
    setSaving(true); setError("");
    try {
      if (file) await decodeImage(file);
      await onSave({ ...settings, ...next, intervalSeconds, imageName: file?.name ?? settings.imageName, imageBlob: file ?? settings.imageBlob });
      setFile(null);
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
      previewUrl.current = null;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Settings could not be saved in this browser.");
    } finally { setSaving(false); }
  };

  const field = (key: keyof typeof fields, label: string, help: string, min: number, max: number) => (
    <label className="block">
      <span className="text-xs font-semibold text-slate-700">{label}</span>
      <input className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm" type="number" step="any" min={min} max={max} value={fields[key]} onChange={event => setField(key, event.target.value)} />
      <span className="mt-1 block text-[11px] text-slate-400">{help}</span>
    </label>
  );

  return <form className="grid min-h-0 flex-1 gap-5 overflow-y-auto xl:grid-cols-[minmax(0,1fr)_340px]" onSubmit={save}>
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div><h2 className="text-base font-semibold">Map background</h2><p className="mt-1 text-sm text-slate-500">Upload an image, then align its edges with real coordinates.</p></div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.8fr)]">
          <label className="group flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center hover:border-teal-500 hover:bg-teal-50/40">
            <span className="grid size-11 place-items-center rounded-xl bg-white text-xl text-teal-700 shadow-sm">↑</span>
            <span className="mt-3 text-sm font-semibold text-slate-800">{file?.name ?? settings.imageName}</span>
            <span className="mt-1 text-xs text-slate-500">PNG, JPEG, WebP, SVG</span>
            <input className="sr-only" type="file" accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml" onChange={event => chooseFile(event.target.files?.[0])} />
          </label>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            <img src={currentUrl} alt="Preview of the selected map background" className="h-48 w-full object-contain" />
          </div>
        </div>
        <div className="mt-6 flex items-center gap-2"><span className="grid size-7 place-items-center rounded-lg bg-teal-50 text-xs font-bold text-teal-800">01</span><h3 className="text-sm font-semibold">Geographic bounds</h3><span className="text-xs text-slate-400">North is the top edge</span></div>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {field("north", "North latitude", "Top edge · −90 to 90", -90, 90)}
          {field("south", "South latitude", "Bottom edge · −90 to 90", -90, 90)}
          {field("west", "West longitude", "Left edge · −180 to 180", -180, 180)}
          {field("east", "East longitude", "Right edge · −180 to 180", -180, 180)}
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-teal-50 text-lg text-teal-800">◷</span><div><h2 className="text-base font-semibold">Location update interval</h2><p className="mt-1 text-sm text-slate-500">Controls how often mock device locations change in the map demo.</p></div></div>
        <label className="mt-5 block max-w-sm"><span className="text-xs font-semibold text-slate-700">Update every</span><div className="mt-1.5 flex items-center gap-2"><input className="w-36 rounded-lg border border-slate-200 px-3 py-2.5 text-sm" type="number" min="1" max="3600" step="1" value={fields.intervalSeconds} onChange={event => setField("intervalSeconds", event.target.value)} /><span className="text-sm text-slate-500">seconds</span></div><span className="mt-1 block text-[11px] text-slate-400">Choose a whole number from 1 to 3600.</span></label>
      </section>
    </div>
    <aside className="flex flex-col gap-4">
      <section className="rounded-2xl border border-teal-100 bg-teal-50/70 p-5"><span className="rounded-full bg-teal-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-teal-800">Demo configuration</span><h2 className="mt-4 text-sm font-semibold text-slate-800">Saved in this browser</h2><p className="mt-1 text-xs leading-5 text-slate-600">Your background and settings stay on this device. Device reports and refresh actions are simulated.</p></section>
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-800">{error}</div>}
      <button className="ui-transition rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 disabled:opacity-60" type="submit" disabled={saving}>{saving ? "Saving…" : "Save configuration"}</button>
      <p className="text-center text-[11px] text-slate-400">The previous valid setup remains active until this save succeeds.</p>
    </aside>
  </form>;
}

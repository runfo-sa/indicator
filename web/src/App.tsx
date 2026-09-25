import { useEffect, useRef, useState } from "react";
import { MapPage, SettingsPage } from "./pages";
import { MOCK_DEVICES, nextMockReport } from "./mock-devices";
import { DEFAULT_SETTINGS, type Device, type MapSettings } from "./model";
import { loadSettings, saveSettings } from "./settings-store";

type Page = "map" | "settings";
const pageFromHash = (): Page => window.location.hash.includes("settings") ? "settings" : "map";

function NavIcon({ kind }: { kind: Page }) {
  return kind === "map" ? (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-5"><path d="m3.5 6 5.7-2 5.6 2 5.7-2v14l-5.7 2-5.6-2-5.7 2V6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M9.2 4v14m5.6-12v14" stroke="currentColor" strokeWidth="1.7"/></svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-5"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" stroke="currentColor" strokeWidth="1.7"/><path d="m19.4 13.5 1.1.9-1.5 2.6-1.4-.5a7.9 7.9 0 0 1-1.4.8l-.2 1.5h-3l-.3-1.5a7.9 7.9 0 0 1-1.4-.8l-1.4.5-1.5-2.6 1.1-.9a7.5 7.5 0 0 1 0-1.6l-1.1-.9 1.5-2.6 1.4.5a7.9 7.9 0 0 1 1.4-.8l.3-1.5h3l.2 1.5a7.9 7.9 0 0 1 1.4.8l1.4-.5 1.5 2.6-1.1.9a7.5 7.5 0 0 1 0 1.6Z" transform="translate(-1.5 -1)" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>(pageFromHash);
  const [settings, setSettings] = useState<MapSettings>(DEFAULT_SETTINGS);
  const [devices, setDevices] = useState<Device[]>(MOCK_DEVICES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("/demo-map.png");
  const [ready, setReady] = useState(false);
  const tick = useRef(0);

  useEffect(() => {
    const sync = () => setPage(pageFromHash());
    if (!window.location.hash) window.history.replaceState(null, "", "#/map");
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    let active = true;
    loadSettings().then(value => { if (active) setSettings(value); }).catch(() => { /* Keep the bundled demo settings usable. */ }).finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!settings.imageBlob) { setImageUrl("/demo-map.png"); return; }
    const url = URL.createObjectURL(settings.imageBlob);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [settings.imageBlob]);

  useEffect(() => { if (page !== "map") setSelectedId(null); }, [page]);

  useEffect(() => {
    if (page !== "map" || !ready) return;
    const timer = window.setInterval(() => {
      const step = ++tick.current;
      setDevices(current => current.map(device => nextMockReport(device, step)));
    }, settings.intervalSeconds * 1000);
    return () => window.clearInterval(timer);
  }, [page, ready, settings.intervalSeconds]);

  const persist = async (next: MapSettings) => {
    await saveSettings(next);
    setSettings(next);
  };
  const refreshOne = (id: string) => {
    const step = ++tick.current;
    setDevices(current => current.map(device => device.id === id ? nextMockReport(device, step) : device));
  };

  const nav = (target: Page, title: string, subtitle: string) => (
    <a
      key={target}
      href={`#/${target}`}
      aria-current={page === target ? "page" : undefined}
      title={title}
      className={`ui-transition group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${page === target ? "bg-teal-700 text-white shadow-sm" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
    >
      <NavIcon kind={target} />
      <span className="hidden min-w-0 sm:block"><span className="block">{title}</span><span className={`mt-0.5 block text-[11px] ${page === target ? "text-teal-100" : "text-slate-500"}`}>{subtitle}</span></span>
    </a>
  );

  return <div className="flex h-dvh min-h-[540px] overflow-hidden bg-[#f4f6f8]">
    <aside className="z-20 flex w-[68px] shrink-0 flex-col bg-[#111b2c] px-2.5 py-4 sm:w-[228px] sm:px-4">
      <a href="#/map" className="flex items-center gap-3 px-1.5" aria-label="Indicator home">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-500 text-lg font-bold text-[#092b2a]">I</span>
        <span className="hidden sm:block"><span className="block text-base font-semibold tracking-tight text-white">Indicator</span><span className="block text-[10px] font-semibold uppercase tracking-[.16em] text-slate-500">Device operations</span></span>
      </a>
      <p className="mb-2 mt-9 hidden px-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-500 sm:block">Workspace</p>
      <nav aria-label="Primary navigation" className="flex flex-col gap-1.5">{nav("map", "Map", "Location overview")}{nav("settings", "Settings", "Background & updates")}</nav>
      <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-3 text-center sm:text-left"><span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[.13em] text-amber-200"><span className="size-1.5 rounded-full bg-amber-300" />Demo</span><p className="mt-2 hidden text-[11px] leading-4 text-slate-400 sm:block">All device data and actions are simulated.</p></div>
    </aside>
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <header className="flex min-h-[76px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-7">
        <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-teal-700">Indicator / {page === "map" ? "Operations" : "Configuration"}</p><h1 className="mt-0.5 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">{page === "map" ? "Device map" : "Map settings"}</h1></div>
        <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-amber-800"><span className="size-1.5 rounded-full bg-amber-500" />Mock environment</div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-5">
        {page === "map" ? <MapPage settings={settings} imageUrl={imageUrl} devices={devices} selectedId={selectedId} onSelect={setSelectedId} onClose={() => setSelectedId(null)} onRefresh={refreshOne} /> : <SettingsPage settings={settings} imageUrl={imageUrl} onSave={persist} />}
      </div>
    </main>
  </div>;
}

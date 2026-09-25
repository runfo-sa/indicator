import { DEFAULT_SETTINGS, type MapSettings } from "./model";

const DB_NAME = "indicator-web-demo";
const STORE_NAME = "settings";
const SETTINGS_KEY = "map";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) return reject(new Error("Browser storage is unavailable."));
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open browser storage."));
  });
}

async function storeSettings(mode: IDBTransactionMode, value?: MapSettings): Promise<MapSettings | undefined> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = mode === "readonly" ? store.get(SETTINGS_KEY) : store.put(value, SETTINGS_KEY);
    let result: MapSettings | undefined;
    request.onsuccess = () => { if (mode === "readonly") result = request.result as MapSettings | undefined; };
    request.onerror = () => reject(request.error ?? new Error("Could not access browser storage."));
    transaction.oncomplete = () => { db.close(); resolve(result); };
    transaction.onerror = () => reject(transaction.error ?? new Error("Could not save browser settings."));
    transaction.onabort = () => reject(transaction.error ?? new Error("Browser storage was blocked."));
  });
}

export async function loadSettings() {
  return (await storeSettings("readonly")) ?? DEFAULT_SETTINGS;
}

export async function saveSettings(settings: MapSettings) {
  await storeSettings("readwrite", settings);
}

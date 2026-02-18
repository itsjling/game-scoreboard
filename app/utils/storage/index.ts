import { MMKV } from "react-native-mmkv";

const mmkv = new MMKV();

/**
 * Loads a string from storage.
 *
 * @param key The key to fetch.
 */
function loadString(key: string): string | null {
  try {
    return mmkv.getString(key) ?? null;
  } catch {
    // not sure why this would fail... even reading the RN docs I'm unclear
    return null;
  }
}

/**
 * Saves a string to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
function saveString(key: string, value: string): boolean {
  try {
    mmkv.set(key, value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Loads something from storage and runs it thru JSON.parse.
 *
 * @param key The key to fetch.
 */
function load<T>(key: string): T | null {
  let almostThere: string | null = null;
  try {
    almostThere = loadString(key);
    return JSON.parse(almostThere ?? "") as T;
  } catch {
    return (almostThere as T) ?? null;
  }
}

/**
 * Saves an object to storage.
 *
 * @param key The key to fetch.
 * @param value The value to store.
 */
function save(key: string, value: unknown): boolean {
  try {
    saveString(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Removes something from storage.
 *
 * @param key The key to kill.
 */
function remove(key: string): void {
  try {
    mmkv.delete(key);
  } catch {
    // Silently ignore deletion errors
  }
}

/**
 * Burn it all to the ground.
 */
function clear(): void {
  try {
    mmkv.clearAll();
  } catch {
    // Silently ignore clear errors
  }
}

export const storage = {
  loadString,
  saveString,
  load,
  save,
  remove,
  clear,
  storage: mmkv,
};

export { loadString, saveString, load, save, remove, clear };

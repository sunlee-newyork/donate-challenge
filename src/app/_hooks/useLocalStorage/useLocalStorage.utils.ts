export const LOCAL_STORAGE_CHANGE_EVENT_NAME = "onLocalStorageChange";

export const isBrowser = () => {
  return (
    typeof window !== "undefined" && typeof window.document !== "undefined"
  );
};

/**
 * Test if localStorage API is available
 * From https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#Feature-detecting_localStorage
 * @returns {boolean}
 */
export function localStorageAvailable(): boolean {
  try {
    var x = "@rehooks/local-storage:" + new Date().toISOString();
    localStorage.setItem(x, x);
    localStorage.removeItem(x);
    return true;
  } catch (e) {
    return (
      isBrowser() &&
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === "QuotaExceededError" ||
        // Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // acknowledge QuotaExceededError only if there's something already stored
      localStorage &&
      localStorage.length !== 0
    );
  }
}

interface IProxyStorage {
  getItem(key: string): string | null;
  setItem(Key: string, value: string): void;
  removeItem(key: string): void;
}

export class LocalStorageProxy implements IProxyStorage {
  getItem(key: string): string | null {
    return localStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}

export class MemoryStorageProxy implements IProxyStorage {
  private _memoryStorage = new Map<string, string>();

  getItem(key: string): string | null {
    return this._memoryStorage.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this._memoryStorage.set(key, value);
  }

  removeItem(key: string): void {
    this._memoryStorage.delete(key);
  }
}

const proxyStorageFrom = (isAvailable: boolean) =>
  isAvailable ? new LocalStorageProxy() : new MemoryStorageProxy();

export const storage = proxyStorageFrom(localStorageAvailable());

/**
 * CustomEvent polyfill derived from: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
 */
(() => {
  if (!isBrowser()) {
    return;
  }

  if (typeof global.window.CustomEvent === "function") {
    return;
  }

  function CustomEvent<T>(
    typeArg: string,
    params: CustomEventInit<T> = { bubbles: false, cancelable: false }
  ): CustomEvent<T> {
    const evt = document.createEvent("CustomEvent");
    evt.initCustomEvent(
      typeArg,
      params?.bubbles ?? false,
      params?.cancelable ?? false,
      params?.detail
    );
    return evt;
  }

  window.CustomEvent = CustomEvent as unknown as typeof window.CustomEvent;
})();

export interface LocalStorageEventPayload<TValue> {
  key: string;
  value: TValue;
}

/**
 * Checks if the event that is passed in is the same type as LocalStorageChanged.
 *
 * @export
 * @template TValue
 * @param {*} evt the object you wish to assert as a onLocalStorageChange event.
 * @returns {evt is LOCAL_STORAGE_CHANGE_EVENT_NAME} if true, evt is asserted to be onLocalStorageChange.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function isTypeOfLocalStorageChanged<TValue>(evt: CustomEvent): boolean {
  return !!evt && evt.type === LOCAL_STORAGE_CHANGE_EVENT_NAME;
}

/**
 * Use this instead of directly using localStorage.setItem
 * in order to correctly send events within the same window.
 *
 * @example
 * ```js
 * writeStorage('hello', JSON.stringify({ name: 'world' }));
 * const { name } = JSON.parse(localStorage.getItem('hello'));
 * ```
 *
 * @export
 * @param {string} key The key to write to in the localStorage.
 * @param {string} value The value to write to in the localStorage.
 */
export function writeStorage<TValue>(key: string, value: TValue) {
  if (!isBrowser()) {
    return;
  }

  try {
    storage.setItem(
      key,
      typeof value === "object" ? JSON.stringify(value) : `${value}`
    );
    window.dispatchEvent(
      new CustomEvent(LOCAL_STORAGE_CHANGE_EVENT_NAME, {
        detail: { key, value },
      })
    );
  } catch (err) {
    if (
      err instanceof TypeError &&
      err.message.includes("circular structure")
    ) {
      throw new TypeError(
        "The object that was given to the writeStorage function has circular references.\n" +
          "For more information, check here: " +
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Cyclic_object_value"
      );
    }
    throw err;
  }
}

/**
 * Use this function to delete a value from localStorage.
 *
 * After calling this function, the localStorage value will be null.
 *
 * @example
 * ```js
 * const user = { name: 'John', email: 'John@fakemail.com' };
 *
 * // Add a user to your localStorage
 * writeStorage('user', JSON.stringify(user));
 *
 * // This will also trigger an update to the state of your component
 * deleteFromStorage('user');
 *
 * localStorage.getItem('user') === null // ✔ This is now null
 * ```
 *
 * @export
 * @param {string} key The key of the item you wish to delete from localStorage.
 */
export function deleteFromStorage(key: string) {
  if (!isBrowser()) {
    return;
  }

  storage.removeItem(key);
  window.dispatchEvent(
    new CustomEvent(LOCAL_STORAGE_CHANGE_EVENT_NAME, {
      detail: { key, value: null },
    })
  );
}

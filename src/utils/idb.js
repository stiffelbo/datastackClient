const DB_NAME = 'datastack';
const DB_VERSION = 1;
const STORE_NAME = 'entitySnapshots';

// singleton DB promise
let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'entityKey' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('IndexedDB open error'));
    };
  });

  return dbPromise;
}

async function withStore(mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);

    let result;

    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error || new Error('IndexedDB transaction error'));

    try {
      result = fn(store);
    } catch (e) {
      reject(e);
    }
  });
}

// ------- public helper functions -------

export async function dbGet(entityKey) {
  try {
    return await withStore('readonly', (store) => {
      return new Promise((resolve, reject) => {
        const req = store.get(entityKey);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error || new Error('IndexedDB get error'));
      });
    });
  } catch (e) {
    console.warn('dbGet error', e);
    return null;
  }
}

export async function dbPut(record) {
  try {
    await withStore('readwrite', (store) => {
      store.put(record);
    });
  } catch (e) {
    console.warn('dbPut error', e);
  }
}

export async function dbDelete(entityKey) {
  try {
    await withStore('readwrite', (store) => {
      store.delete(entityKey);
    });
  } catch (e) {
    console.warn('dbDelete error', e);
  }
}

/**
 * Delete all records whose key starts with given prefix.
 */
export async function dbDeleteByPrefix(prefix) {
  try {
    await withStore('readwrite', (store) => {
      const request = store.openCursor();
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (!cursor) return;

        const key = cursor.key;
        if (typeof key === 'string' && key.startsWith(prefix)) {
          cursor.delete();
        }
        cursor.continue();
      };
    });
  } catch (e) {
    console.warn('dbDeleteByPrefix error', e);
  }
}

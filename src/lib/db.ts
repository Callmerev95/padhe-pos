import { HoldOrder } from "@/store/holdOrder.types";

// Definisi tipe data untuk item dalam order
export type OrderItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
  categoryType: "FOOD" | "DRINK";
};

// Definisi tipe data untuk LocalOrder
export type LocalOrder = {
  id: string;
  createdAt: string;
  total: number;
  paid: number;
  paymentMethod: "CASH" | "DANA" | "BCA" | "QRIS";
  customerName?: string;
  orderType: "Dine In" | "Take Away";
  items: OrderItem[];
  isSynced?: boolean; // TAMBAHKAN INI: Untuk melacak status sinkronisasi ke cloud
};

const DB_NAME = "coffee-pos-db";
const DB_VERSION = 2;
const STORE_ORDERS = "orders";
const STORE_HOLD_ORDERS = "hold_orders";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;

      // Buat object store untuk orders jika belum ada
      if (!db.objectStoreNames.contains(STORE_ORDERS)) {
        const store = db.createObjectStore(STORE_ORDERS, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt");
        // Tambahkan index untuk isSynced agar pencarian data tertunda lebih cepat
        store.createIndex("isSynced", "isSynced");
      }
      if (!db.objectStoreNames.contains(STORE_HOLD_ORDERS)) {
        db.createObjectStore(STORE_HOLD_ORDERS, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveOrder(order: LocalOrder) {
  const db = await openDB();
  const tx = db.transaction(STORE_ORDERS, "readwrite");
  // Pastikan saat simpan pertama kali, isSynced defaultnya false jika tidak diatur
  const orderToSave = { ...order, isSynced: order.isSynced ?? false };
  tx.objectStore(STORE_ORDERS).put(orderToSave);
}

// Tambahkan fungsi baru untuk update status sync saja
export async function markOrderAsSynced(id: string) {
  const db = await openDB();
  const tx = db.transaction(STORE_ORDERS, "readwrite");
  const store = tx.objectStore(STORE_ORDERS);
  const order = await new Promise<LocalOrder>((res) => {
    const req = store.get(id);
    req.onsuccess = () => res(req.result);
  });

  if (order) {
    order.isSynced = true;
    store.put(order);
  }
  return tx.oncomplete;
}

export async function getAllOrders(): Promise<LocalOrder[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ORDERS, "readonly");
    const store = tx.objectStore(STORE_ORDERS);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getOrderById(id: string): Promise<LocalOrder> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ORDERS, "readonly");
    const store = tx.objectStore(STORE_ORDERS);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteOrder(id: string) {
  const db = await openDB();
  const tx = db.transaction(STORE_ORDERS, "readwrite");
  const store = tx.objectStore(STORE_ORDERS);
  store.delete(id);
  return tx.oncomplete;
}

export async function saveHoldOrderLocal(order: HoldOrder) {
  const db = await openDB();
  const tx = db.transaction(STORE_HOLD_ORDERS, "readwrite");
  tx.objectStore(STORE_HOLD_ORDERS).put(order);
  return tx.oncomplete;
}

export async function getAllHoldOrdersLocal(): Promise<HoldOrder[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_HOLD_ORDERS, "readonly");
    const store = tx.objectStore(STORE_HOLD_ORDERS);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteHoldOrderLocal(id: string) {
  const db = await openDB();
  const tx = db.transaction(STORE_HOLD_ORDERS, "readwrite");
  tx.objectStore(STORE_HOLD_ORDERS).delete(id);
  return tx.oncomplete;
}

export async function upsertOrdersFromCloud(cloudOrders: LocalOrder[]) {
  const db = await openDB();
  const tx = db.transaction(STORE_ORDERS, "readwrite");
  const store = tx.objectStore(STORE_ORDERS);

  for (const order of cloudOrders) {
    // Simpan order dari cloud dengan isSynced = true
    store.put({ ...order, isSynced: true });
  }
  return tx.oncomplete;
}

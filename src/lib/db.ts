import { HoldOrder } from "@/store/holdOrder.types";
import { z } from "zod"; // Gunakan import standard

// ✅ 1. Definisi Zod Schema (Single Source of Truth)
export const OrderItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  qty: z.number(),
  price: z.number(),
  categoryType: z.enum(["FOOD", "DRINK"]),
  notes: z.string().optional().nullable(),
  isDone: z.boolean().default(false), // Tambahkan field ini
});

export const LocalOrderSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  total: z.number(),
  paid: z.number(),
  paymentMethod: z.enum(["CASH", "DANA", "BCA", "QRIS"]),
  customerName: z.string().optional().nullable(),
  orderType: z.enum(["Dine In", "Take Away"]),
  items: z.array(OrderItemSchema),
  isSynced: z.boolean().optional().default(false),
});

// ✅ 2. Export Type (Otomatis dari Schema)
// Kita gunakan 'infer' agar tidak perlu nulis type manual lagi
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type LocalOrder = z.infer<typeof LocalOrderSchema>;

// Konstanta untuk IndexedDB
const DB_NAME = "coffee-pos-db";
const DB_VERSION = 2;
const STORE_ORDERS = "orders";
const STORE_HOLD_ORDERS = "hold_orders";

// Fungsi untuk membuka koneksi ke IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_ORDERS)) {
        const store = db.createObjectStore(STORE_ORDERS, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt");
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

// Fungsi untuk menyimpan pesanan lokal
export async function saveOrder(order: LocalOrder) {
  const db = await openDB();
  const tx = db.transaction(STORE_ORDERS, "readwrite");

  // ✅ Gunakan parse agar data yang masuk ke IndexedDB terjamin kualitasnya
  const validatedOrder = LocalOrderSchema.parse(order);
  tx.objectStore(STORE_ORDERS).put(validatedOrder);
}

// Fungsi update status sync
export async function markOrderAsSynced(id: string) {
  const db = await openDB();
  const tx = db.transaction(STORE_ORDERS, "readwrite");
  const store = tx.objectStore(STORE_ORDERS);
  const order = await new Promise<LocalOrder | undefined>((res) => {
    const req = store.get(id);
    req.onsuccess = () => res(req.result);
  });

  if (order) {
    order.isSynced = true;
    store.put(order);
  }
  return tx.oncomplete;
}

// Fungsi untuk mengambil semua pesanan
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

// Fungsi untuk mengambil pesanan berdasarkan ID
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

// Fungsi untuk menghapus pesanan berdasarkan ID
export async function deleteOrder(id: string) {
  const db = await openDB();
  const tx = db.transaction(STORE_ORDERS, "readwrite");
  const store = tx.objectStore(STORE_ORDERS);
  store.delete(id);
  return tx.oncomplete;
}

// Fungsi untuk menyimpan hold order
export async function saveHoldOrderLocal(order: HoldOrder) {
  const db = await openDB();
  const tx = db.transaction(STORE_HOLD_ORDERS, "readwrite");
  tx.objectStore(STORE_HOLD_ORDERS).put(order);
  return tx.oncomplete;
}

// Fungsi untuk mengambil semua hold order
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

// Fungsi untuk menghapus hold order berdasarkan ID
export async function deleteHoldOrderLocal(id: string) {
  const db = await openDB();
  const tx = db.transaction(STORE_HOLD_ORDERS, "readwrite");
  tx.objectStore(STORE_HOLD_ORDERS).delete(id);
  return tx.oncomplete;
}

// Fungsi untuk menyimpan atau memperbarui pesanan dari cloud
// src/lib/db.ts

export async function upsertOrdersFromCloud(cloudOrders: unknown[]) {
  const db = await openDB();
  const tx = db.transaction(STORE_ORDERS, "readwrite");
  const store = tx.objectStore(STORE_ORDERS);

  for (const order of cloudOrders) {
    const orderData = order as Record<string, unknown>;
    const rawItems = (orderData.items as unknown[]) || [];

    // 1. Normalisasi Items - Kunci perbaikan ada di sini
    const normalizedItems = rawItems.map((item, index) => {
      const i = item as Record<string, unknown>;
      return {
        // ✅ Berikan ID dummy jika ID asli tidak ada agar lolos validasi Zod
        id: String(i.id || `item-legacy-${index}`), 
        name: String(i.name || "Unknown Item"),
        qty: Number(i.qty || 1),
        price: Number(i.price || 0),
        categoryType: String(i.categoryType || "FOOD").toUpperCase(),
        isDone: Boolean(i.isDone ?? false),
        notes: i.notes ? String(i.notes) : "",
      };
    });

    // 2. Susun objek Order
    const orderToValidate = {
      ...orderData,
      items: normalizedItems,
      isSynced: true,
      // Pastikan metode pembayaran dan tipe order punya default jika kosong
      paymentMethod: String(orderData.paymentMethod || "CASH").toUpperCase(),
      orderType: orderData.orderType || "Dine In",
      createdAt: orderData.createdAt instanceof Date 
        ? orderData.createdAt.toISOString() 
        : String(orderData.createdAt),
    };

    try {
      // 3. Validasi dengan safeParse
      const result = LocalOrderSchema.safeParse(orderToValidate);
      
      if (result.success) {
        store.put(result.data);
      } else {
        // Jika masih gagal, kita log detail field mana yang bikin mati
        console.error(`❌ Gagal parse Order ${orderData.id}:`, result.error.flatten().fieldErrors);
      }
    } catch (err) {
      console.error(`Gagal simpan ke IndexedDB:`, err);
    }
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}
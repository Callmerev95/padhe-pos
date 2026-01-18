export function generateOrderId(prefix = "") {
  const time = Date.now().toString(36).toUpperCase(); // waktu
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase(); // random
  return `${prefix}${time}${rand}`;
}

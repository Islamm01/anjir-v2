export function generateOrderNumber(): string {
  const d = new Date();
  const date = d.getFullYear() + String(d.getMonth()+1).padStart(2,"0") + String(d.getDate()).padStart(2,"0");
  return "ANJIR-" + date + "-" + Math.floor(Math.random()*100000).toString().padStart(5,"0");
}
export function generateDeliveryNumber(): string {
  const d = new Date();
  const date = d.getFullYear() + String(d.getMonth()+1).padStart(2,"0") + String(d.getDate()).padStart(2,"0");
  return "ANJIR-D-" + date + "-" + Math.floor(Math.random()*100000).toString().padStart(5,"0");
}
export function formatTJS(amount: number | string): string {
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + " сом.";
}
export const ORDER_STATUS_LABEL: Record<string,string> = {
  NEW_ORDER:"Новый", STORE_CONFIRMED:"Подтверждён", PREPARING:"Готовится",
  READY_FOR_PICKUP:"Готов к выдаче", COURIER_ASSIGNED:"Курьер едет",
  PICKED_UP:"Курьер забрал", IN_DELIVERY:"В пути", DELIVERED:"Доставлен",
  COMPLETED:"Завершён", REJECTED:"Отклонён", CANCELLED:"Отменён",
};
export const ORDER_STATUS_COLOR: Record<string,{bg:string;text:string;border:string}> = {
  NEW_ORDER:         {bg:"bg-amber-50",  text:"text-amber-800",  border:"border-amber-200"},
  STORE_CONFIRMED:   {bg:"bg-blue-50",   text:"text-blue-800",   border:"border-blue-200"},
  PREPARING:         {bg:"bg-violet-50", text:"text-violet-800", border:"border-violet-200"},
  READY_FOR_PICKUP:  {bg:"bg-orange-50", text:"text-orange-800", border:"border-orange-200"},
  COURIER_ASSIGNED:  {bg:"bg-orange-50", text:"text-orange-800", border:"border-orange-200"},
  PICKED_UP:         {bg:"bg-orange-100",text:"text-orange-900", border:"border-orange-300"},
  IN_DELIVERY:       {bg:"bg-orange-100",text:"text-orange-900", border:"border-orange-300"},
  DELIVERED:         {bg:"bg-green-50",  text:"text-green-800",  border:"border-green-200"},
  COMPLETED:         {bg:"bg-green-100", text:"text-green-900",  border:"border-green-300"},
  REJECTED:          {bg:"bg-red-50",    text:"text-red-800",    border:"border-red-200"},
  CANCELLED:         {bg:"bg-red-50",    text:"text-red-800",    border:"border-red-200"},
};
export const DELIVERY_STATUS_LABEL: Record<string,string> = {
  REQUESTED:"Ожидание курьера", ACCEPTED:"Курьер принял",
  PICKED_UP:"Посылка забрана",  IN_DELIVERY:"В пути",
  DELIVERED:"Доставлено",       CANCELLED:"Отменено",
};
export const PAYMENT_METHOD_LABEL: Record<string,string> = {
  CASH:"Наличные", QR:"QR-оплата", TRANSFER:"Перевод",
};
export function timeAgo(date: Date | string): string {
  const d = new Date(date);
  const minutes = Math.floor((Date.now() - d.getTime()) / 60000);
  if (minutes < 1)  return "только что";
  if (minutes < 60) return minutes + " мин назад";
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return hours + " ч назад";
  return d.toLocaleDateString("ru-RU", { day:"numeric", month:"short" });
}
export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("ru-RU", { hour:"2-digit", minute:"2-digit" });
}
export function calculateCommission(subtotal: number, pct: number): number {
  return Math.round(subtotal * (pct / 100) * 100) / 100;
}
export const DELIVERY_FEE = 10;
export const COURIER_SERVICE_PRICE = 20;
export const DEFAULT_COMMISSION_PCT = 12;

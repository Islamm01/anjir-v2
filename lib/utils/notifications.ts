"use server";
import prisma from "@/lib/prisma";

type NType = "NEW_ORDER"|"ORDER_CONFIRMED"|"ORDER_READY"|"ORDER_ASSIGNED"|"ORDER_PICKED_UP"|"ORDER_DELIVERED"|"PAYMENT_CONFIRM"|"NEW_DELIVERY"|"SYSTEM";

async function notify(userId: string, type: NType, title: string, body: string, data?: Record<string,string>) {
  await prisma.notification.create({ data: { userId, type, title, body, data: data ?? {} } });
}

export async function notifyStoreNewOrder(storeOwnerId: string, orderNumber: string, orderId: string) {
  await notify(storeOwnerId, "NEW_ORDER", "Новый заказ!", `Заказ ${orderNumber} ожидает подтверждения`, { orderId, orderNumber });
}
export async function notifyCustomerOrderConfirmed(customerId: string, orderNumber: string, orderId: string) {
  await notify(customerId, "ORDER_CONFIRMED", "Заказ подтверждён", `Магазин принял заказ ${orderNumber}`, { orderId, orderNumber });
}
export async function notifyCustomerOrderReady(customerId: string, orderNumber: string, orderId: string) {
  await notify(customerId, "ORDER_READY", "Заказ готов", `Заказ ${orderNumber} собран, ищем курьера`, { orderId, orderNumber });
}
export async function notifyCustomerCourierAssigned(customerId: string, orderNumber: string, orderId: string, courierName: string) {
  await notify(customerId, "ORDER_ASSIGNED", "Курьер назначен", `Курьер ${courierName} едет за заказом ${orderNumber}`, { orderId, orderNumber });
}
export async function notifyCustomerPickedUp(customerId: string, orderNumber: string, orderId: string) {
  await notify(customerId, "ORDER_PICKED_UP", "Курьер забрал заказ", `Заказ ${orderNumber} в пути`, { orderId, orderNumber });
}
export async function notifyCustomerDelivered(customerId: string, orderNumber: string, orderId: string) {
  await notify(customerId, "ORDER_DELIVERED", "Заказ доставлен!", `Заказ ${orderNumber} успешно доставлен`, { orderId, orderNumber });
}
export async function notifyAdminsPaymentPending(adminIds: string[], orderNumber: string, orderId: string, method: string) {
  for (const userId of adminIds) {
    await notify(userId, "PAYMENT_CONFIRM", "Подтвердите оплату", `Заказ ${orderNumber} — ${method} ожидает подтверждения`, { orderId, orderNumber });
  }
}
export async function notifyOnlineCouriersNewJob(jobId: string, jobNumber: string, type: "ORDER"|"DELIVERY") {
  const couriers = await prisma.courier.findMany({ where: { isOnline: true, isActive: true, isVerified: true }, include: { user: { select: { id: true } } } });
  for (const c of couriers) {
    await notify(c.user.id, type === "ORDER" ? "ORDER_READY" : "NEW_DELIVERY",
      type === "ORDER" ? "Новый заказ к забору!" : "Новая посылка!",
      `Доступна доставка ${jobNumber}`,
      type === "ORDER" ? { orderId: jobId } : { deliveryId: jobId });
  }
}

"use server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateDeliveryNumber, COURIER_SERVICE_PRICE } from "@/lib/utils";
import { notifyOnlineCouriersNewJob } from "@/lib/utils/notifications";

const Schema = z.object({
  pickupAddress: z.string().min(3), pickupName: z.string().optional(), pickupPhone: z.string().optional(),
  dropoffAddress: z.string().min(3), dropoffName: z.string().min(2), dropoffPhone: z.string().min(7),
  description: z.string().optional(), isFragile: z.boolean().optional(),
  paymentMethod: z.enum(["CASH","QR","TRANSFER"]),
});

export async function requestDelivery(input: z.infer<typeof Schema>) {
  const session = await getSession(); if (!session) return { error: "Войдите в систему" };
  const p = Schema.safeParse(input); if (!p.success) return { error: "Неверные данные" };
  const { data: d } = p;
  const deliveryNumber = generateDeliveryNumber();
  const delivery = await prisma.delivery.create({
    data: {
      deliveryNumber, customerId: session.id,
      pickupAddress: d.pickupAddress, pickupName: d.pickupName ?? null, pickupPhone: d.pickupPhone ?? null,
      dropoffAddress: d.dropoffAddress, dropoffName: d.dropoffName, dropoffPhone: d.dropoffPhone,
      description: d.description ?? null, isFragile: d.isFragile ?? false,
      price: COURIER_SERVICE_PRICE, paymentMethod: d.paymentMethod,
      statusLogs: { create: { status: "REQUESTED", actorId: session.id } },
      payment: { create: { amount: COURIER_SERVICE_PRICE, method: d.paymentMethod, status: "PENDING" } },
    },
  });
  await notifyOnlineCouriersNewJob(delivery.id, deliveryNumber, "DELIVERY");
  return { success: true, deliveryNumber, deliveryId: delivery.id };
}

export async function courierAcceptDelivery(deliveryId: string) {
  const session = await getSession(); if (!session || session.role !== "COURIER") return { error: "Нет доступа" };
  const courier = await prisma.courier.findUnique({ where: { userId: session.id } }); if (!courier) return { error: "Профиль не найден" };
  const updated = await prisma.delivery.updateMany({ where: { id: deliveryId, status: "REQUESTED", courierId: null }, data: { status: "ACCEPTED", courierId: courier.id, courierAcceptedAt: new Date() } });
  if (updated.count === 0) return { error: "Доставка уже принята другим курьером" };
  await prisma.deliveryStatusLog.create({ data: { deliveryId, status: "ACCEPTED", actorId: session.id } });
  return { success: true };
}

export async function courierDeliveryPickedUp(deliveryId: string) {
  const session = await getSession(); if (!session) return { error: "Не авторизован" };
  const courier = await prisma.courier.findUnique({ where: { userId: session.id } }); if (!courier) return { error: "Профиль не найден" };
  const delivery = await prisma.delivery.findUnique({ where: { id: deliveryId, courierId: courier.id } });
  if (!delivery || delivery.status !== "ACCEPTED") return { error: "Нельзя подтвердить" };
  await prisma.$transaction([
    prisma.delivery.update({ where: { id: deliveryId }, data: { status: "PICKED_UP", pickedUpAt: new Date() } }),
    prisma.deliveryStatusLog.create({ data: { deliveryId, status: "PICKED_UP", actorId: session.id } }),
  ]);
  return { success: true };
}

export async function courierDeliveryDone(deliveryId: string) {
  const session = await getSession(); if (!session) return { error: "Не авторизован" };
  const courier = await prisma.courier.findUnique({ where: { userId: session.id } }); if (!courier) return { error: "Профиль не найден" };
  const delivery = await prisma.delivery.findUnique({ where: { id: deliveryId, courierId: courier.id } });
  if (!delivery || delivery.status !== "PICKED_UP") return { error: "Нельзя подтвердить" };
  await prisma.$transaction([
    prisma.delivery.update({ where: { id: deliveryId }, data: { status: "DELIVERED", deliveredAt: new Date() } }),
    prisma.deliveryStatusLog.create({ data: { deliveryId, status: "DELIVERED", actorId: session.id } }),
    prisma.courier.update({ where: { id: courier.id }, data: { totalDeliveries: { increment: 1 } } }),
  ]);
  return { success: true };
}

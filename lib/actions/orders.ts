// lib/actions/orders.ts
"use server";

import { z }          from "zod";
import { Prisma }     from "@prisma/client";
import prisma         from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateOrderNumber, calculateCommission, DELIVERY_FEE } from "@/lib/utils";
import {
  notifyStoreNewOrder, notifyCustomerOrderConfirmed, notifyCustomerOrderReady,
  notifyCustomerCourierAssigned, notifyCustomerPickedUp, notifyCustomerDelivered,
  notifyOnlineCouriersNewJob, notifyAdminsPaymentPending,
} from "@/lib/utils/notifications";

// ── Shared helpers ────────────────────────────────────────────────────────────

const ItemSchema = z.array(z.object({
  productId:   z.string(),
  productName: z.string(),
  unitPrice:   z.number().positive(),
  unit:        z.string(),
  quantity:    z.number().positive(),
  totalPrice:  z.number().positive(),
})).min(1);

async function validateStore(storeId: string, items: z.infer<typeof ItemSchema>) {
  const store = await prisma.store.findUnique({
    where: { id: storeId, isActive: true, isVerified: true },
  });
  if (!store)        return { error: "Магазин недоступен" };
  if (!store.isOpen) return { error: "Магазин сейчас закрыт" };

  const products = await prisma.product.findMany({
    where: { id: { in: items.map(i => i.productId) }, storeId, isAvailable: true },
  });
  if (products.length !== items.length) return { error: "Один из товаров недоступен" };

  const pm = new Map<string, typeof products[0]>(products.map((p: typeof products[0]) => [p.id, p]));
  let computedSub = 0;
  const validItems = items.map(item => {
    const pr = pm.get(item.productId)!;
    const up = Number(pr.price);
    const tp = up * item.quantity;
    computedSub += tp;
    return { ...item, unitPrice: up, totalPrice: tp };
  });

  return { store, validItems, computedSub };
}

// ── GUEST ORDER (no account needed) ──────────────────────────────────────────

const GuestOrderSchema = z.object({
  storeId:         z.string(),
  guestName:       z.string().min(2, "Введите имя"),
  guestPhone:      z.string().min(7, "Введите телефон"),
  deliveryAddress: z.string().min(3, "Введите адрес"),
  notes:           z.string().optional(),
  items:           ItemSchema,
  subtotal:        z.number().positive(),
  deliveryFee:     z.number().min(0),
  paymentMethod:   z.enum(["CASH", "QR", "TRANSFER"]),
  paymentRef:      z.string().optional(),
});

export async function placeGuestOrder(input: z.infer<typeof GuestOrderSchema>) {
  const p = GuestOrderSchema.safeParse(input);
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Неверные данные" };

  const { storeId, guestName, guestPhone, deliveryAddress, notes,
          items, deliveryFee, paymentMethod, paymentRef } = p.data;

  const v = await validateStore(storeId, items);
  if ("error" in v) return v;

  const { store, validItems, computedSub } = v;
  const commission  = calculateCommission(computedSub, Number(store.commissionPct));
  const totalAmount = computedSub + deliveryFee;
  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      // NO customerId — guest order uses dedicated fields
      guestName,
      guestPhone,
      storeId,
      subtotal:       computedSub,
      deliveryFee,
      commission,
      totalAmount,
      paymentMethod,
      paymentStatus:  "PENDING",
      paymentRef:     paymentRef ?? null,
      deliveryAddress,
      notes:          notes ?? null,
      items: {
        create: validItems.map(i => ({
          productId:   i.productId,
          productName: i.productName,
          unitPrice:   i.unitPrice,
          unit:        i.unit,
          quantity:    i.quantity,
          totalPrice:  i.totalPrice,
        })),
      },
      statusLogs: {
        create: {
          status:    "NEW_ORDER",
          actorRole: "guest",
          note:      `Гость: ${guestName} / ${guestPhone}`,
        },
      },
      payment: {
        create: {
          amount:    totalAmount,
          method:    paymentMethod,
          status:    "PENDING",
          reference: paymentRef ?? null,
        },
      },
    },
    include: { store: { include: { owner: { select: { id: true } } } } },
  });

  await notifyStoreNewOrder(order.store.owner.id, orderNumber, order.id);

  if (paymentMethod !== "CASH") {
    const admins = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "OPERATOR"] } } });
    await notifyAdminsPaymentPending(admins.map((a: typeof admins[number]) => a.id), orderNumber, order.id, paymentMethod);
  }

  return { success: true, orderNumber, orderId: order.id };
}

// ── REGISTERED USER ORDER ─────────────────────────────────────────────────────

const PlaceSchema = z.object({
  storeId: z.string(), items: ItemSchema,
  subtotal: z.number().positive(), deliveryFee: z.number().min(0),
  deliveryAddress: z.string().min(3), notes: z.string().optional(),
  paymentMethod: z.enum(["CASH","QR","TRANSFER"]), paymentRef: z.string().optional(),
});

export async function placeOrder(input: z.infer<typeof PlaceSchema>) {
  const session = await getSession();
  if (!session) return { error: "Войдите в систему" };

  const p = PlaceSchema.safeParse(input);
  if (!p.success) return { error: "Неверные данные" };

  const { storeId, items, deliveryFee, deliveryAddress, notes, paymentMethod, paymentRef } = p.data;

  const v = await validateStore(storeId, items);
  if ("error" in v) return v;

  const { store, validItems, computedSub } = v;
  const commission  = calculateCommission(computedSub, Number(store.commissionPct));
  const totalAmount = computedSub + deliveryFee;
  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber, customerId: session.id, storeId,
      subtotal: computedSub, deliveryFee, commission, totalAmount,
      paymentMethod, paymentStatus: "PENDING", paymentRef: paymentRef ?? null,
      deliveryAddress, notes: notes ?? null,
      items: { create: validItems.map(i => ({ productId: i.productId, productName: i.productName, unitPrice: i.unitPrice, unit: i.unit, quantity: i.quantity, totalPrice: i.totalPrice })) },
      statusLogs: { create: { status: "NEW_ORDER", actorId: session.id, actorRole: "customer" } },
      payment: { create: { amount: totalAmount, method: paymentMethod, status: "PENDING", reference: paymentRef ?? null } },
    },
    include: { store: { include: { owner: { select: { id: true } } } } },
  });

  await notifyStoreNewOrder(order.store.owner.id, orderNumber, order.id);
  if (paymentMethod !== "CASH") {
    const admins = await prisma.user.findMany({ where: { role: { in: ["ADMIN","OPERATOR"] } } });
    await notifyAdminsPaymentPending(admins.map((a: typeof admins[number]) => a.id), orderNumber, order.id, paymentMethod);
  }
  return { success: true, orderNumber, orderId: order.id };
}

// ── STORE ACTIONS ─────────────────────────────────────────────────────────────

export async function storeConfirmOrder(orderId: string) {
  const session = await getSession(); if (!session) return { error: "Не авторизован" };
  const order   = await prisma.order.findUnique({ where: { id: orderId }, include: { store: { include: { owner: true } } } });
  if (!order) return { error: "Заказ не найден" };
  if (order.store.owner.id !== session.id && !["ADMIN","OPERATOR"].includes(session.role)) return { error: "Нет доступа" };
  if (order.status !== "NEW_ORDER") return { error: "Неверный статус" };
  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status: "STORE_CONFIRMED", storeConfirmedAt: new Date() } }),
    prisma.orderStatusLog.create({ data: { orderId, status: "STORE_CONFIRMED", actorId: session.id, actorRole: "store" } }),
  ]);
  if (order.customerId) await notifyCustomerOrderConfirmed(order.customerId, order.orderNumber, order.id);
  return { success: true };
}

export async function storeRejectOrder(orderId: string, reason: string) {
  const session = await getSession(); if (!session) return { error: "Не авторизован" };
  const order   = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.status !== "NEW_ORDER") return { error: "Нельзя отклонить" };
  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status: "REJECTED", rejectedReason: reason } }),
    prisma.orderStatusLog.create({ data: { orderId, status: "REJECTED", note: reason, actorId: session.id, actorRole: "store" } }),
  ]);
  return { success: true };
}

export async function storeMarkPreparing(orderId: string) {
  const session = await getSession(); if (!session) return { error: "Не авторизован" };
  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId, status: "STORE_CONFIRMED" }, data: { status: "PREPARING", preparingStartedAt: new Date() } }),
    prisma.orderStatusLog.create({ data: { orderId, status: "PREPARING", actorId: session.id, actorRole: "store" } }),
  ]);
  return { success: true };
}

export async function storeMarkReady(orderId: string) {
  const session = await getSession(); if (!session) return { error: "Не авторизован" };
  const order   = await prisma.order.findUnique({ where: { id: orderId } }); if (!order) return { error: "Не найден" };
  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId, status: { in: ["PREPARING","STORE_CONFIRMED"] } }, data: { status: "READY_FOR_PICKUP", readyAt: new Date() } }),
    prisma.orderStatusLog.create({ data: { orderId, status: "READY_FOR_PICKUP", actorId: session.id, actorRole: "store" } }),
  ]);
  await notifyOnlineCouriersNewJob(order.id, order.orderNumber, "ORDER");
  if (order.customerId) await notifyCustomerOrderReady(order.customerId, order.orderNumber, order.id);
  return { success: true };
}

// ── COURIER ACTIONS ───────────────────────────────────────────────────────────

export async function courierAcceptOrder(orderId: string) {
  const session = await getSession(); if (!session) return { error: "Нет доступа" };
  const courier = await prisma.courier.findUnique({ where: { userId: session.id } });
  if (!courier || !courier.isVerified) return { error: "Профиль курьера не найден" };
  const updated = await prisma.order.updateMany({ where: { id: orderId, status: "READY_FOR_PICKUP", courierId: null }, data: { status: "COURIER_ASSIGNED", courierId: courier.id, courierAssignedAt: new Date() } });
  if (updated.count === 0) return { error: "Заказ уже взят другим курьером" };
  const order = await prisma.order.findUnique({ where: { id: orderId } }); if (!order) return { error: "Не найден" };
  await prisma.orderStatusLog.create({ data: { orderId, status: "COURIER_ASSIGNED", actorId: session.id, actorRole: "courier" } });
  if (order.customerId) await notifyCustomerCourierAssigned(order.customerId, order.orderNumber, order.id, session.name ?? "Курьер");
  return { success: true };
}

export async function courierPickedUp(orderId: string) {
  const session = await getSession(); if (!session) return { error: "Не авторизован" };
  const courier = await prisma.courier.findUnique({ where: { userId: session.id } }); if (!courier) return { error: "Профиль не найден" };
  const order   = await prisma.order.findUnique({ where: { id: orderId, courierId: courier.id } });
  if (!order || order.status !== "COURIER_ASSIGNED") return { error: "Нельзя подтвердить" };
  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status: "PICKED_UP", pickedUpAt: new Date() } }),
    prisma.orderStatusLog.create({ data: { orderId, status: "PICKED_UP", actorId: session.id, actorRole: "courier" } }),
  ]);
  if (order.customerId) await notifyCustomerPickedUp(order.customerId, order.orderNumber, order.id);
  return { success: true };
}

export async function courierDelivered(orderId: string) {
  const session = await getSession(); if (!session) return { error: "Не авторизован" };
  const courier = await prisma.courier.findUnique({ where: { userId: session.id } }); if (!courier) return { error: "Профиль не найден" };
  const order   = await prisma.order.findUnique({ where: { id: orderId, courierId: courier.id } });
  if (!order || order.status !== "PICKED_UP") return { error: "Нельзя подтвердить доставку" };
  const now = new Date();
  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status: "DELIVERED", deliveredAt: now, completedAt: order.paymentMethod === "CASH" ? now : undefined } }),
    prisma.orderStatusLog.create({ data: { orderId, status: "DELIVERED", actorId: session.id, actorRole: "courier" } }),
    prisma.courier.update({ where: { id: courier.id }, data: { totalDeliveries: { increment: 1 } } }),
  ]);
  if (order.customerId) await notifyCustomerDelivered(order.customerId, order.orderNumber, order.id);
  return { success: true };
}

// ── ADMIN ACTIONS ─────────────────────────────────────────────────────────────

export async function adminConfirmPayment(orderId: string) {
  const session = await getSession();
  if (!["ADMIN","OPERATOR"].includes(session?.role ?? "")) return { error: "Нет доступа" };
  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { completedAt: new Date() } }),
    prisma.payment.updateMany({ where: { orderId }, data: { status: "CONFIRMED", confirmedBy: session!.id, confirmedAt: new Date() } }),
    prisma.orderStatusLog.create({ data: { orderId, status: "COMPLETED", actorId: session!.id, actorRole: "admin", note: "Оплата подтверждена" } }),
  ]);
  return { success: true };
}

export async function adminCancelOrder(orderId: string, reason: string) {
  const session = await getSession();
  if (!["ADMIN","OPERATOR"].includes(session?.role ?? "")) return { error: "Нет доступа" };
  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status: "CANCELLED", cancelledReason: reason } }),
    prisma.orderStatusLog.create({ data: { orderId, status: "CANCELLED", note: reason, actorId: session!.id, actorRole: "admin" } }),
  ]);
  return { success: true };
}

export async function adminAssignCourier(orderId: string, courierId: string) {
  const session = await getSession();
  if (!["ADMIN","OPERATOR"].includes(session?.role ?? "")) return { error: "Нет доступа" };
  await prisma.order.update({ where: { id: orderId }, data: { courierId, status: "COURIER_ASSIGNED", courierAssignedAt: new Date() } });
  await prisma.orderStatusLog.create({ data: { orderId, status: "COURIER_ASSIGNED", actorId: session!.id, actorRole: "admin", note: "Ручное назначение" } });
  return { success: true };
}

// ── GET HELPERS ───────────────────────────────────────────────────────────────

export async function getOrderDetail(orderNumber: string) {
  const order = await prisma.order.findUnique({
    where:   { orderNumber },
    include: {
      items:      true,
      store:      { select: { name: true, logoUrl: true, address: true, phone: true } },
      courier:    { include: { user: { select: { name: true, phone: true } } } },
      statusLogs: { orderBy: { createdAt: "asc" } },
    },
  });
  return order;
}

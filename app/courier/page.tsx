import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import CourierDashboard from "@/components/courier/CourierDashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Курьер — anjir" };

export default async function CourierPageMain() {
  const session = await getSession();
  if (!session || !["COURIER","ADMIN","OPERATOR"].includes(session.role)) redirect("/auth");

  const courier = session.role === "COURIER"
    ? await prisma.courier.findUnique({ where: { userId: session.id } })
    : null;

  if (session.role === "COURIER" && !courier) return (
    <div className="min-h-screen flex items-center justify-center px-5 text-center">
      <div><h1 className="text-[20px] font-black mb-2">Профиль курьера не найден</h1><p className="text-black/40">Обратитесь к администратору anjir.</p></div>
    </div>
  );

  const availOrders = await prisma.order.findMany({
    where: { status: "READY_FOR_PICKUP", courierId: null },
    include: { store: { select: { name:true, address:true } }, items: { select: { productName:true, quantity:true, unit:true } } },
    orderBy: { readyAt: "asc" },
  });

  const availDeliveries = await prisma.delivery.findMany({
    where: { status: "REQUESTED", courierId: null },
    orderBy: { createdAt: "asc" },
  });

  const activeOrder = courier ? await prisma.order.findFirst({
    where: { courierId: courier.id, status: { in: ["COURIER_ASSIGNED","PICKED_UP"] } },
    include: { store: { select: { name:true, address:true } }, items: true },
  }) : null;

  const activeDelivery = courier ? await prisma.delivery.findFirst({
    where: { courierId: courier.id, status: { in: ["ACCEPTED","PICKED_UP"] } },
  }) : null;

  const today = new Date(); today.setHours(0,0,0,0);
  const todayCount = courier ? await prisma.order.count({
    where: { courierId: courier.id, status: "DELIVERED", deliveredAt: { gte: today } },
  }) : 0;

  return (
    <CourierDashboard
      courierId={courier?.id ?? null}
      isOnline={courier?.isOnline ?? false}
      courierName={session.name ?? "Курьер"}
      availableOrders={availOrders as any}
      availableDeliveries={availDeliveries as any}
      activeOrder={activeOrder as any}
      activeDelivery={activeDelivery as any}
      todayCount={todayCount}
    />
  );
}

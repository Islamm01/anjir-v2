import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import StoreOrderBoard from "@/components/store/StoreOrderBoard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Магазин — anjir" };

export default async function StorePageMain() {
  const session = await getSession();
  if (!session || !["STORE_OWNER","ADMIN","OPERATOR"].includes(session.role)) redirect("/auth");

  let store = null;
  if (session.role === "STORE_OWNER") {
    store = await prisma.store.findUnique({ where: { userId: session.id } });
    if (!store) return (
      <div className="min-h-screen flex items-center justify-center px-5 text-center">
        <div><h1 className="text-[20px] font-black mb-2">Ваш магазин не подключён</h1><p className="text-black/40">Обратитесь к администратору anjir для регистрации.</p></div>
      </div>
    );
  }

  const where: any = store ? { storeId: store.id } : {};
  const orders = await prisma.order.findMany({
    where: { ...where, status: { in: ["NEW_ORDER","STORE_CONFIRMED","PREPARING","READY_FOR_PICKUP"] } },
    include: { items: true, store: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });

  const today = new Date(); today.setHours(0,0,0,0);
  const stats = await prisma.order.aggregate({
    where: { ...where, createdAt: { gte: today }, status: { notIn: ["CANCELLED","REJECTED"] } },
    _count: true, _sum: { subtotal: true },
  });

  return (
    <StoreOrderBoard
      orders={orders as any}
      storeName={store?.name ?? "Все магазины"}
      storeId={store?.id ?? null}
      todayOrders={stats._count}
      todayRevenue={Number(stats._sum.subtotal ?? 0)}
    />
  );
}

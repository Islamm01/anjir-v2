// app/admin/page.tsx — Admin/Operator real-time operations dashboard
import { redirect }   from "next/navigation";
import { getSession } from "@/lib/auth";
import prisma         from "@/lib/prisma";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic  = "force-dynamic";
export const metadata = { title: "Оператор — anjir" };

export default async function AdminPage() {
  const session = await getSession();
  if (!session || !["ADMIN", "OPERATOR"].includes(session.role)) redirect("/auth");

  // All non-terminal active orders
  const activeOrders = await prisma.order.findMany({
    where:   { status: { notIn: ["DELIVERED", "COMPLETED", "CANCELLED", "REJECTED"] } },
    include: {
      store:   { select: { name: true } },
      courier: { include: { user: { select: { name: true, phone: true } } } },
      items:   { select: { productName: true, quantity: true, unit: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Payments needing manual confirmation (QR + Transfer)
  const pendingPayments = await prisma.payment.findMany({
    where: { status: "PENDING", method: { in: ["QR", "TRANSFER"] } },
    include: {
      order:    { select: { id: true, orderNumber: true, totalAmount: true } },
      delivery: { select: { id: true, deliveryNumber: true, price: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Online couriers available for manual assignment
  const onlineCouriers = await prisma.courier.findMany({
    where:   { isOnline: true, isActive: true, isVerified: true },
    include: { user: { select: { name: true, phone: true } } },
  });

  // Today's stats
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [todayCount, revenueAgg, totalCouriers, activeDeliveries] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: today }, status: { notIn: ["CANCELLED","REJECTED"] } },
      _sum:  { totalAmount: true },
    }),
    prisma.courier.count({ where: { isActive: true } }),
    prisma.delivery.count({ where: { status: { notIn: ["DELIVERED","CANCELLED"] } } }),
  ]);

  return (
    <AdminDashboard
      activeOrders={activeOrders as any}
      pendingPayments={pendingPayments as any}
      onlineCouriers={onlineCouriers as any}
      todayOrders={todayCount}
      todayRevenue={Number(revenueAgg._sum.totalAmount ?? 0)}
      totalCouriers={totalCouriers}
      onlineCourierCount={onlineCouriers.length}
      activeDeliveries={activeDeliveries}
    />
  );
}

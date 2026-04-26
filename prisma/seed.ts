// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function hashPwd(password: string): Promise<string> {
  const salt    = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, "0")).join("");
  const key     = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const bits    = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: 100000 }, key, 256
  );
  const hashHex = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, "0")).join("");
  return `pbkdf2:${saltHex}:${hashHex}`;
}

async function main() {
  console.log("🌱  Seeding Anjir Platform...\n");

  // Guest placeholder — use phone as unique key (works with both old and new schema)
  const guestPhone = "__guest__";
  const existingGuest = await prisma.user.findFirst({
    where: { OR: [{ phone: guestPhone }, { username: "__guest__" } as any] },
  });
  if (!existingGuest) {
    await prisma.user.create({
      data: {
        phone:      guestPhone,
        username:   "__guest__",
        name:       "Гость",
        role:       "CUSTOMER",
        isActive:   true,
        isVerified: false,
      } as any,
    });
  }
  console.log("✅  Guest placeholder");

  // Admin
  const adminPwd = await hashPwd("admin123");
  const adminExists = await prisma.user.findFirst({ where: { username: "admin" } as any });
  if (!adminExists) {
    await prisma.user.create({
      data: {
        username:     "admin",
        passwordHash: adminPwd,
        name:         "Администратор Anjir",
        role:         "ADMIN",
        isVerified:   true,
      } as any,
    });
  } else {
    await prisma.user.update({
      where: { id: adminExists.id },
      data:  { passwordHash: adminPwd } as any,
    });
  }
  console.log("✅  admin / admin123");

  // Store owners
  const [p1, p2, p3] = await Promise.all([
    hashPwd("store1"), hashPwd("store2"), hashPwd("store3"),
  ]);

  async function upsertStoreOwner(username: string, pwd: string, name: string) {
    const existing = await prisma.user.findFirst({ where: { username } as any });
    if (existing) {
      await prisma.user.update({ where: { id: existing.id }, data: { passwordHash: pwd } as any });
      return existing;
    }
    return prisma.user.create({
      data: { username, passwordHash: pwd, name, role: "STORE_OWNER", isVerified: true } as any,
    });
  }

  const o1 = await upsertStoreOwner("akbars", p1, "Акбар Рахимов");
  const o2 = await upsertStoreOwner("zarina", p2, "Зарина Юсупова");
  const o3 = await upsertStoreOwner("davlat", p3, "Давлат Назаров");
  console.log("✅  akbars/store1  zarina/store2  davlat/store3");

  // Stores
  const s1 = await prisma.store.upsert({ where: { slug: "akbars-fruits" }, update: {}, create: { userId: o1.id, slug: "akbars-fruits", name: "Акбарс Фрукт",      description: "Свежие фрукты ежедневно с рынка", phone: "+992901000001", address: "Базари Панҷшанбе, пав. 14", commissionPct: 12, isActive: true, isVerified: true, isOpen: true, openTime: "08:00", closeTime: "21:00", avgPrepMins: 25 } });
  const s2 = await prisma.store.upsert({ where: { slug: "zarina-dried"  }, update: {}, create: { userId: o2.id, slug: "zarina-dried",   name: "Зарина Сухофрукты", description: "Лучшие сухофрукты и орехи",        phone: "+992901000002", address: "ул. Айни, 45",              commissionPct: 10, isActive: true, isVerified: true, isOpen: true, openTime: "09:00", closeTime: "20:00", avgPrepMins: 20 } });
  const s3 = await prisma.store.upsert({ where: { slug: "davlat-market" }, update: {}, create: { userId: o3.id, slug: "davlat-market",  name: "Давлат Маркет",     description: "Фрукты и орехи оптом",              phone: "+992901000003", address: "ул. Ленинабад, 120",         commissionPct: 12, isActive: true, isVerified: true, isOpen: true, openTime: "07:00", closeTime: "22:00", avgPrepMins: 30 } });
  console.log("✅  3 stores");

  // Products
  type ProductRow = { nameRu: string; category: string; price: number; isFeatured: boolean; unit?: string };
  const s1p: ProductRow[] = [
    { nameRu: "Яблоки Фуджи",    category: "FRUITS",      price: 8,   isFeatured: true  },
    { nameRu: "Виноград кишмиш", category: "FRUITS",      price: 14,  isFeatured: true  },
    { nameRu: "Гранат",          category: "FRUITS",      price: 18,  isFeatured: false },
    { nameRu: "Хурма",           category: "FRUITS",      price: 12,  isFeatured: false },
    { nameRu: "Помидоры",        category: "VEGETABLES",  price: 5,   isFeatured: false },
    { nameRu: "Огурцы",          category: "VEGETABLES",  price: 4,   isFeatured: false },
    { nameRu: "Кинза",           category: "HERBS",       price: 3,   isFeatured: false, unit: "пучок" },
  ];
  const s2p: ProductRow[] = [
    { nameRu: "Курага Исфара",   category: "DRIED_FRUITS", price: 45,  isFeatured: true  },
    { nameRu: "Инжир сушёный",   category: "DRIED_FRUITS", price: 55,  isFeatured: true  },
    { nameRu: "Изюм кишмиш",     category: "DRIED_FRUITS", price: 40,  isFeatured: true  },
    { nameRu: "Чернослив",       category: "DRIED_FRUITS", price: 50,  isFeatured: false },
    { nameRu: "Грецкий орех",    category: "NUTS",         price: 80,  isFeatured: true  },
    { nameRu: "Миндаль",         category: "NUTS",         price: 95,  isFeatured: false },
    { nameRu: "Фисташки",        category: "NUTS",         price: 120, isFeatured: false },
    { nameRu: "Арахис жареный",  category: "NUTS",         price: 30,  isFeatured: false },
  ];
  const s3p: ProductRow[] = [
    { nameRu: "Абрикосы",        category: "FRUITS",       price: 10, isFeatured: true  },
    { nameRu: "Персики",         category: "FRUITS",       price: 12, isFeatured: false },
    { nameRu: "Арбуз",           category: "FRUITS",       price: 3,  isFeatured: false },
    { nameRu: "Дыня",            category: "FRUITS",       price: 5,  isFeatured: false },
    { nameRu: "Финики Medjool",  category: "DRIED_FRUITS", price: 90, isFeatured: true  },
    { nameRu: "Кунжут",          category: "NUTS",         price: 35, isFeatured: false },
  ];

  const pairs: Array<[typeof s1, ProductRow[]]> = [
    [s1, s1p], [s2, s2p], [s3, s3p],
  ];
  for (const [store, prods] of pairs) {
    for (const p of prods) {
      const id = `seed-${store.id}-${p.nameRu}`;
      await prisma.product.upsert({
        where:  { id },
        update: { price: p.price },
        create: {
          id, storeId: store.id, nameRu: p.nameRu,
          category: p.category as any,
          price: p.price, unit: p.unit ?? "кг",
          isFeatured: p.isFeatured, isAvailable: true,
        },
      });
    }
  }
  console.log("✅  21 products");

  // Couriers
  async function upsertCourier(username: string, pwd: string, name: string) {
    const existing = await prisma.user.findFirst({ where: { username } as any });
    if (existing) {
      await prisma.user.update({ where: { id: existing.id }, data: { passwordHash: pwd } as any });
      return existing;
    }
    return prisma.user.create({
      data: { username, passwordHash: pwd, name, role: "COURIER", isVerified: true } as any,
    });
  }

  const [cp1, cp2, cp3] = await Promise.all([
    hashPwd("courier1"), hashPwd("courier2"), hashPwd("courier3"),
  ]);
  const c1 = await upsertCourier("firuz",  cp1, "Фируз Ахмадов");
  const c2 = await upsertCourier("sanjar", cp2, "Санjar Каримов");
  const c3 = await upsertCourier("bahrom", cp3, "Баҳром Усмонов");

  await Promise.all([
    prisma.courier.upsert({ where: { userId: c1.id }, update: {}, create: { userId: c1.id, vehicleType: "BIKE", isVerified: true } }),
    prisma.courier.upsert({ where: { userId: c2.id }, update: {}, create: { userId: c2.id, vehicleType: "CAR",  isVerified: true } }),
    prisma.courier.upsert({ where: { userId: c3.id }, update: {}, create: { userId: c3.id, vehicleType: "BIKE", isVerified: true } }),
  ]);
  console.log("✅  firuz/courier1  sanjar/courier2  bahrom/courier3\n");
  console.log("🎉  Done! Login at /auth");
}

main().catch(console.error).finally(() => prisma.$disconnect());
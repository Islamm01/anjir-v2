// prisma/seed.ts
import { PrismaClient, ProductCategory } from "@prisma/client";

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

type ProductInput = {
  nameRu:     string;
  category:   ProductCategory;
  price:      number;
  isFeatured: boolean;
  unit?:      string;
};

async function main() {
  console.log("🌱  Seeding Anjir Platform...\n");

  // ── Guest placeholder (needed for guest orders — satisfies NOT NULL on customerId) ──
  await prisma.user.upsert({
    where:  { username: "__guest__" },
    update: {},
    create: {
      username:   "__guest__",
      name:       "Гость",
      role:       "CUSTOMER",
      isActive:   true,
      isVerified: false,
    },
  });
  console.log("✅  Guest placeholder user");

  // ── Admin ──────────────────────────────────────────────────────────────────
  const adminPwd = await hashPwd("admin123");
  const _admin   = await prisma.user.upsert({
    where:  { username: "admin" },
    update: { passwordHash: adminPwd },
    create: {
      username:     "admin",
      passwordHash: adminPwd,
      name:         "Администратор Anjir",
      role:         "ADMIN",
      isVerified:   true,
    },
  });
  console.log("✅  Admin      admin / admin123");

  // ── Store owners ───────────────────────────────────────────────────────────
  const [p1, p2, p3] = await Promise.all([hashPwd("store1"), hashPwd("store2"), hashPwd("store3")]);

  const [o1, o2, o3] = await Promise.all([
    prisma.user.upsert({
      where:  { username: "akbars" },
      update: { passwordHash: p1 },
      create: { username: "akbars", passwordHash: p1, name: "Акбар Рахимов",  role: "STORE_OWNER", isVerified: true },
    }),
    prisma.user.upsert({
      where:  { username: "zarina" },
      update: { passwordHash: p2 },
      create: { username: "zarina", passwordHash: p2, name: "Зарина Юсупова", role: "STORE_OWNER", isVerified: true },
    }),
    prisma.user.upsert({
      where:  { username: "davlat" },
      update: { passwordHash: p3 },
      create: { username: "davlat", passwordHash: p3, name: "Давлат Назаров", role: "STORE_OWNER", isVerified: true },
    }),
  ]);
  console.log("✅  Store 1    akbars / store1");
  console.log("✅  Store 2    zarina / store2");
  console.log("✅  Store 3    davlat / store3");

  // ── Stores ─────────────────────────────────────────────────────────────────
  const s1 = await prisma.store.upsert({
    where:  { slug: "akbars-fruits" },
    update: {},
    create: {
      userId: o1.id, slug: "akbars-fruits", name: "Акбарс Фрукт",
      description: "Свежие фрукты ежедневно с рынка",
      phone: "+992901000001", address: "Базари Панҷшанбе, пав. 14",
      commissionPct: 12, isActive: true, isVerified: true, isOpen: true,
      openTime: "08:00", closeTime: "21:00", avgPrepMins: 25,
    },
  });
  const s2 = await prisma.store.upsert({
    where:  { slug: "zarina-dried" },
    update: {},
    create: {
      userId: o2.id, slug: "zarina-dried", name: "Зарина Сухофрукты",
      description: "Лучшие сухофрукты и орехи",
      phone: "+992901000002", address: "ул. Айни, 45",
      commissionPct: 10, isActive: true, isVerified: true, isOpen: true,
      openTime: "09:00", closeTime: "20:00", avgPrepMins: 20,
    },
  });
  const s3 = await prisma.store.upsert({
    where:  { slug: "davlat-market" },
    update: {},
    create: {
      userId: o3.id, slug: "davlat-market", name: "Давлат Маркет",
      description: "Фрукты и орехи оптом и в розницу",
      phone: "+992901000003", address: "ул. Ленинабад, 120",
      commissionPct: 12, isActive: true, isVerified: true, isOpen: true,
      openTime: "07:00", closeTime: "22:00", avgPrepMins: 30,
    },
  });
  console.log("✅  3 stores");

  // ── Products ───────────────────────────────────────────────────────────────
  const s1Products: ProductInput[] = [
    { nameRu: "Яблоки Фуджи",    category: "FRUITS",      price: 8,  isFeatured: true  },
    { nameRu: "Виноград кишмиш", category: "FRUITS",      price: 14, isFeatured: true  },
    { nameRu: "Гранат",          category: "FRUITS",      price: 18, isFeatured: false },
    { nameRu: "Хурма",           category: "FRUITS",      price: 12, isFeatured: false },
    { nameRu: "Помидоры",        category: "VEGETABLES",  price: 5,  isFeatured: false },
    { nameRu: "Огурцы",          category: "VEGETABLES",  price: 4,  isFeatured: false },
    { nameRu: "Кинза",           category: "HERBS",       price: 3,  isFeatured: false, unit: "пучок" },
  ];

  const s2Products: ProductInput[] = [
    { nameRu: "Курага Исфара",  category: "DRIED_FRUITS", price: 45,  isFeatured: true  },
    { nameRu: "Инжир сушёный",  category: "DRIED_FRUITS", price: 55,  isFeatured: true  },
    { nameRu: "Изюм кишмиш",    category: "DRIED_FRUITS", price: 40,  isFeatured: true  },
    { nameRu: "Чернослив",      category: "DRIED_FRUITS", price: 50,  isFeatured: false },
    { nameRu: "Грецкий орех",   category: "NUTS",         price: 80,  isFeatured: true  },
    { nameRu: "Миндаль",        category: "NUTS",         price: 95,  isFeatured: false },
    { nameRu: "Фисташки",       category: "NUTS",         price: 120, isFeatured: false },
    { nameRu: "Арахис жареный", category: "NUTS",         price: 30,  isFeatured: false },
  ];

  const s3Products: ProductInput[] = [
    { nameRu: "Абрикосы",       category: "FRUITS",       price: 10, isFeatured: true  },
    { nameRu: "Персики",        category: "FRUITS",       price: 12, isFeatured: false },
    { nameRu: "Арбуз",          category: "FRUITS",       price: 3,  isFeatured: false },
    { nameRu: "Дыня",           category: "FRUITS",       price: 5,  isFeatured: false },
    { nameRu: "Финики Medjool", category: "DRIED_FRUITS", price: 90, isFeatured: true  },
    { nameRu: "Кунжут",         category: "NUTS",         price: 35, isFeatured: false },
  ];

  const storeProductPairs: Array<[typeof s1, ProductInput[]]> = [
    [s1, s1Products],
    [s2, s2Products],
    [s3, s3Products],
  ];

  for (const [store, prods] of storeProductPairs) {
    for (const p of prods) {
      const id = `seed-${store.id}-${p.nameRu}`;
      await prisma.product.upsert({
        where:  { id },
        update: { price: p.price },
        create: {
          id,
          storeId:    store.id,
          nameRu:     p.nameRu,
          category:   p.category,
          price:      p.price,
          unit:       p.unit ?? "кг",
          isFeatured: p.isFeatured,
          isAvailable: true,
        },
      });
    }
  }
  console.log("✅  21 products");

  // ── Couriers ───────────────────────────────────────────────────────────────
  const [cp1, cp2, cp3] = await Promise.all([
    hashPwd("courier1"), hashPwd("courier2"), hashPwd("courier3"),
  ]);

  const [c1, c2, c3] = await Promise.all([
    prisma.user.upsert({
      where:  { username: "firuz" },
      update: { passwordHash: cp1 },
      create: { username: "firuz",  passwordHash: cp1, name: "Фируз Ахмадов",  role: "COURIER", isVerified: true },
    }),
    prisma.user.upsert({
      where:  { username: "sanjar" },
      update: { passwordHash: cp2 },
      create: { username: "sanjar", passwordHash: cp2, name: "Санjar Каримов", role: "COURIER", isVerified: true },
    }),
    prisma.user.upsert({
      where:  { username: "bahrom" },
      update: { passwordHash: cp3 },
      create: { username: "bahrom", passwordHash: cp3, name: "Баҳром Усмонов", role: "COURIER", isVerified: true },
    }),
  ]);

  await Promise.all([
    prisma.courier.upsert({ where: { userId: c1.id }, update: {}, create: { userId: c1.id, vehicleType: "BIKE", isVerified: true } }),
    prisma.courier.upsert({ where: { userId: c2.id }, update: {}, create: { userId: c2.id, vehicleType: "CAR",  isVerified: true } }),
    prisma.courier.upsert({ where: { userId: c3.id }, update: {}, create: { userId: c3.id, vehicleType: "BIKE", isVerified: true } }),
  ]);
  console.log("✅  Courier 1  firuz  / courier1");
  console.log("✅  Courier 2  sanjar / courier2");
  console.log("✅  Courier 3  bahrom / courier3");

  console.log("\n🎉  Ready!\n");
  console.log("  Admin:    admin   / admin123");
  console.log("  Store 1:  akbars  / store1");
  console.log("  Store 2:  zarina  / store2");
  console.log("  Courier:  firuz   / courier1");
  console.log("  Customers: no login — Quick Order\n");
}

main().catch(console.error).finally(() => prisma.$disconnect());

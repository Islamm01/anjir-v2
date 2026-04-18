import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  console.log("Seeding Anjir Platform...");
  const admin = await prisma.user.upsert({ where:{phone:"+992900000000"}, update:{}, create:{phone:"+992900000000",name:"Администратор Anjir",role:"ADMIN",isVerified:true} });
  const [o1,o2,o3] = await Promise.all([
    prisma.user.upsert({ where:{phone:"+992901000001"}, update:{}, create:{phone:"+992901000001",name:"Акбар Рахимов",role:"STORE_OWNER",isVerified:true} }),
    prisma.user.upsert({ where:{phone:"+992901000002"}, update:{}, create:{phone:"+992901000002",name:"Зарина Юсупова",role:"STORE_OWNER",isVerified:true} }),
    prisma.user.upsert({ where:{phone:"+992901000003"}, update:{}, create:{phone:"+992901000003",name:"Давлат Назаров",role:"STORE_OWNER",isVerified:true} }),
  ]);
  const s1 = await prisma.store.upsert({ where:{slug:"akbars-fruits"}, update:{}, create:{userId:o1.id,slug:"akbars-fruits",name:"Акбарс Фрукт",description:"Свежие фрукты ежедневно с рынка",phone:"+992901000001",address:"Базари Панҷшанбе, пав. 14",commissionPct:12,isActive:true,isVerified:true,isOpen:true,openTime:"08:00",closeTime:"21:00",avgPrepMins:25} });
  const s2 = await prisma.store.upsert({ where:{slug:"zarina-dried"}, update:{}, create:{userId:o2.id,slug:"zarina-dried",name:"Зарина Сухофрукты",description:"Лучшие сухофрукты и орехи",phone:"+992901000002",address:"ул. Айни, 45",commissionPct:10,isActive:true,isVerified:true,isOpen:true,openTime:"09:00",closeTime:"20:00",avgPrepMins:20} });
  const s3 = await prisma.store.upsert({ where:{slug:"davlat-market"}, update:{}, create:{userId:o3.id,slug:"davlat-market",name:"Давлат Маркет",description:"Фрукты и орехи оптом и в розницу",phone:"+992901000003",address:"ул. Ленинабад, 120",commissionPct:12,isActive:true,isVerified:true,isOpen:true,openTime:"07:00",closeTime:"22:00",avgPrepMins:30} });
  const s1p = [{nameRu:"Яблоки Фуджи",category:"FRUITS",price:8,isFeatured:true},{nameRu:"Виноград кишмиш",category:"FRUITS",price:14,isFeatured:true},{nameRu:"Гранат",category:"FRUITS",price:18,isFeatured:false},{nameRu:"Хурма",category:"FRUITS",price:12,isFeatured:false},{nameRu:"Помидоры",category:"VEGETABLES",price:5,isFeatured:false},{nameRu:"Огурцы",category:"VEGETABLES",price:4,isFeatured:false},{nameRu:"Кинза",category:"HERBS",price:3,isFeatured:false}];
  const s2p = [{nameRu:"Курага Исфара",category:"DRIED_FRUITS",price:45,isFeatured:true},{nameRu:"Инжир сушёный",category:"DRIED_FRUITS",price:55,isFeatured:true},{nameRu:"Изюм кишмиш",category:"DRIED_FRUITS",price:40,isFeatured:true},{nameRu:"Чернослив",category:"DRIED_FRUITS",price:50,isFeatured:false},{nameRu:"Грецкий орех",category:"NUTS",price:80,isFeatured:true},{nameRu:"Миндаль",category:"NUTS",price:95,isFeatured:false},{nameRu:"Фисташки",category:"NUTS",price:120,isFeatured:false},{nameRu:"Арахис жареный",category:"NUTS",price:30,isFeatured:false}];
  const s3p = [{nameRu:"Абрикосы",category:"FRUITS",price:10,isFeatured:true},{nameRu:"Персики",category:"FRUITS",price:12,isFeatured:false},{nameRu:"Арбуз",category:"FRUITS",price:3,isFeatured:false},{nameRu:"Дыня",category:"FRUITS",price:5,isFeatured:false},{nameRu:"Финики Medjool",category:"DRIED_FRUITS",price:90,isFeatured:true},{nameRu:"Кунжут",category:"NUTS",price:35,isFeatured:false}];
  for (const [store, prods] of [[s1,s1p],[s2,s2p],[s3,s3p]] as any[]) {
    for (const p of prods) {
      await prisma.product.upsert({ where:{id:`seed-${store.id}-${p.nameRu}`}, update:{price:p.price}, create:{id:`seed-${store.id}-${p.nameRu}`,storeId:store.id,nameRu:p.nameRu,category:p.category,price:p.price,unit:"кг",isFeatured:p.isFeatured,isAvailable:true} });
    }
  }
  const [c1,c2,c3] = await Promise.all([
    prisma.user.upsert({ where:{phone:"+992902000001"}, update:{}, create:{phone:"+992902000001",name:"Фируз Ахмадов",role:"COURIER",isVerified:true} }),
    prisma.user.upsert({ where:{phone:"+992902000002"}, update:{}, create:{phone:"+992902000002",name:"Санjar Каримов",role:"COURIER",isVerified:true} }),
    prisma.user.upsert({ where:{phone:"+992902000003"}, update:{}, create:{phone:"+992902000003",name:"Баҳром Усмонов",role:"COURIER",isVerified:true} }),
  ]);
  await Promise.all([
    prisma.courier.upsert({ where:{userId:c1.id}, update:{}, create:{userId:c1.id,vehicleType:"BIKE",isVerified:true} }),
    prisma.courier.upsert({ where:{userId:c2.id}, update:{}, create:{userId:c2.id,vehicleType:"CAR",isVerified:true} }),
    prisma.courier.upsert({ where:{userId:c3.id}, update:{}, create:{userId:c3.id,vehicleType:"BIKE",isVerified:true} }),
  ]);
  console.log("Anjir Platform ready!");
  console.log("Admin: +992900000000 | Store: +992901000001 | Courier: +992902000001");
  console.log("DEV: OTP is printed to console, any 6-digit code works");
}
main().catch(console.error).finally(() => prisma.$disconnect());

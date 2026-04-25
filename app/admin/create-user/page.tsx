// app/admin/create-user/page.tsx
import { redirect }   from "next/navigation";
import { getSession } from "@/lib/auth";
import CreateUserForm from "./CreateUserForm";

export const metadata = { title: "Создать пользователя — anjir" };

export default async function CreateUserPage() {
  const session = await getSession();
  if (session?.role !== "ADMIN") redirect("/admin");
  return (
    <div className="min-h-screen bg-[#f0ede8] p-6">
      <div className="max-w-lg mx-auto">
        <h1 className="text-[22px] font-black text-black mb-6">Создать пользователя</h1>
        <CreateUserForm />
      </div>
    </div>
  );
}
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { readPortfolio } from "@/lib/db";
import { AdminDashboard } from "@/components/admin-dashboard";

export const metadata = {
  title: "Studio — FEYBER",
};

export default async function StudioPage() {
  if (!(await isAdmin())) {
    redirect("/adminku/login");
  }

  const data = await readPortfolio();
  return <AdminDashboard initialItems={data.items} />;
}

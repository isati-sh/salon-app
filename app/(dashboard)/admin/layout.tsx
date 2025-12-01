import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["admin"]);

  const handleSignOut = async () => {
    "use server";
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/admin" className="text-xl font-bold">
            Admin Dashboard
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/admin/appointments" className="hover:underline">
              Appointments
            </Link>
            <Link href="/admin/services" className="hover:underline">
              Services
            </Link>
            <Link href="/admin/employees" className="hover:underline">
              Employees
            </Link>
            <Link href="/admin/promotions" className="hover:underline">
              Promotions
            </Link>
            <Link href="/admin/analytics" className="hover:underline">
              Analytics
            </Link>
            <Link href="/admin/settings" className="hover:underline">
              Settings
            </Link>
            <form action={handleSignOut}>
              <Button type="submit" variant="outline">
                Sign Out
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}


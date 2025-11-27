import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["employee"]);

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
          <Link href="/employee" className="text-xl font-bold">
            Employee Dashboard
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/employee/schedule" className="hover:underline">
              Schedule
            </Link>
            <Link href="/employee/appointments" className="hover:underline">
              Appointments
            </Link>
            <Link href="/employee/availability" className="hover:underline">
              Availability
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


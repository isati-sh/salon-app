import Link from "next/link";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["customer"]);

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
          <Link href="/customer" className="text-xl font-bold">
            Customer Dashboard
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/customer/appointments" className="hover:underline">
              Appointments
            </Link>
            <Link href="/customer/gift-cards" className="hover:underline">
              Gift Cards
            </Link>
            <Link href="/customer/profile" className="hover:underline">
              Profile
            </Link>
            <Link href="/book" className="hover:underline">
              Book Appointment
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


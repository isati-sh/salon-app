import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold">
            Salon App
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/services" className="hover:underline">
              Services
            </Link>
            <Link href="/gallery" className="hover:underline">
              Gallery
            </Link>
            <Link href="/team" className="hover:underline">
              Team
            </Link>
            <Link href="/reviews" className="hover:underline">
              Reviews
            </Link>
            <Link href="/about" className="hover:underline">
              About
            </Link>
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
            {user ? (
              <Button asChild variant="outline">
                <Link href={user.profile?.role === "admin" ? "/admin" : user.profile?.role === "employee" ? "/employee" : "/customer"}>
                  Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-gray-600">
          <p>&copy; 2024 Salon App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}


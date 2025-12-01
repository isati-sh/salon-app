import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminServicesPage() {
  await requireRole(["admin"]);
  const supabase = await createClient();

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Services</h1>
        <Button asChild>
          <Link href="/admin/services/new">Add New Service</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services && services.length > 0 ? (
          services.map((service: any) => (
            <Card key={service.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{service.name}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      service.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {service.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Price:</span>
                    <span className="font-semibold">${service.base_price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Duration:</span>
                    <span>{service.duration_minutes} minutes</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/services/${service.id}/edit`}>Edit</Link>
                  </Button>
                  <form action={`/admin/services/${service.id}/toggle`} method="POST">
                    <Button
                      type="submit"
                      size="sm"
                      variant={service.is_active ? "outline" : "default"}
                    >
                      {service.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-600">No services found</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}


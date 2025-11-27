import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: employees } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "employee");

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Our Team</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees && employees.length > 0 ? (
          employees.map((employee) => (
            <Card key={employee.id}>
              <CardHeader>
                <CardTitle>{employee.full_name}</CardTitle>
                <CardDescription>Stylist</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {employee.email || "No email provided"}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-600">
            No team members available.
          </p>
        )}
      </div>
    </div>
  );
}


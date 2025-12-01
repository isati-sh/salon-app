import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import EditServiceForm from "./edit-form";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const { id } = await params;

  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (!service) {
    redirect("/admin/services");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <EditServiceForm service={service} />
    </div>
  );
}


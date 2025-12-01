import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import EditPromotionForm from "./edit-form";

export default async function EditPromotionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const { id } = await params;

  const { data: promotion } = await supabase
    .from("promotions")
    .select("*")
    .eq("id", id)
    .single();

  if (!promotion) {
    redirect("/admin/promotions");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <EditPromotionForm promotion={promotion} />
    </div>
  );
}


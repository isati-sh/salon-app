import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import EditProfileForm from "./edit-form";

export default async function CustomerProfilePage() {
  const user = await requireRole(["customer"]);
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/customer");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <EditProfileForm profile={profile} />
    </div>
  );
}


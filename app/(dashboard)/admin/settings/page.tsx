import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSettingsForm from "./settings-form";

export default async function AdminSettingsPage() {
  const user = await requireRole(["admin"]);
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/admin");
  }

  // Get auth user email
  const { data: { user: authUser } } = await supabase.auth.getUser();

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminSettingsForm 
        profile={profile} 
        authEmail={authUser?.email || profile.email || ""}
      />
    </div>
  );
}


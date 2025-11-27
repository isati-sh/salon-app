/**
 * Script to create an employee user
 * Run with: npx tsx scripts/create-employee.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createEmployee() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Error: Missing Supabase environment variables");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log("Creating employee user...\n");

  const email = await question("Email: ");
  const password = await question("Password: ");
  const fullName = await question("Full Name: ");
  const phone = await question("Phone (optional, press Enter to skip): ");

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    console.error("Error creating auth user:", authError?.message);
    process.exit(1);
  }

  console.log("✓ Auth user created");

  // Create profile
  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id,
    role: "employee",
    full_name: fullName,
    email: email,
    phone: phone || null,
  });

  if (profileError) {
    console.error("Error creating profile:", profileError.message);
    await supabase.auth.admin.deleteUser(authData.user.id);
    process.exit(1);
  }

  console.log("✓ Profile created");
  console.log("\nEmployee user created successfully!");
  console.log(`User ID: ${authData.user.id}`);
  console.log("\nNext step: Set up employee shifts in Supabase SQL Editor");

  rl.close();
}

createEmployee().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});


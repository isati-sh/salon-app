/**
 * Script to create an admin user
 * Run with: npx tsx scripts/create-admin.ts
 * 
 * This script helps you create an admin user in Supabase
 * You'll need to provide the email and password
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

async function createAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Error: Missing Supabase environment variables");
    console.error("Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log("Creating admin user...\n");

  const email = await question("Email: ");
  const password = await question("Password: ");
  const fullName = await question("Full Name: ");

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
    role: "admin",
    full_name: fullName,
    email: email,
  });

  if (profileError) {
    console.error("Error creating profile:", profileError.message);
    // Try to clean up auth user
    await supabase.auth.admin.deleteUser(authData.user.id);
    process.exit(1);
  }

  console.log("✓ Profile created");
  console.log("\nAdmin user created successfully!");
  console.log(`User ID: ${authData.user.id}`);
  console.log(`Email: ${email}`);
  console.log("\nYou can now log in at /login");

  rl.close();
}

createAdmin().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});


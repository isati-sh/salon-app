"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsForm({ 
  profile, 
  authEmail 
}: { 
  profile: any; 
  authEmail: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "email" | "password">("profile");
  
  const [profileData, setProfileData] = useState({
    full_name: profile.full_name || "",
    phone: profile.phone || "",
  });

  const [emailData, setEmailData] = useState({
    email: authEmail,
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        router.refresh();
        alert("Profile updated successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/settings/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        router.refresh();
        alert("Email updated successfully! Please check your new email for confirmation.");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update email");
      }
    } catch (error) {
      console.error("Error updating email:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert("New passwords do not match");
      return;
    }

    if (passwordData.new_password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        }),
      });

      if (response.ok) {
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
        alert("Password updated successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 font-medium ${
            activeTab === "profile"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-600"
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab("email")}
          className={`px-4 py-2 font-medium ${
            activeTab === "email"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-600"
          }`}
        >
          Email
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`px-4 py-2 font-medium ${
            activeTab === "password"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-600"
          }`}
        >
          Password
        </button>
      </div>

      {activeTab === "profile" && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={profileData.full_name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, full_name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === "email" && (
        <Card>
          <CardHeader>
            <CardTitle>Change Email</CardTitle>
            <CardDescription>Update your email address</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">New Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={emailData.email}
                  onChange={(e) =>
                    setEmailData({ ...emailData, email: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-gray-500">
                  You will receive a confirmation email at the new address
                </p>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Email"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === "password" && (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password *</Label>
                <Input
                  id="current_password"
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      current_password: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password">New Password *</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      new_password: e.target.value,
                    })
                  }
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500">Minimum 6 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password *</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirm_password: e.target.value,
                    })
                  }
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


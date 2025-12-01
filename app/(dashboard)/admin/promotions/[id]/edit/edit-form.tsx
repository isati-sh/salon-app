"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditPromotionForm({ promotion }: { promotion: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const segment = typeof promotion.segment === 'string' ? JSON.parse(promotion.segment || '{}') : (promotion.segment || {});
  
  const [formData, setFormData] = useState({
    title: promotion.title || "",
    description: promotion.description || "",
    banner_image_url: promotion.banner_image_url || "",
    starts_at: promotion.starts_at
      ? new Date(promotion.starts_at).toISOString().slice(0, 16)
      : "",
    ends_at: promotion.ends_at
      ? new Date(promotion.ends_at).toISOString().slice(0, 16)
      : "",
    is_active: promotion.is_active,
    show_on_website: segment?.show_on_website || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/promotions/${promotion.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admin/promotions");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update promotion");
      }
    } catch (error) {
      console.error("Error updating promotion:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Promotion</CardTitle>
        <CardDescription>Update promotion details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner_image_url">Banner Image URL</Label>
            <Input
              id="banner_image_url"
              type="url"
              value={formData.banner_image_url}
              onChange={(e) =>
                setFormData({ ...formData, banner_image_url: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="starts_at">Start Date & Time</Label>
              <Input
                id="starts_at"
                type="datetime-local"
                value={formData.starts_at}
                onChange={(e) =>
                  setFormData({ ...formData, starts_at: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ends_at">End Date & Time</Label>
              <Input
                id="ends_at"
                type="datetime-local"
                value={formData.ends_at}
                onChange={(e) =>
                  setFormData({ ...formData, ends_at: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="show_on_website"
                checked={formData.show_on_website}
                onChange={(e) =>
                  setFormData({ ...formData, show_on_website: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="show_on_website">Show on Website</Label>
              <p className="text-xs text-gray-500">
                Display this promotion banner on the website homepage
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Promotion"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


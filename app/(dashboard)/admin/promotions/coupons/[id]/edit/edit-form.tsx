"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditCouponForm({ coupon }: { coupon: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    code: coupon.code || "",
    description: coupon.description || "",
    discount_type: coupon.discount_type || "percentage",
    discount_value: coupon.discount_value?.toString() || "",
    min_spend: coupon.min_spend?.toString() || "",
    valid_from: coupon.valid_from
      ? new Date(coupon.valid_from).toISOString().slice(0, 16)
      : "",
    valid_to: coupon.valid_to
      ? new Date(coupon.valid_to).toISOString().slice(0, 16)
      : "",
    max_uses: coupon.max_uses?.toString() || "",
    max_uses_per_customer: coupon.max_uses_per_customer?.toString() || "",
    is_active: coupon.is_active,
    promotion_id: coupon.promotion_id?.toString() || "",
  });

  useEffect(() => {
    // Fetch promotions for dropdown
    fetch("/api/admin/promotions")
      .then((res) => res.json())
      .then((data) => {
        if (data.promotions) {
          setPromotions(data.promotions);
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/promotions/coupons/${coupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          discount_value: parseFloat(formData.discount_value),
          min_spend: formData.min_spend ? parseFloat(formData.min_spend) : null,
          max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
          max_uses_per_customer: formData.max_uses_per_customer
            ? parseInt(formData.max_uses_per_customer)
            : null,
          promotion_id: formData.promotion_id || null,
        }),
      });

      if (response.ok) {
        router.push("/admin/promotions");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update coupon");
      }
    } catch (error) {
      console.error("Error updating coupon:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Coupon</CardTitle>
        <CardDescription>Update coupon details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Coupon Code *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              required
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount_type">Discount Type *</Label>
              <select
                id="discount_type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.discount_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discount_type: e.target.value as "percentage" | "fixed_amount",
                  })
                }
                required
              >
                <option value="percentage">Percentage</option>
                <option value="fixed_amount">Fixed Amount</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_value">
                Discount Value * ({formData.discount_type === "percentage" ? "%" : "$"})
              </Label>
              <Input
                id="discount_value"
                type="number"
                min="0"
                step={formData.discount_type === "percentage" ? "1" : "0.01"}
                max={formData.discount_type === "percentage" ? "100" : undefined}
                value={formData.discount_value}
                onChange={(e) =>
                  setFormData({ ...formData, discount_value: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="min_spend">Minimum Spend ($)</Label>
            <Input
              id="min_spend"
              type="number"
              min="0"
              step="0.01"
              value={formData.min_spend}
              onChange={(e) =>
                setFormData({ ...formData, min_spend: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valid_from">Valid From</Label>
              <Input
                id="valid_from"
                type="datetime-local"
                value={formData.valid_from}
                onChange={(e) =>
                  setFormData({ ...formData, valid_from: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valid_to">Valid To</Label>
              <Input
                id="valid_to"
                type="datetime-local"
                value={formData.valid_to}
                onChange={(e) =>
                  setFormData({ ...formData, valid_to: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_uses">Max Uses (Total)</Label>
              <Input
                id="max_uses"
                type="number"
                min="1"
                value={formData.max_uses}
                onChange={(e) =>
                  setFormData({ ...formData, max_uses: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_uses_per_customer">Max Uses Per Customer</Label>
              <Input
                id="max_uses_per_customer"
                type="number"
                min="1"
                value={formData.max_uses_per_customer}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_uses_per_customer: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="promotion_id">Associated Promotion (optional)</Label>
            <select
              id="promotion_id"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formData.promotion_id}
              onChange={(e) =>
                setFormData({ ...formData, promotion_id: e.target.value })
              }
            >
              <option value="">None</option>
              {promotions.map((promo) => (
                <option key={promo.id} value={promo.id}>
                  {promo.title}
                </option>
              ))}
            </select>
          </div>

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

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Coupon"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


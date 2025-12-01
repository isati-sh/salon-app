"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PurchaseGiftCardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    recipient_name: "",
    recipient_email: "",
    message: "",
    expires_at: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/customer/gift-cards/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/customer/gift-cards?success=${data.giftCard.code}`);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to purchase gift card");
      }
    } catch (error) {
      console.error("Error purchasing gift card:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Purchase Gift Card</CardTitle>
          <CardDescription>
            Buy a gift card for yourself or someone else
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($) *</Label>
              <Input
                id="amount"
                type="number"
                min="10"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
              <p className="text-xs text-gray-500">Minimum amount: $10</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient_name">Recipient Name (optional)</Label>
              <Input
                id="recipient_name"
                value={formData.recipient_name}
                onChange={(e) =>
                  setFormData({ ...formData, recipient_name: e.target.value })
                }
                placeholder="Leave empty if purchasing for yourself"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient_email">Recipient Email (optional)</Label>
              <Input
                id="recipient_email"
                type="email"
                value={formData.recipient_email}
                onChange={(e) =>
                  setFormData({ ...formData, recipient_email: e.target.value })
                }
                placeholder="Leave empty if purchasing for yourself"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (optional)</Label>
              <textarea
                id="message"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Add a personal message"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expires_at">Expiry Date (optional)</Label>
              <Input
                id="expires_at"
                type="date"
                value={formData.expires_at}
                onChange={(e) =>
                  setFormData({ ...formData, expires_at: e.target.value })
                }
                min={new Date().toISOString().split("T")[0]}
              />
              <p className="text-xs text-gray-500">
                Leave empty for no expiration
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-semibold mb-1">Total Amount</p>
              <p className="text-2xl font-bold">
                ${formData.amount ? parseFloat(formData.amount).toFixed(2) : "0.00"}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formData.amount}>
                {loading ? "Processing..." : "Purchase Gift Card"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function CreateReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [rating, setRating] = useState(0);
  const [wouldReturn, setWouldReturn] = useState<boolean | null>(null);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/reviews/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: parseInt(id),
          rating,
          wouldReturn,
          comments,
        }),
      });

      if (response.ok) {
        router.push("/customer/reviews");
      } else {
        alert("Failed to submit review");
      }
    } catch (error) {
      console.error("Review submission error:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Leave a Review</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Rating</Label>
              <div className="flex gap-2 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    className={`text-4xl ${
                      i < rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Would you come again?</Label>
              <div className="flex gap-4 mt-2">
                <Button
                  type="button"
                  variant={wouldReturn === true ? "default" : "outline"}
                  onClick={() => setWouldReturn(true)}
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={wouldReturn === false ? "default" : "outline"}
                  onClick={() => setWouldReturn(false)}
                >
                  No
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="comments">Comments (optional)</Label>
              <textarea
                id="comments"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || rating === 0 || wouldReturn === null}
              >
                {loading ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";

export default async function ReviewsPage() {
  const supabase = await createClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `
      *,
      customer:profiles!reviews_customer_id_fkey(full_name),
      employee:profiles!reviews_employee_id_fkey(full_name)
    `
    )
    .eq("visible_publicly", true)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Customer Reviews</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews && reviews.length > 0 ? (
          reviews.map((review: any) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-2xl ${
                        i < review.rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                {review.comments && (
                  <p className="mb-4">{review.comments}</p>
                )}
                <div className="text-sm text-gray-600">
                  <p>
                    {review.customer?.full_name || "Anonymous"} -{" "}
                    {review.employee?.full_name}
                  </p>
                  <p>
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-600">
            No reviews yet.
          </p>
        )}
      </div>
    </div>
  );
}


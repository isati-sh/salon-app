import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";

export default async function HomePage() {
  const supabase = await createClient();
  
  // Get promotions that should be shown on website
  const { data: promotions } = await supabase
    .from("promotions")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // Filter promotions that have show_on_website enabled
  const websitePromotions = promotions?.filter((promo: any) => {
    if (!promo.segment) return false;
    const segment = typeof promo.segment === 'string' ? JSON.parse(promo.segment) : promo.segment;
    return segment?.show_on_website === true;
  }) || [];

  // Check if promotion is currently active (within date range)
  const activePromotions = websitePromotions.filter((promo: any) => {
    const now = new Date();
    const startsAt = promo.starts_at ? new Date(promo.starts_at) : null;
    const endsAt = promo.ends_at ? new Date(promo.ends_at) : null;
    
    if (startsAt && now < startsAt) return false;
    if (endsAt && now > endsAt) return false;
    return true;
  });

  return (
    <div>
      {/* Promotional Banners */}
      {activePromotions.length > 0 && (
        <section className="bg-primary text-primary-foreground py-4">
          <div className="container mx-auto px-4">
            {activePromotions.map((promo: any) => (
              <div key={promo.id} className="text-center">
                {promo.banner_image_url ? (
                  <img
                    src={promo.banner_image_url}
                    alt={promo.title}
                    className="max-w-full h-auto mx-auto mb-2"
                  />
                ) : null}
                <h3 className="text-xl font-bold mb-1">{promo.title}</h3>
                {promo.description && (
                  <p className="text-sm opacity-90">{promo.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to Our Salon</h1>
          <p className="text-xl mb-8">Experience luxury and style</p>
          <Button asChild size="lg">
            <Link href="/book">Book Appointment</Link>
          </Button>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Haircuts</CardTitle>
                <CardDescription>Professional haircuts for all styles</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">$30+</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Hair Color</CardTitle>
                <CardDescription>Expert coloring services</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">$80+</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Styling</CardTitle>
                <CardDescription>Special occasion styling</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">$50+</p>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <Link href="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">What Our Clients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">&quot;Amazing service! I always leave feeling great.&quot;</p>
                <p className="text-sm text-gray-600">— Sarah M.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="mb-4">&quot;The best salon in town. Highly recommend!&quot;</p>
                <p className="text-sm text-gray-600">— John D.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}


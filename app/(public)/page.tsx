import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div>
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


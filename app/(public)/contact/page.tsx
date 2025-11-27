"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement contact form submission
    setSubmitted(true);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
            <CardDescription>We'll get back to you as soon as possible</CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <p className="text-green-600">Thank you! Your message has been sent.</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
        <div>
          <h2 className="text-2xl font-bold mb-4">Visit Us</h2>
          <div className="space-y-4">
            <div>
              <p className="font-semibold">Address</p>
              <p className="text-gray-600">123 Main Street, City, State 12345</p>
            </div>
            <div>
              <p className="font-semibold">Phone</p>
              <p className="text-gray-600">(555) 123-4567</p>
            </div>
            <div>
              <p className="font-semibold">Email</p>
              <p className="text-gray-600">info@salon.com</p>
            </div>
            <div>
              <p className="font-semibold">Hours</p>
              <p className="text-gray-600">
                Monday - Friday: 9:00 AM - 7:00 PM<br />
                Saturday: 9:00 AM - 5:00 PM<br />
                Sunday: Closed
              </p>
            </div>
          </div>
          <div className="mt-8 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Google Maps Embed Placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
}


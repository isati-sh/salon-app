"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import type { Service, Profile } from "@/db/db-schema";

export default function BookPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadServices();
    loadEmployees();
  }, []);

  const loadServices = async () => {
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true);
    if (data) setServices(data);
  };

  const loadEmployees = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "employee");
    if (data) setEmployees(data);
  };

  const loadAvailableSlots = async () => {
    if (!selectedService || !selectedDate) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/bookings/availability?serviceId=${selectedService}&date=${selectedDate.toISOString()}&employeeId=${selectedEmployee || ""}`
      );
      const data = await response.json();
      setAvailableSlots(data.slots?.map((s: string) => new Date(s)) || []);
    } catch (error) {
      console.error("Failed to load slots:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === 4 && selectedDate) {
      loadAvailableSlots();
    }
  }, [step, selectedDate, selectedService, selectedEmployee]);

  const handleContinue = async () => {
    if (step === 1 && selectedService) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3 && selectedDate) {
      setStep(4);
    } else if (step === 4 && selectedTime) {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/login?redirect=/book&step=5`);
        return;
      }
      setStep(5);
    }
  };

  const handleBook = async () => {
    if (!selectedService || !selectedEmployee || !selectedTime) return;

    setLoading(true);
    try {
      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedService,
          employeeId: selectedEmployee,
          startDatetime: selectedTime.toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/customer/appointments/${data.appointmentId}`);
      } else {
        alert("Failed to book appointment");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Book Appointment</h1>

      <div className="max-w-2xl mx-auto">
        {/* Step 1: Select Service */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Select a Service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`w-full text-left p-4 border rounded-lg ${
                      selectedService === service.id
                        ? "border-primary bg-primary/10"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">{service.name}</p>
                        <p className="text-sm text-gray-600">
                          {service.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${service.base_price}</p>
                        <p className="text-sm text-gray-600">
                          {service.duration_minutes} min
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <Button
                onClick={handleContinue}
                disabled={!selectedService}
                className="w-full mt-4"
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select Employee */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Select a Stylist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className={`w-full text-left p-4 border rounded-lg ${
                    selectedEmployee === null
                      ? "border-primary bg-primary/10"
                      : "border-gray-200"
                  }`}
                >
                  <p className="font-semibold">Any Available</p>
                </button>
                {employees.map((employee) => (
                  <button
                    key={employee.id}
                    onClick={() => setSelectedEmployee(employee.id)}
                    className={`w-full text-left p-4 border rounded-lg ${
                      selectedEmployee === employee.id
                        ? "border-primary bg-primary/10"
                        : "border-gray-200"
                    }`}
                  >
                    <p className="font-semibold">{employee.full_name}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => setStep(1)} variant="outline">
                  Back
                </Button>
                <Button onClick={handleContinue} className="flex-1">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Select Date */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Select a Date</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="date"
                min={format(new Date(), "yyyy-MM-dd")}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="w-full p-2 border rounded-lg"
              />
              <div className="flex gap-2 mt-4">
                <Button onClick={() => setStep(2)} variant="outline">
                  Back
                </Button>
                <Button
                  onClick={handleContinue}
                  disabled={!selectedDate}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Select Time */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Select a Time</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading available times...</p>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map((slot, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedTime(slot)}
                      className={`p-2 border rounded-lg ${
                        selectedTime?.getTime() === slot.getTime()
                          ? "border-primary bg-primary/10"
                          : "border-gray-200"
                      }`}
                    >
                      {format(slot, "HH:mm")}
                    </button>
                  ))}
                </div>
              ) : (
                <p>No available times for this date.</p>
              )}
              <div className="flex gap-2 mt-4">
                <Button onClick={() => setStep(3)} variant="outline">
                  Back
                </Button>
                <Button
                  onClick={handleContinue}
                  disabled={!selectedTime}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Confirm */}
        {step === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Confirm Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold">Service</p>
                  <p>
                    {services.find((s) => s.id === selectedService)?.name}
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Stylist</p>
                  <p>
                    {selectedEmployee
                      ? employees.find((e) => e.id === selectedEmployee)
                          ?.full_name
                      : "Any Available"}
                  </p>
                </div>
                <div>
                  <p className="font-semibold">Date & Time</p>
                  <p>
                    {selectedTime &&
                      format(selectedTime, "EEEE, MMMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => setStep(4)} variant="outline">
                  Back
                </Button>
                <Button
                  onClick={handleBook}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Booking..." : "Confirm Booking"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


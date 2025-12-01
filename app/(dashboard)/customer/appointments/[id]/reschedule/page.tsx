"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default function RescheduleAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  const [appointmentData, setAppointmentData] = useState<any>(null);

  useEffect(() => {
    // Fetch appointment details
    fetch(`/api/customer/appointments/${appointmentId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.appointment) {
          setAppointmentData(data.appointment);
          const currentDate = new Date(data.appointment.start_datetime);
          setSelectedDate(format(currentDate, "yyyy-MM-dd"));
        }
      });
  }, [appointmentId]);

  useEffect(() => {
    if (selectedDate && appointmentData) {
      loadAvailableSlots();
    }
  }, [selectedDate, appointmentData]);

  const loadAvailableSlots = async () => {
    if (!selectedDate || !appointmentData) return;

    setLoadingSlots(true);
    try {
      const response = await fetch(
        `/api/bookings/availability?serviceId=${appointmentData.service_id}&date=${selectedDate}&employeeId=${appointmentData.employee_id}`
      );
      const data = await response.json();
      setAvailableSlots(data.slots?.map((s: string) => new Date(s)) || []);
    } catch (error) {
      console.error("Failed to load slots:", error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime) {
      alert("Please select a time slot");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/customer/appointments/${appointmentId}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDatetime: selectedTime,
        }),
      });

      if (response.ok) {
        router.push(`/customer/appointments/${appointmentId}`);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to reschedule appointment");
      }
    } catch (error) {
      console.error("Reschedule error:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!appointmentData) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Reschedule Appointment</CardTitle>
          <CardDescription>
            Select a new date and time for your appointment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold mb-2">Current Appointment</p>
              <p className="text-sm text-gray-600">
                {format(new Date(appointmentData.start_datetime), "EEEE, MMMM d, yyyy 'at' h:mm a")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Select New Date *</Label>
              <Input
                id="date"
                type="date"
                min={format(new Date(), "yyyy-MM-dd")}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Select New Time *</Label>
              {loadingSlots ? (
                <p className="text-sm text-gray-600">Loading available times...</p>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map((slot, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedTime(slot.toISOString())}
                      className={`p-2 border rounded-lg ${
                        selectedTime === slot.toISOString()
                          ? "border-primary bg-primary/10"
                          : "border-gray-200"
                      }`}
                    >
                      {format(slot, "HH:mm")}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  No available times for this date. Please select another date.
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !selectedTime}>
                {loading ? "Rescheduling..." : "Reschedule Appointment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


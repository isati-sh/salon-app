// Booking business logic: availability calculation, slot generation, etc.

import { createServiceClient } from "@/lib/supabase/service";
import { addMinutes, format, isAfter, isBefore, setHours, setMinutes } from "date-fns";
import type { Service, EmployeeShift, EmployeeBlockedTime, Appointment } from "@/db/db-schema";

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export interface AvailabilityOptions {
  employeeId?: string;
  serviceId: number;
  date: Date;
}

/**
 * Get available time slots for a given service and date
 */
export async function getAvailableTimeSlots(
  options: AvailabilityOptions
): Promise<TimeSlot[]> {
  const supabase = createServiceClient();

  // Get service details
  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("id", options.serviceId)
    .single();

  if (!service) {
    throw new Error("Service not found");
  }

  const duration = service.duration_minutes;

  // Get employees (either specific one or all employees)
  let employees;
  if (options.employeeId) {
    const { data: employee } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", options.employeeId)
      .eq("role", "employee")
      .single();
    employees = employee ? [employee] : [];
  } else {
    const { data: allEmployees } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "employee");
    employees = allEmployees || [];
  }

  if (employees.length === 0) {
    return [];
  }

  // Get all shifts for the day of week
  const dayOfWeek = options.date.getDay();
  const employeeIds = employees.map((e) => e.id);

  const { data: shifts } = await supabase
    .from("employee_shifts")
    .select("*")
    .in("employee_id", employeeIds)
    .eq("day_of_week", dayOfWeek);

  if (!shifts || shifts.length === 0) {
    return [];
  }

  // Get blocked times for the date
  const startOfDay = new Date(options.date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(options.date);
  endOfDay.setHours(23, 59, 59, 999);

  const { data: blockedTimes } = await supabase
    .from("employee_blocked_times")
    .select("*")
    .in("employee_id", employeeIds)
    .gte("start_datetime", startOfDay.toISOString())
    .lte("end_datetime", endOfDay.toISOString());

  // Get existing appointments for the date
  const { data: appointments } = await supabase
    .from("appointments")
    .select("*")
    .in("employee_id", employeeIds)
    .gte("start_datetime", startOfDay.toISOString())
    .lte("end_datetime", endOfDay.toISOString())
    .in("status", ["pending", "confirmed"]);

  // Generate time slots for each employee's shift
  const allSlots: Map<string, TimeSlot> = new Map();

  for (const shift of shifts || []) {
    const shiftStart = parseTime(shift.start_time);
    const shiftEnd = parseTime(shift.end_time);

    const slotStart = setMinutes(
      setHours(options.date, shiftStart.hours),
      shiftStart.minutes
    );
    const slotEnd = setMinutes(
      setHours(options.date, shiftEnd.hours),
      shiftEnd.minutes
    );

    // Generate slots within the shift
    let currentTime = slotStart;
    while (addMinutes(currentTime, duration) <= slotEnd) {
      const slotKey = format(currentTime, "HH:mm");
      const slotEndTime = addMinutes(currentTime, duration);

      // Check if this slot conflicts with blocked times or appointments
      const isBlocked = (blockedTimes || []).some((blocked) => {
        const blockedStart = new Date(blocked.start_datetime);
        const blockedEnd = new Date(blocked.end_datetime);
        return (
          (isAfter(currentTime, blockedStart) && isBefore(currentTime, blockedEnd)) ||
          (isAfter(slotEndTime, blockedStart) && isBefore(slotEndTime, blockedEnd)) ||
          (isBefore(currentTime, blockedStart) && isAfter(slotEndTime, blockedEnd))
        );
      });

      const isBooked = (appointments || []).some((apt) => {
        const aptStart = new Date(apt.start_datetime);
        const aptEnd = new Date(apt.end_datetime);
        return (
          (isAfter(currentTime, aptStart) && isBefore(currentTime, aptEnd)) ||
          (isAfter(slotEndTime, aptStart) && isBefore(slotEndTime, aptEnd)) ||
          (isBefore(currentTime, aptStart) && isAfter(slotEndTime, aptEnd))
        );
      });

      if (!allSlots.has(slotKey)) {
        allSlots.set(slotKey, {
          start: currentTime,
          end: slotEndTime,
          available: !isBlocked && !isBooked,
        });
      } else {
        // If any employee has this slot available, mark it as available
        const existing = allSlots.get(slotKey)!;
        if (!isBlocked && !isBooked) {
          existing.available = true;
        }
      }

      currentTime = addMinutes(currentTime, 15); // 15-minute increments
    }
  }

  return Array.from(allSlots.values())
    .filter((slot) => slot.available)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return { hours, minutes };
}

/**
 * Check if a time slot is available for booking
 */
export async function isSlotAvailable(
  employeeId: string,
  serviceId: number,
  startDatetime: Date
): Promise<boolean> {
  const supabase = createServiceClient();

  // Get service duration
  const { data: service } = await supabase
    .from("services")
    .select("duration_minutes")
    .eq("id", serviceId)
    .single();

  if (!service) {
    return false;
  }

  const endDatetime = addMinutes(startDatetime, service.duration_minutes);

  // Check for overlapping appointments
  const { data: overlappingAppointments } = await supabase
    .from("appointments")
    .select("id")
    .eq("employee_id", employeeId)
    .in("status", ["pending", "confirmed"])
    .or(
      `and(start_datetime.lte.${startDatetime.toISOString()},end_datetime.gt.${startDatetime.toISOString()}),and(start_datetime.lt.${endDatetime.toISOString()},end_datetime.gte.${endDatetime.toISOString()}),and(start_datetime.gte.${startDatetime.toISOString()},end_datetime.lte.${endDatetime.toISOString()})`
    )
    .limit(1);

  if (overlappingAppointments && overlappingAppointments.length > 0) {
    return false;
  }

  // Check for blocked times
  const { data: blockedTimes } = await supabase
    .from("employee_blocked_times")
    .select("id")
    .eq("employee_id", employeeId)
    .or(
      `and(start_datetime.lte.${startDatetime.toISOString()},end_datetime.gt.${startDatetime.toISOString()}),and(start_datetime.lt.${endDatetime.toISOString()},end_datetime.gte.${endDatetime.toISOString()}),and(start_datetime.gte.${startDatetime.toISOString()},end_datetime.lte.${endDatetime.toISOString()})`
    )
    .limit(1);

  if (blockedTimes && blockedTimes.length > 0) {
    return false;
  }

  return true;
}

/**
 * Create an appointment (with validation)
 */
export async function createAppointment(data: {
  customerId: string;
  employeeId: string;
  serviceId: number;
  startDatetime: Date;
  notes?: string;
  couponId?: number;
}): Promise<{ id: number }> {
  const supabase = createServiceClient();

  // Validate slot availability
  const available = await isSlotAvailable(
    data.employeeId,
    data.serviceId,
    data.startDatetime
  );

  if (!available) {
    throw new Error("Time slot is no longer available");
  }

  // Get service duration
  const { data: service } = await supabase
    .from("services")
    .select("duration_minutes")
    .eq("id", data.serviceId)
    .single();

  if (!service) {
    throw new Error("Service not found");
  }

  const endDatetime = addMinutes(data.startDatetime, service.duration_minutes);

  // Create appointment
  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({
      customer_id: data.customerId,
      employee_id: data.employeeId,
      service_id: data.serviceId,
      start_datetime: data.startDatetime.toISOString(),
      end_datetime: endDatetime.toISOString(),
      status: "pending",
      notes: data.notes || null,
      coupon_id: data.couponId || null,
    })
    .select("id")
    .single();

  if (error || !appointment) {
    throw new Error(error?.message || "Failed to create appointment");
  }

  return appointment;
}


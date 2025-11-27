// Notification service layer
// Queues and sends notifications via email and/or SMS

import { createServiceClient } from "@/lib/supabase/service";
import * as emailService from "./email";
import * as smsService from "./sms";
import type { NotificationChannel, NotificationStatus } from "@/db/db-schema";

export interface QueueNotificationOptions {
  userId: string;
  type: string;
  channel: NotificationChannel | NotificationChannel[];
  payload: Record<string, unknown>;
}

export async function queueNotification(
  options: QueueNotificationOptions
): Promise<void> {
  const supabase = createServiceClient();
  const channels = Array.isArray(options.channel)
    ? options.channel
    : [options.channel];

  for (const channel of channels) {
    await supabase.from("notifications").insert({
      user_id: options.userId,
      type: options.type,
      channel,
      payload: options.payload,
      status: "queued",
    });
  }
}

export async function sendNotification(
  notificationId: number
): Promise<boolean> {
  const supabase = createServiceClient();
  const { data: notification, error: fetchError } = await supabase
    .from("notifications")
    .select("*")
    .eq("id", notificationId)
    .single();

  if (fetchError || !notification) {
    console.error("Failed to fetch notification:", fetchError);
    return false;
  }

  if (notification.status !== "queued") {
    return false;
  }

  // Get user profile to get email/phone
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, phone")
    .eq("id", notification.user_id)
    .single();

  if (!profile) {
    console.error("User profile not found");
    await supabase
      .from("notifications")
      .update({ status: "failed" })
      .eq("id", notificationId);
    return false;
  }

  let success = false;

  try {
    if (notification.channel === "email" && profile.email) {
      if (notification.type === "appointment_confirmation") {
        const payload = notification.payload as {
          date: string;
          time: string;
          service: string;
          employee: string;
        };
        success = await emailService.sendAppointmentConfirmation(
          profile.email,
          payload
        );
      } else if (notification.type === "appointment_reminder") {
        const payload = notification.payload as {
          date: string;
          time: string;
          service: string;
          employee: string;
        };
        success = await emailService.sendAppointmentReminder(
          profile.email,
          payload
        );
      } else if (notification.type === "promo") {
        const payload = notification.payload as {
          title: string;
          description: string;
          couponCode?: string;
        };
        success = await emailService.sendPromoEmail(profile.email, payload);
      } else if (notification.type === "birthday") {
        const payload = notification.payload as { couponCode?: string };
        success = await emailService.sendBirthdayEmail(
          profile.email,
          payload.couponCode
        );
      }
    } else if (notification.channel === "sms" && profile.phone) {
      if (notification.type === "appointment_confirmation") {
        const payload = notification.payload as {
          date: string;
          time: string;
          service: string;
        };
        success = await smsService.sendAppointmentConfirmationSMS(
          profile.phone,
          payload
        );
      } else if (notification.type === "appointment_reminder") {
        const payload = notification.payload as {
          date: string;
          time: string;
          service: string;
        };
        success = await smsService.sendAppointmentReminderSMS(
          profile.phone,
          payload
        );
      }
    }

    await supabase
      .from("notifications")
      .update({
        status: success ? "sent" : "failed",
        sent_at: success ? new Date().toISOString() : null,
      })
      .eq("id", notificationId);
  } catch (error) {
    console.error("Error sending notification:", error);
    await supabase
      .from("notifications")
      .update({ status: "failed" })
      .eq("id", notificationId);
    return false;
  }

  return success;
}

export async function queueAppointmentConfirmation(
  appointmentId: number
): Promise<void> {
  const supabase = createServiceClient();
  const { data: appointment } = await supabase
    .from("appointments")
    .select(
      `
      *,
      customer:profiles!appointments_customer_id_fkey(id, email, phone),
      employee:profiles!appointments_employee_id_fkey(id, full_name),
      service:services(name)
    `
    )
    .eq("id", appointmentId)
    .single();

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  const customer = appointment.customer as { id: string; email: string | null; phone: string | null };
  const employee = appointment.employee as { id: string; full_name: string };
  const service = appointment.service as { name: string };

  const startDate = new Date(appointment.start_datetime);
  const dateStr = startDate.toLocaleDateString();
  const timeStr = startDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  await queueNotification({
    userId: customer.id,
    type: "appointment_confirmation",
    channel: ["email", "sms"],
    payload: {
      date: dateStr,
      time: timeStr,
      service: service.name,
      employee: employee.full_name,
    },
  });
}

export async function queueAppointmentReminder(
  appointmentId: number
): Promise<void> {
  const supabase = createServiceClient();
  const { data: appointment } = await supabase
    .from("appointments")
    .select(
      `
      *,
      customer:profiles!appointments_customer_id_fkey(id, email, phone),
      employee:profiles!appointments_employee_id_fkey(id, full_name),
      service:services(name)
    `
    )
    .eq("id", appointmentId)
    .single();

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  const customer = appointment.customer as { id: string; email: string | null; phone: string | null };
  const employee = appointment.employee as { id: string; full_name: string };
  const service = appointment.service as { name: string };

  const startDate = new Date(appointment.start_datetime);
  const dateStr = startDate.toLocaleDateString();
  const timeStr = startDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  await queueNotification({
    userId: customer.id,
    type: "appointment_reminder",
    channel: ["email", "sms"],
    payload: {
      date: dateStr,
      time: timeStr,
      service: service.name,
      employee: employee.full_name,
    },
  });
}

export async function processQueuedNotifications(): Promise<void> {
  const supabase = createServiceClient();
  const { data: queuedNotifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("status", "queued")
    .limit(50);

  if (!queuedNotifications) {
    return;
  }

  for (const notification of queuedNotifications) {
    await sendNotification(notification.id);
  }
}


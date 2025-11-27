// SMS notification abstraction
// Currently supports Twilio, but can be easily swapped for another provider

export interface SMSOptions {
  to: string;
  message: string;
}

export async function sendSMS(options: SMSOptions): Promise<boolean> {
  try {
    // Check if Twilio is configured
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.warn("Twilio is not configured. SMS will not be sent.");
      return false;
    }

    // Dynamic import to avoid requiring Twilio if not configured
    const twilio = await import("twilio");
    const client = twilio.default(accountSid, authToken);

    await client.messages.create({
      body: options.message,
      from: fromNumber,
      to: options.to,
    });

    return true;
  } catch (error) {
    console.error("Error sending SMS:", error);
    return false;
  }
}

export async function sendAppointmentConfirmationSMS(
  phone: string,
  appointmentDetails: {
    date: string;
    time: string;
    service: string;
  }
): Promise<boolean> {
  const message = `Appointment confirmed: ${appointmentDetails.service} on ${appointmentDetails.date} at ${appointmentDetails.time}. See you soon!`;
  return sendSMS({ to: phone, message });
}

export async function sendAppointmentReminderSMS(
  phone: string,
  appointmentDetails: {
    date: string;
    time: string;
    service: string;
  }
): Promise<boolean> {
  const message = `Reminder: You have an appointment for ${appointmentDetails.service} on ${appointmentDetails.date} at ${appointmentDetails.time}.`;
  return sendSMS({ to: phone, message });
}


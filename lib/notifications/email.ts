import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return false;
    }

    const from = options.from || process.env.EMAIL_FROM_ADDRESS || "noreply@salon.com";

    const { error } = await resend.emails.send({
      from,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error("Failed to send email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

export async function sendAppointmentConfirmation(
  email: string,
  appointmentDetails: {
    date: string;
    time: string;
    service: string;
    employee: string;
  }
): Promise<boolean> {
  const html = `
    <h1>Appointment Confirmed</h1>
    <p>Your appointment has been confirmed:</p>
    <ul>
      <li><strong>Service:</strong> ${appointmentDetails.service}</li>
      <li><strong>Date:</strong> ${appointmentDetails.date}</li>
      <li><strong>Time:</strong> ${appointmentDetails.time}</li>
      <li><strong>Stylist:</strong> ${appointmentDetails.employee}</li>
    </ul>
    <p>We look forward to seeing you!</p>
  `;

  return sendEmail({
    to: email,
    subject: "Appointment Confirmation",
    html,
  });
}

export async function sendAppointmentReminder(
  email: string,
  appointmentDetails: {
    date: string;
    time: string;
    service: string;
    employee: string;
  }
): Promise<boolean> {
  const html = `
    <h1>Appointment Reminder</h1>
    <p>This is a reminder about your upcoming appointment:</p>
    <ul>
      <li><strong>Service:</strong> ${appointmentDetails.service}</li>
      <li><strong>Date:</strong> ${appointmentDetails.date}</li>
      <li><strong>Time:</strong> ${appointmentDetails.time}</li>
      <li><strong>Stylist:</strong> ${appointmentDetails.employee}</li>
    </ul>
    <p>See you soon!</p>
  `;

  return sendEmail({
    to: email,
    subject: "Appointment Reminder",
    html,
  });
}

export async function sendPromoEmail(
  email: string,
  promoDetails: {
    title: string;
    description: string;
    couponCode?: string;
  }
): Promise<boolean> {
  const html = `
    <h1>${promoDetails.title}</h1>
    <p>${promoDetails.description}</p>
    ${promoDetails.couponCode ? `<p><strong>Use code: ${promoDetails.couponCode}</strong></p>` : ""}
  `;

  return sendEmail({
    to: email,
    subject: promoDetails.title,
    html,
  });
}

export async function sendBirthdayEmail(
  email: string,
  couponCode?: string
): Promise<boolean> {
  const html = `
    <h1>Happy Birthday!</h1>
    <p>We hope you have a wonderful day! As a special birthday treat, we'd like to offer you a discount on your next visit.</p>
    ${couponCode ? `<p><strong>Use code: ${couponCode}</strong></p>` : ""}
    <p>We look forward to celebrating with you!</p>
  `;

  return sendEmail({
    to: email,
    subject: "Happy Birthday from Us!",
    html,
  });
}


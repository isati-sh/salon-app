import { NextResponse } from "next/server";
import { getCustomersWithBirthdaysThisWeek } from "@/lib/promotions";
import { queueNotification } from "@/lib/notifications";

// Send birthday emails to customers with birthdays this week
export async function POST() {
  try {
    const customers = await getCustomersWithBirthdaysThisWeek();

    let processed = 0;
    for (const customer of customers) {
      try {
        await queueNotification({
          userId: customer.id,
          type: "birthday",
          channel: "email",
          payload: {
            couponCode: undefined, // Could generate a birthday coupon here
          },
        });
        processed++;
      } catch (error) {
        console.error(`Failed to queue birthday notification for customer ${customer.id}:`, error);
      }
    }

    return NextResponse.json({ processed });
  } catch (error) {
    console.error("Error processing birthday notifications:", error);
    return NextResponse.json(
      { error: "Failed to process birthday notifications" },
      { status: 500 }
    );
  }
}


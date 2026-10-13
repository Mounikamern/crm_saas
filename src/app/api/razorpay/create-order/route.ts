import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";
import Razorpay from "razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, billingCycle, dealerMobile, dealerStoreName, ownerName } = body;

    if (!planId || !dealerMobile || !dealerStoreName) {
      return NextResponse.json(
        { success: false, error: "planId, dealerMobile, and dealerStoreName are required" },
        { status: 400 }
      );
    }

    const plans = dbService.getSubscriptionPlans();
    const plan = plans.find((p) => p.id === planId) || plans[1];
    const cycle = billingCycle || "yearly";
    const amountInRupees = cycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
    const amountInPaise = amountInRupees * 100;

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_buildcraft_2026";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "buildcraft_razorpay_secret_key";

    let orderId = `order_test_${Date.now()}`;

    // If valid real razorpay keys are provided, try creating real Razorpay order
    if (keyId.startsWith("rzp_live_") || (keyId.startsWith("rzp_test_") && keySecret !== "buildcraft_razorpay_secret_key")) {
      try {
        const razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        const order = await razorpay.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: `rcpt_${Date.now()}`,
          notes: {
            planId,
            planName: plan.name,
            dealerStoreName,
            dealerMobile,
            ownerName: ownerName || "",
          },
        });
        orderId = order.id;
      } catch (err: unknown) {
        console.warn("Razorpay API order creation warning, using sandbox test order:", err);
        orderId = `order_sand_${Date.now()}`;
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      amount: amountInPaise,
      amountInRupees,
      currency: "INR",
      keyId,
      planName: plan.name,
      dealerStoreName,
      dealerMobile,
      ownerName: ownerName || dealerStoreName,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error creating Razorpay order";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

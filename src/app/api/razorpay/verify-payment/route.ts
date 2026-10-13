import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      dealerMobile,
      dealerStoreName,
      ownerName,
      planId,
      billingCycle,
    } = body;

    if (!dealerMobile || !dealerStoreName || !planId) {
      return NextResponse.json(
        { success: false, error: "Missing required subscription verification fields" },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Signature verification if live signature and secret are present
    if (razorpayOrderId && razorpayPaymentId && razorpaySignature && keySecret && keySecret !== "buildcraft_razorpay_secret_key") {
      try {
        const generatedSignature = crypto
          .createHmac("sha256", keySecret)
          .update(`${razorpayOrderId}|${razorpayPaymentId}`)
          .digest("hex");

        if (generatedSignature !== razorpaySignature) {
          return NextResponse.json(
            { success: false, error: "Invalid Razorpay payment signature" },
            { status: 400 }
          );
        }
      } catch (e) {
        console.warn("Signature verification warning:", e);
      }
    }

    // Activate subscription and create/link dealer store
    const { subscription, dealer } = await dbService.createSubscription({
      dealerMobile,
      dealerStoreName,
      ownerName: ownerName || dealerStoreName,
      planId,
      billingCycle: billingCycle || "yearly",
      razorpayOrderId: razorpayOrderId || `order_${Date.now()}`,
      razorpayPaymentId: razorpayPaymentId || `pay_${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      message: "Subscription activated successfully! Navigating to your dealer CRM dashboard.",
      subscription,
      dealer,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error verifying Razorpay payment";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

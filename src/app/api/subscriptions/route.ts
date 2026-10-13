import { NextResponse } from "next/server";
import { dbService, isSubscriptionExpired } from "@/lib/db-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const plans = dbService.getSubscriptionPlans();
    const subscriptions = await dbService.getSubscriptions();
    return NextResponse.json({ success: true, plans, subscriptions });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching subscriptions";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// Check subscription by mobile number for dealer login
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.mobile) {
      return NextResponse.json({ success: false, error: "Mobile number is required" }, { status: 400 });
    }

    const subscription = await dbService.getSubscriptionByMobile(body.mobile);
    const dealersData = await dbService.getDealers();

    const targetDigits = body.mobile.replace(/[^0-9]/g, "").slice(-10);
    const dealer = dealersData.dealers.find(
      (d) => (d.phone || "").replace(/[^0-9]/g, "").slice(-10) === targetDigits
    );

    const isExpired = isSubscriptionExpired(subscription);
    const hasActiveSubscription = !!subscription && !isExpired;

    if (hasActiveSubscription && dealer) {
      // Auto-switch to their store only when active
      await dbService.switchDealer(dealer.id);
    }

    return NextResponse.json({
      success: true,
      hasActiveSubscription,
      isExpired,
      subscription,
      dealer: dealer || null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error verifying subscriber mobile";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

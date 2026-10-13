import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId") || undefined;
    const brandName = searchParams.get("brandName") || undefined;
    const status = searchParams.get("status") || undefined;

    const batches = await dbService.getBatches({ productId, brandName, status });
    return NextResponse.json({ success: true, batches });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching batches";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.productId || !body.purchaseRate || !body.initialQuantity || !body.purchaseDate) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: productId, purchaseRate, initialQuantity, purchaseDate" },
        { status: 400 }
      );
    }

    const batch = await dbService.createBatch({
      productId: body.productId,
      batchNumber: body.batchNumber,
      purchaseDate: body.purchaseDate,
      purchaseRate: Number(body.purchaseRate),
      initialQuantity: Number(body.initialQuantity),
      supplierName: body.supplierName,
      notes: body.notes,
    });

    return NextResponse.json({ success: true, batch });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error creating batch";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

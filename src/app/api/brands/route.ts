import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const brands = await dbService.getBrands();
    return NextResponse.json({ success: true, brands });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching brands";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ success: false, error: "Brand name is required" }, { status: 400 });
    }

    const brand = await dbService.createBrand({
      name: body.name.trim(),
      category: body.category || "Cement",
    });

    const products = await dbService.getProducts();

    return NextResponse.json({ success: true, brand, products });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error creating brand";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

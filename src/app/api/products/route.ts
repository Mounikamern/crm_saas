import { NextResponse } from "next/server";
import { dbService } from "@/lib/db-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await dbService.getProducts();
    const categories = await dbService.getCategories();
    const brands = await dbService.getBrands();
    return NextResponse.json({ success: true, products, categories, brands });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error fetching products";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.categoryId || !body.brandId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }
    const product = await dbService.createProduct(body);
    return NextResponse.json({ success: true, product });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error creating product";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// app/api/ai-detect/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const fd = await request.formData();
        const file = fd.get("photo") as File | null;
        if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

        // MOCK ANALYSIS (ganti dengan panggilan model/vision API nyata)
        const size = file.size;
        const result = await analyzeImageMock(size);

        return NextResponse.json(result);
    } catch (err: any) {
        console.error("ai-detect error:", err);
        return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
    }
}

async function analyzeImageMock(size: number) {
    // heuristic demo: sesuaikan sesuai model nyata
    if (size < 100_000) return { label: "Safe", score: 0.95 };
    if (size < 1_000_000) return { label: "Need Attention", score: 0.65 };
    return { label: "Bad", score: 0.30 };
}
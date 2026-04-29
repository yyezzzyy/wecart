import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fileName?: string;
      contentType?: string;
    };

    if (!body.fileName) {
      return NextResponse.json({ message: "File name is required." }, { status: 400 });
    }

    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "shopping-images";
    const supabase = getSupabaseAdmin();
    const extension = body.fileName.split(".").pop()?.toLowerCase() || "jpg";
    const safeExtension = extension.replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `items/${crypto.randomUUID()}.${safeExtension}`;

    const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);

    if (error) {
      console.error("Supabase signed upload URL failed", {
        bucket,
        path,
        statusCode: error.statusCode,
        message: error.message
      });

      return NextResponse.json(
        {
          message: error.message,
          bucket
        },
        { status: 500 }
      );
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);

    return NextResponse.json({
      bucket,
      path: data.path,
      token: data.token,
      publicUrl: publicData.publicUrl,
      contentType: body.contentType || "image/jpeg"
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown upload error";
    console.error("Upload signing route crashed", { message });
    return NextResponse.json({ message }, { status: 500 });
  }
}

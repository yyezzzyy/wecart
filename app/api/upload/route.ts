import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
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
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);

  return NextResponse.json({
    bucket,
    path: data.path,
    token: data.token,
    publicUrl: publicData.publicUrl,
    contentType: body.contentType || "image/jpeg"
  });
}

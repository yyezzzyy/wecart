import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: {
    groupId: string;
  };
};

export async function POST(request: Request, { params }: Params) {
  const body = (await request.json()) as { name?: string };
  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json({ message: "Category name is required." }, { status: 400 });
  }

  const category = await prisma.category.create({
    data: {
      name,
      groupId: params.groupId
    }
  });

  return NextResponse.json(category);
}

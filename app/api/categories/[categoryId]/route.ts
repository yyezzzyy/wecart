import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: {
    categoryId: string;
  };
};

export async function PATCH(request: Request, { params }: Params) {
  const body = (await request.json()) as { name?: string };
  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json({ message: "Category name is required." }, { status: 400 });
  }

  const category = await prisma.category.update({
    where: {
      id: params.categoryId
    },
    data: {
      name
    }
  });

  return NextResponse.json(category);
}

export async function DELETE(_: Request, { params }: Params) {
  await prisma.category.delete({
    where: {
      id: params.categoryId
    }
  });

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: {
    itemId: string;
  };
};

export async function PATCH(request: Request, { params }: Params) {
  const body = (await request.json()) as {
    name?: string;
    memo?: string;
    imageUrl?: string;
    mapUrl?: string;
    referenceUrl?: string;
    isPurchased?: boolean;
    memberId?: string;
    categoryId?: string;
  };

  const data: {
    name?: string;
    memo?: string | null;
    imageUrl?: string | null;
    mapUrl?: string | null;
    referenceUrl?: string | null;
    isPurchased?: boolean;
    memberId?: string;
    categoryId?: string;
  } = {};

  if (typeof body.isPurchased === "boolean") data.isPurchased = body.isPurchased;
  if (typeof body.name === "string") data.name = body.name.trim();
  if (typeof body.memo === "string") data.memo = body.memo.trim() || null;
  if (typeof body.imageUrl === "string") data.imageUrl = body.imageUrl || null;
  if (typeof body.mapUrl === "string") data.mapUrl = body.mapUrl.trim() || null;
  if (typeof body.referenceUrl === "string") data.referenceUrl = body.referenceUrl.trim() || null;
  if (typeof body.memberId === "string") data.memberId = body.memberId;
  if (typeof body.categoryId === "string") data.categoryId = body.categoryId;

  if (data.name === "") {
    return NextResponse.json({ message: "Item name is required." }, { status: 400 });
  }

  const item = await prisma.shoppingItem.update({
    where: {
      id: params.itemId
    },
    data,
    include: {
      member: true,
      category: true,
      wantedBy: {
        include: {
          member: true
        },
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });

  return NextResponse.json(item);
}

export async function DELETE(_: Request, { params }: Params) {
  await prisma.shoppingItem.delete({
    where: {
      id: params.itemId
    }
  });

  return NextResponse.json({ ok: true });
}

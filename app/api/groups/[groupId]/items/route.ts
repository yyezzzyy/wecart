import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: {
    groupId: string;
  };
};

export async function POST(request: Request, { params }: Params) {
  const body = (await request.json()) as {
    name?: string;
    memo?: string;
    imageUrl?: string;
    mapUrl?: string;
    referenceUrl?: string;
    memberId?: string;
    categoryId?: string;
  };

  if (!body.name?.trim() || !body.memberId || !body.categoryId) {
    return NextResponse.json({ message: "Required fields are missing." }, { status: 400 });
  }

  const item = await prisma.shoppingItem.create({
    data: {
      name: body.name.trim(),
      memo: body.memo?.trim() || null,
      imageUrl: body.imageUrl || null,
      mapUrl: body.mapUrl?.trim() || null,
      referenceUrl: body.referenceUrl?.trim() || null,
      groupId: params.groupId,
      memberId: body.memberId,
      categoryId: body.categoryId
    },
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

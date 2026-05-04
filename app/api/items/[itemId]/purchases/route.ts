import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: {
    itemId: string;
  };
};

export async function PATCH(request: Request, { params }: Params) {
  const body = (await request.json()) as {
    memberId?: string;
    isPurchased?: boolean;
  };

  if (!body.memberId || typeof body.isPurchased !== "boolean") {
    return NextResponse.json({ message: "Required fields are missing." }, { status: 400 });
  }

  await prisma.shoppingItemPurchase.upsert({
    where: {
      itemId_memberId: {
        itemId: params.itemId,
        memberId: body.memberId
      }
    },
    update: {
      isPurchased: body.isPurchased
    },
    create: {
      itemId: params.itemId,
      memberId: body.memberId,
      isPurchased: body.isPurchased
    }
  });

  return NextResponse.json({ ok: true });
}

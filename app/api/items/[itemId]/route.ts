import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: {
    itemId: string;
  };
};

export async function PATCH(request: Request, { params }: Params) {
  const body = (await request.json()) as { isPurchased?: boolean };

  const item = await prisma.shoppingItem.update({
    where: {
      id: params.itemId
    },
    data: {
      isPurchased: Boolean(body.isPurchased)
    },
    include: {
      member: true,
      category: true
    }
  });

  return NextResponse.json(item);
}

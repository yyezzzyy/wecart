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
    checked?: boolean;
  };

  if (!body.memberId || typeof body.checked !== "boolean") {
    return NextResponse.json({ message: "Required fields are missing." }, { status: 400 });
  }

  if (body.checked) {
    await prisma.shoppingItemWant.upsert({
      where: {
        itemId_memberId: {
          itemId: params.itemId,
          memberId: body.memberId
        }
      },
      update: {},
      create: {
        itemId: params.itemId,
        memberId: body.memberId
      }
    });
  } else {
    await prisma.shoppingItemWant.deleteMany({
      where: {
        itemId: params.itemId,
        memberId: body.memberId
      }
    });
  }

  const item = await prisma.shoppingItem.findUnique({
    where: {
      id: params.itemId
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

  if (!item) {
    return NextResponse.json({ message: "Item not found." }, { status: 404 });
  }

  return NextResponse.json(item);
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = {
  params: {
    groupId: string;
  };
};

export async function GET(_: Request, { params }: Params) {
  const group = await prisma.group.findUnique({
    where: {
      id: params.groupId
    },
    include: {
      members: {
        orderBy: {
          createdAt: "asc"
        }
      },
      categories: {
        orderBy: {
          createdAt: "asc"
        }
      },
      items: {
        include: {
          member: true,
          category: true
        },
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });

  if (!group) {
    return NextResponse.json({ message: "Group not found." }, { status: 404 });
  }

  return NextResponse.json(group);
}

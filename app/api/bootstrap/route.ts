import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const defaultCategories = ["돈키호테", "드럭스토어", "편의점", "과자", "기념품"];

export const dynamic = "force-dynamic";

export async function GET() {
  const group = await prisma.group.findFirst({
    where: {
      members: {
        some: {}
      }
    },
    select: {
      id: true,
      _count: {
        select: {
          categories: true
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  if (!group) {
    return NextResponse.json(
      { message: "No group with members was found." },
      { status: 404 }
    );
  }

  if (group._count.categories === 0) {
    await prisma.category.createMany({
      data: defaultCategories.map((name) => ({
        name,
        groupId: group.id
      }))
    });
  }

  return NextResponse.json({ groupId: group.id });
}

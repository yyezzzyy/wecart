import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const defaultCategories = ["돈키호테", "드럭스토어", "편의점", "과자", "기념품"];

export async function POST(request: Request) {
  const body = (await request.json()) as { members?: string[]; name?: string };
  const members = body.members?.map((name) => name.trim()).filter(Boolean) ?? [];

  if (members.length < 2) {
    return NextResponse.json({ message: "At least two members are required." }, { status: 400 });
  }

  const group = await prisma.group.create({
    data: {
      name: body.name?.trim() || "WECART 여행",
      members: {
        create: members.map((name) => ({ name }))
      },
      categories: {
        create: defaultCategories.map((name) => ({ name }))
      }
    },
    include: {
      members: true,
      categories: true
    }
  });

  return NextResponse.json({ ...group, items: [] });
}

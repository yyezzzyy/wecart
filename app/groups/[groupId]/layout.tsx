"use client";

import { useParams, usePathname } from "next/navigation";
import { BottomTabs, GroupHeader, GroupLoading } from "./_components/group-ui";
import { useGroupData } from "./_components/use-group-data";

const pageCopy: Record<string, { title: string; subtitle: string }> = {
  members: {
    title: "멤버별 리스트",
    subtitle: "친구별로 담긴 쇼핑템을 확인해요"
  },
  items: {
    title: "담긴 쇼핑템",
    subtitle: "필터로 필요한 것만 빠르게 찾아요"
  },
  categories: {
    title: "카테고리",
    subtitle: "쇼핑 장소와 종류를 정리해요"
  }
};

export default function GroupLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ groupId: string }>();
  const pathname = usePathname();
  const { group, isLoading } = useGroupData(params.groupId);
  const segment = pathname.split("/").filter(Boolean).at(-1) || "items";
  const copy = pageCopy[segment] || pageCopy.items;

  if (isLoading || !group) {
    return <GroupLoading />;
  }

  return (
    <section className="relative min-h-dvh pb-28">
      <GroupHeader title={copy.title} subtitle={copy.subtitle} memberCount={group.members.length} />
      {children}
      <BottomTabs groupId={params.groupId} />
    </section>
  );
}

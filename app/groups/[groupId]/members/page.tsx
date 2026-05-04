"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import { useWecartStore } from "@/stores/useWecartStore";
import { MemberSummaryCard } from "../_components/group-ui";

export default function MembersPage() {
  const router = useRouter();
  const { group, selectedMemberId, setSelectedCategoryId, setSelectedMemberId } = useWecartStore();

  const memberSummaries = useMemo(() => {
    if (!group) return [];

    return group.members.map((member) => {
      const items = group.items.filter(
        (item) =>
          item.memberId === member.id ||
          item.wantedBy.some((want) => want.memberId === member.id)
      );
      const purchasedCount = items.filter((item) =>
        item.purchases.some((purchase) => purchase.memberId === member.id && purchase.isPurchased)
      ).length;

      return {
        member,
        items,
        totalCount: items.length,
        purchasedCount,
        remainingCount: items.length - purchasedCount
      };
    });
  }, [group]);

  if (!group) return null;

  return (
    <div className="px-4 py-4">
      <section className="rounded-[28px] border-2 border-white bg-white/78 p-4 shadow-sticker">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-ink/55">멤버별 리스트</p>
            <h2 className="text-xl font-black">친구별 쇼핑 현황</h2>
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-mint">
            <UserRound size={21} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {memberSummaries.map((summary) => (
            <MemberSummaryCard
              key={summary.member.id}
              summary={summary}
              active={selectedMemberId === summary.member.id}
              onSelect={() => {
                setSelectedMemberId(summary.member.id);
                setSelectedCategoryId("all");
                router.push(`/groups/${group.id}/items`);
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

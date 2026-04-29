"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import type { ShoppingItem } from "@/lib/types";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import { useWecartStore } from "@/stores/useWecartStore";
import {
  AddItemButton,
  AddItemModal,
  CategoryChip,
  EmptyState,
  FilterChip,
  ItemCard
} from "../_components/group-ui";

type ItemForm = {
  name: string;
  categoryId: string;
  memberId: string;
  memo: string;
  imageUrl: string;
  mapUrl: string;
  referenceUrl: string;
};

const emptyForm: ItemForm = {
  name: "",
  categoryId: "",
  memberId: "",
  memo: "",
  imageUrl: "",
  mapUrl: "",
  referenceUrl: ""
};

export default function ItemsPage() {
  const params = useParams<{ groupId: string }>();
  const {
    group,
    selectedMemberId,
    selectedCategoryId,
    setSelectedMemberId,
    setSelectedCategoryId,
    addItem,
    updateItem
  } = useWecartStore();
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [form, setForm] = useState<ItemForm>(emptyForm);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!group) return;
    setForm((current) => ({
      ...current,
      categoryId: current.categoryId || group.categories[0]?.id || "",
      memberId: current.memberId || group.members[0]?.id || ""
    }));
  }, [group]);

  const filteredItems = useMemo(() => {
    if (!group) return [];

    return group.items.filter((item) => {
      const memberMatches = selectedMemberId === "all" || item.memberId === selectedMemberId;
      const categoryMatches = selectedCategoryId === "all" || item.categoryId === selectedCategoryId;
      return memberMatches && categoryMatches;
    });
  }, [group, selectedCategoryId, selectedMemberId]);

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));

    const response = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type
      })
    });

    if (response.ok) {
      const data = (await response.json()) as {
        bucket: string;
        path: string;
        token: string;
        publicUrl: string;
        contentType: string;
      };
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.storage
        .from(data.bucket)
        .uploadToSignedUrl(data.path, data.token, file, {
          contentType: data.contentType
        });

      if (!error) {
        setForm((current) => ({ ...current, imageUrl: data.publicUrl }));
      }
    }
  }

  async function handleCreateItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!group || !form.name.trim() || !form.categoryId || !form.memberId || isSavingItem) return;

    setIsSavingItem(true);
    const response = await fetch(`/api/groups/${params.groupId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setIsSavingItem(false);
    if (response.ok) {
      addItem(await response.json());
      setForm({
        ...emptyForm,
        categoryId: group.categories[0]?.id || "",
        memberId: group.members[0]?.id || ""
      });
      setPreviewUrl(null);
      setIsItemModalOpen(false);
    }
  }

  async function togglePurchased(item: ShoppingItem) {
    const response = await fetch(`/api/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPurchased: !item.isPurchased })
    });

    if (response.ok) {
      updateItem(await response.json());
    }
  }

  if (!group) return null;

  return (
    <div className="px-4 py-4">
      <section className="rounded-[28px] border-2 border-white bg-white/78 p-3 shadow-sticker">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <FilterChip label="전체" active={selectedMemberId === "all"} onClick={() => setSelectedMemberId("all")} />
          {group.members.map((member) => (
            <FilterChip
              key={member.id}
              label={member.name}
              active={selectedMemberId === member.id}
              onClick={() => setSelectedMemberId(member.id)}
            />
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pt-1">
          <CategoryChip
            category={{ id: "all", name: "전체", groupId: params.groupId }}
            active={selectedCategoryId === "all"}
            onSelect={() => setSelectedCategoryId("all")}
          />
          {group.categories.map((category) => (
            <CategoryChip
              key={category.id}
              category={category}
              active={selectedCategoryId === category.id}
              onSelect={() => setSelectedCategoryId(category.id)}
            />
          ))}
        </div>
      </section>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-sm font-bold text-ink/55">담긴 쇼핑템</p>
          <p className="text-3xl font-black">{filteredItems.length}개</p>
        </div>
        <p className="rounded-full bg-white px-3 py-2 text-xs font-black text-ink/60">
          구매완료 {group.items.filter((item) => item.isPurchased).length}
        </p>
      </div>

      <div className="mt-4 space-y-4">
        {filteredItems.map((item) => (
          <ItemCard key={item.id} item={item} onToggle={() => togglePurchased(item)} />
        ))}

        {filteredItems.length === 0 && (
          <EmptyState title="아직 담긴 아이템이 없어요" description="추가 버튼으로 첫 쇼핑템을 담아봐요." />
        )}
      </div>

      <AddItemButton onClick={() => setIsItemModalOpen(true)} />

      <button
        type="button"
        onClick={() => setIsItemModalOpen(true)}
        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[20px] bg-ink text-sm font-black text-white"
      >
        <Plus size={18} />
        쇼핑템 추가
      </button>

      {isItemModalOpen && (
        <AddItemModal
          form={form}
          previewUrl={previewUrl}
          categories={group.categories}
          members={group.members}
          isSaving={isSavingItem}
          onClose={() => setIsItemModalOpen(false)}
          onSubmit={handleCreateItem}
          onFormChange={setForm}
          onImageChange={handleImageChange}
        />
      )}
    </div>
  );
}

"use client";

import { FormEvent, useMemo, useState } from "react";
import { Check, LoaderCircle, Plus, UserRound } from "lucide-react";
import clsx from "clsx";
import { useWecartStore } from "@/stores/useWecartStore";
import { CategoryManager, EmptyState } from "../_components/group-ui";
import type { ShoppingItem } from "@/lib/types";

export default function CategoriesPage() {
  const { group, addCategory, removeCategory, updateCategory, updateItem } = useWecartStore();
  const [categoryName, setCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [savingWantKey, setSavingWantKey] = useState<string | null>(null);

  const selectedCategory = useMemo(() => {
    if (!group) return null;
    return group.categories.find((category) => category.id === selectedCategoryId) || group.categories[0] || null;
  }, [group, selectedCategoryId]);

  const selectedItems = useMemo(() => {
    if (!group || !selectedCategory) return [];
    return group.items.filter((item) => item.categoryId === selectedCategory.id);
  }, [group, selectedCategory]);

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = categoryName.trim();
    if (!group || !name) return;

    const response = await fetch(`/api/groups/${group.id}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });

    if (response.ok) {
      addCategory(await response.json());
      setCategoryName("");
    }
  }

  async function handleUpdateCategory(categoryId: string) {
    const name = editingCategoryName.trim();
    if (!name) return;

    const response = await fetch(`/api/categories/${categoryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });

    if (response.ok) {
      updateCategory(await response.json());
      setEditingCategoryId(null);
      setEditingCategoryName("");
    }
  }

  async function handleDeleteCategory(categoryId: string) {
    const response = await fetch(`/api/categories/${categoryId}`, {
      method: "DELETE"
    });

    if (response.ok) {
      removeCategory(categoryId);
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(null);
      }
    }
  }

  async function handleToggleWant(item: ShoppingItem, memberId: string) {
    if (!group) return;

    const wantKey = `${item.id}:${memberId}`;
    const checked = !item.wantedBy.some((want) => want.memberId === memberId);
    const member = group.members.find((entry) => entry.id === memberId);
    if (!member) return;

    const optimisticItem: ShoppingItem = {
      ...item,
      wantedBy: checked
        ? [
            ...item.wantedBy,
            {
              id: `optimistic-${wantKey}`,
              itemId: item.id,
              memberId,
              createdAt: new Date().toISOString(),
              member
            }
          ]
        : item.wantedBy.filter((want) => want.memberId !== memberId)
    };

    updateItem(optimisticItem);
    setSavingWantKey(wantKey);
    const response = await fetch(`/api/items/${item.id}/wants`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, checked })
    });

    setSavingWantKey(null);
    if (response.ok) {
      updateItem(await response.json());
    } else {
      updateItem(item);
    }
  }

  if (!group) return null;

  return (
    <div className="px-4 py-4">
      <section className="rounded-[28px] border-2 border-white bg-white/78 p-4 shadow-sticker">
        <p className="text-sm font-bold text-ink/55">카테고리 관리</p>
        <h2 className="mt-1 text-xl font-black">쇼핑 장소 정리</h2>

        <form onSubmit={handleCreateCategory} className="mt-4 flex gap-2">
          <input
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            placeholder="새 카테고리"
            className="h-12 min-w-0 flex-1 rounded-2xl border-2 border-ink/10 bg-cream px-3 text-sm font-bold outline-none focus:border-sakura"
          />
          <button className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mint text-ink">
            <Plus size={20} />
          </button>
        </form>
      </section>

      <div className="mt-4 space-y-3">
        {group.categories.map((category) => (
          <CategoryManager
            key={category.id}
            category={category}
            active={selectedCategory?.id === category.id}
            itemCount={group.items.filter((item) => item.categoryId === category.id).length}
            editingCategoryId={editingCategoryId}
            editingCategoryName={editingCategoryName}
            onSelect={() => setSelectedCategoryId(category.id)}
            onEdit={() => {
              setEditingCategoryId(category.id);
              setEditingCategoryName(category.name);
            }}
            onNameChange={setEditingCategoryName}
            onCancel={() => setEditingCategoryId(null)}
            onSave={() => handleUpdateCategory(category.id)}
            onDelete={() => handleDeleteCategory(category.id)}
          />
        ))}
      </div>

      <section className="mt-5 rounded-[28px] border-2 border-white bg-white/78 p-4 shadow-sticker">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-ink/55">카테고리별 체크</p>
            <h2 className="break-words text-xl font-black">
              {selectedCategory ? selectedCategory.name : "카테고리를 추가해요"}
            </h2>
          </div>
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-mint">
            <UserRound size={21} />
          </div>
        </div>

        <div className="space-y-3">
          {selectedItems.map((item) => (
            <article
              key={item.id}
              className="rounded-[24px] border-2 border-ink/10 bg-ivory p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words text-base font-black">{item.name}</p>
                  <p className="mt-1 text-xs font-bold text-ink/45">
                    처음 담은 사람 {item.member.name}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-ink/55">
                  {new Set([item.memberId, ...item.wantedBy.map((want) => want.memberId)]).size}명
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {group.members.map((member) => {
                  const isOwner = item.memberId === member.id;
                  const isChecked = isOwner || item.wantedBy.some((want) => want.memberId === member.id);
                  const wantKey = `${item.id}:${member.id}`;
                  const isSaving = savingWantKey === wantKey;
                  const hasLeadingIcon = isChecked || isSaving;

                  return (
                    <button
                      key={member.id}
                      type="button"
                      disabled={isOwner || savingWantKey === wantKey}
                      onClick={() => {
                        if (!isOwner) handleToggleWant(item, member.id);
                      }}
                      className={clsx(
                        "inline-flex h-10 items-center justify-center rounded-full border-2 px-4 text-sm font-black transition active:scale-95 disabled:opacity-80",
                        hasLeadingIcon && "gap-2 pl-3",
                        isChecked
                          ? "border-sakura bg-sakura text-white"
                          : "border-ink/10 bg-white text-ink/62",
                        isOwner && "cursor-default border-mint bg-mint text-ink"
                      )}
                    >
                      {hasLeadingIcon && (
                        <span
                          className={clsx(
                            "grid h-5 w-5 place-items-center rounded-full",
                            isOwner || isSaving ? "bg-white text-ink" : "bg-white/24"
                          )}
                        >
                          {isSaving ? (
                            <LoaderCircle className="animate-spin" size={14} />
                          ) : (
                            <Check size={14} strokeWidth={4} />
                          )}
                        </span>
                      )}
                      {member.name}
                    </button>
                  );
                })}
              </div>
            </article>
          ))}

          {selectedItems.length === 0 && (
            <EmptyState
              title="이 카테고리에는 쇼핑템이 없어요"
              description="쇼핑템 탭에서 아이템을 담으면 여기서 멤버들이 이름을 체크할 수 있어요."
            />
          )}
        </div>
      </section>
    </div>
  );
}

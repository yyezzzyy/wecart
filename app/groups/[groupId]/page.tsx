"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  Check,
  CirclePlus,
  ImagePlus,
  Pencil,
  Plus,
  ShoppingBag,
  Trash2,
  X
} from "lucide-react";
import clsx from "clsx";
import { useWecartStore } from "@/stores/useWecartStore";
import type { Category, ShoppingItem } from "@/lib/types";

type ItemForm = {
  name: string;
  categoryId: string;
  memberId: string;
  memo: string;
  imageUrl: string;
};

const emptyForm: ItemForm = {
  name: "",
  categoryId: "",
  memberId: "",
  memo: "",
  imageUrl: ""
};

export default function GroupPage() {
  const params = useParams<{ groupId: string }>();
  const groupId = params.groupId;
  const {
    group,
    isLoading,
    selectedMemberId,
    selectedCategoryId,
    setGroup,
    setLoading,
    setSelectedMemberId,
    setSelectedCategoryId,
    addCategory,
    updateCategory,
    removeCategory,
    addItem,
    updateItem
  } = useWecartStore();
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [form, setForm] = useState<ItemForm>(emptyForm);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadGroup() {
      setLoading(true);
      const response = await fetch(`/api/groups/${groupId}`);
      if (response.ok) {
        setGroup(await response.json());
      } else {
        setLoading(false);
      }
    }

    loadGroup();
  }, [groupId, setGroup, setLoading]);

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

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = categoryName.trim();
    if (!name) return;

    const response = await fetch(`/api/groups/${groupId}/categories`, {
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
    }
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    const body = new FormData();
    body.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body
    });

    if (response.ok) {
      const data = (await response.json()) as { imageUrl: string };
      setForm((current) => ({ ...current, imageUrl: data.imageUrl }));
    }
  }

  async function handleCreateItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.categoryId || !form.memberId || isSavingItem) return;

    setIsSavingItem(true);
    const response = await fetch(`/api/groups/${groupId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setIsSavingItem(false);
    if (response.ok) {
      addItem(await response.json());
      setForm({
        ...emptyForm,
        categoryId: group?.categories[0]?.id || "",
        memberId: group?.members[0]?.id || ""
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

  if (isLoading || !group) {
    return (
      <div className="grid min-h-dvh place-items-center px-6">
        <div className="rounded-[30px] bg-white/80 p-6 text-center shadow-sticker">
          <ShoppingBag className="mx-auto mb-3 text-sakura" size={34} />
          <p className="font-black">리스트를 꺼내는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative min-h-dvh pb-28">
      <header className="sticky top-0 z-20 border-b border-white/70 bg-ivory/92 px-4 pb-4 pt-5 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-sakura">WECART</p>
            <h1 className="mt-1 text-2xl font-black text-ink">사야돼 리스트</h1>
          </div>
          <div className="rounded-2xl bg-white px-3 py-2 text-right shadow-sm">
            <p className="text-xs font-bold text-ink/50">멤버</p>
            <p className="text-sm font-black">{group.members.length}명</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          <FilterChip
            label="전체"
            active={selectedMemberId === "all"}
            onClick={() => setSelectedMemberId("all")}
          />
          {group.members.map((member) => (
            <FilterChip
              key={member.id}
              label={member.name}
              active={selectedMemberId === member.id}
              onClick={() => setSelectedMemberId(member.id)}
            />
          ))}
        </div>
      </header>

      <div className="px-4 py-4">
        <div className="rounded-[28px] border-2 border-white bg-white/78 p-3 shadow-sticker">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <CategoryChip
              category={{ id: "all", name: "전체", groupId }}
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

          <form onSubmit={handleCreateCategory} className="mt-2 flex gap-2">
            <input
              value={categoryName}
              onChange={(event) => setCategoryName(event.target.value)}
              placeholder="새 카테고리"
              className="h-11 min-w-0 flex-1 rounded-2xl border-2 border-ink/10 bg-cream px-3 text-sm font-bold outline-none focus:border-sakura"
            />
            <button className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-mint text-ink">
              <Plus size={20} />
            </button>
          </form>
        </div>

        <div className="mt-4 space-y-3">
          {group.categories.map((category) => (
            <CategoryManager
              key={category.id}
              category={category}
              editingCategoryId={editingCategoryId}
              editingCategoryName={editingCategoryName}
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
            <div className="rounded-[30px] border-2 border-dashed border-sakura/35 bg-white/66 px-5 py-12 text-center">
              <ShoppingBag className="mx-auto mb-3 text-sakura" size={34} />
              <p className="font-black">아직 담긴 아이템이 없어요</p>
              <p className="mt-2 text-sm text-ink/55">오른쪽 아래 버튼으로 첫 쇼핑템을 추가해요.</p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setIsItemModalOpen(true)}
        className="fixed bottom-5 left-1/2 z-30 inline-flex h-16 w-[min(calc(100%-40px),390px)] -translate-x-1/2 items-center justify-center gap-2 rounded-[24px] bg-sakura text-lg font-black text-white shadow-sticker active:scale-[0.98]"
      >
        <CirclePlus size={24} />
        아이템 추가
      </button>

      {isItemModalOpen && (
        <div className="fixed inset-0 z-40 grid place-items-end bg-ink/35 px-3 backdrop-blur-sm">
          <form
            onSubmit={handleCreateItem}
            className="mb-3 w-full max-w-[430px] rounded-[32px] bg-ivory p-4 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black">쇼핑템 추가</h2>
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full bg-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="상품명"
                className="h-[52px] w-full rounded-2xl border-2 border-ink/10 bg-white px-4 font-bold outline-none focus:border-sakura"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={form.categoryId}
                  onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
                  className="h-[52px] rounded-2xl border-2 border-ink/10 bg-white px-3 font-bold outline-none"
                >
                  {group.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <select
                  value={form.memberId}
                  onChange={(event) => setForm({ ...form, memberId: event.target.value })}
                  className="h-[52px] rounded-2xl border-2 border-ink/10 bg-white px-3 font-bold outline-none"
                >
                  {group.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex min-h-28 cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-sakura/45 bg-white p-3">
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-cream">
                  {previewUrl ? (
                    <Image src={previewUrl} alt="" width={64} height={64} className="h-full w-full object-cover" />
                  ) : (
                    <ImagePlus className="text-sakura" size={25} />
                  )}
                </div>
                <div>
                  <p className="font-black">이미지 업로드</p>
                  <p className="mt-1 text-xs leading-5 text-ink/55">캡쳐 이미지나 상품 사진을 올려요.</p>
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
              </label>

              <textarea
                value={form.memo}
                onChange={(event) => setForm({ ...form, memo: event.target.value })}
                placeholder="메모"
                rows={3}
                className="w-full resize-none rounded-2xl border-2 border-ink/10 bg-white px-4 py-3 font-bold outline-none focus:border-sakura"
              />
            </div>

            <button
              disabled={isSavingItem || !form.name.trim() || !form.categoryId || !form.memberId}
              className="mt-4 h-14 w-full rounded-[22px] bg-ink text-base font-black text-white disabled:bg-ink/30"
            >
              {isSavingItem ? "저장 중..." : "저장"}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "h-10 shrink-0 rounded-full border-2 px-4 text-sm font-black transition",
        active ? "border-ink bg-ink text-white" : "border-white bg-white text-ink"
      )}
    >
      {label}
    </button>
  );
}

function CategoryChip({
  category,
  active,
  onSelect
}: {
  category: Category;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={clsx(
        "h-10 shrink-0 rounded-2xl border-2 px-4 text-sm font-black transition",
        active ? "border-sakura bg-sakura text-white" : "border-ink/10 bg-cream text-ink"
      )}
    >
      {category.name}
    </button>
  );
}

function CategoryManager({
  category,
  editingCategoryId,
  editingCategoryName,
  onEdit,
  onNameChange,
  onCancel,
  onSave,
  onDelete
}: {
  category: Category;
  editingCategoryId: string | null;
  editingCategoryName: string;
  onEdit: () => void;
  onNameChange: (name: string) => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  const isEditing = editingCategoryId === category.id;

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white/72 p-2">
      {isEditing ? (
        <input
          value={editingCategoryName}
          onChange={(event) => onNameChange(event.target.value)}
          className="h-10 min-w-0 flex-1 rounded-xl border-2 border-sakura bg-ivory px-3 text-sm font-bold outline-none"
        />
      ) : (
        <p className="min-w-0 flex-1 px-2 text-sm font-black">{category.name}</p>
      )}
      {isEditing ? (
        <>
          <button onClick={onSave} className="grid h-10 w-10 place-items-center rounded-xl bg-mint">
            <Check size={18} />
          </button>
          <button onClick={onCancel} className="grid h-10 w-10 place-items-center rounded-xl bg-cream">
            <X size={18} />
          </button>
        </>
      ) : (
        <>
          <button onClick={onEdit} className="grid h-10 w-10 place-items-center rounded-xl bg-cream">
            <Pencil size={17} />
          </button>
          <button onClick={onDelete} className="grid h-10 w-10 place-items-center rounded-xl bg-peach/80">
            <Trash2 size={17} />
          </button>
        </>
      )}
    </div>
  );
}

function ItemCard({ item, onToggle }: { item: ShoppingItem; onToggle: () => void }) {
  return (
    <article
      className={clsx(
        "overflow-hidden rounded-[30px] border-2 border-white bg-white/84 shadow-sticker transition",
        item.isPurchased && "opacity-55"
      )}
    >
      {item.imageUrl && (
        <div className="relative aspect-[16/10] w-full bg-cream">
          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="390px" />
          {item.isPurchased && (
            <div className="absolute inset-0 grid place-items-center bg-white/25">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-mint text-ink">
                <Check size={34} strokeWidth={4} />
              </div>
            </div>
          )}
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="break-words text-lg font-black">{item.name}</p>
            {item.memo && <p className="mt-1 break-words text-sm leading-6 text-ink/60">{item.memo}</p>}
          </div>
          <button
            onClick={onToggle}
            className={clsx(
              "grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-2",
              item.isPurchased ? "border-mint bg-mint" : "border-ink/10 bg-cream"
            )}
          >
            <Check size={22} strokeWidth={4} />
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-sakura/16 px-3 py-1 text-xs font-black text-sakura">
            {item.member.name}
          </span>
          <span className="rounded-full bg-sky/28 px-3 py-1 text-xs font-black text-ink/65">
            {item.category.name}
          </span>
        </div>
      </div>
    </article>
  );
}

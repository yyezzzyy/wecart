"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import type { ShoppingItem } from "@/lib/types";
import { compressImage } from "@/lib/compressImage";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";
import { matchesKoreanSearch } from "@/lib/koreanSearch";
import { useWecartStore } from "@/stores/useWecartStore";
import {
  AddItemButton,
  AddItemModal,
  CategoryChip,
  DeleteItemConfirmModal,
  EmptyState,
  FilterChip,
  ItemCard,
  SearchBar
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

type ItemResponse = Omit<ShoppingItem, "member" | "category" | "wantedBy" | "purchases">;

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
    updateItem,
    removeItem
  } = useWecartStore();
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [form, setForm] = useState<ItemForm>(emptyForm);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [savingWantKey, setSavingWantKey] = useState<string | null>(null);
  const [savingPurchaseKey, setSavingPurchaseKey] = useState<string | null>(null);
  const [deleteTargetItem, setDeleteTargetItem] = useState<ShoppingItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
      const memberMatches =
        selectedMemberId === "all" ||
        item.memberId === selectedMemberId ||
        item.wantedBy.some((want) => want.memberId === selectedMemberId);
      const categoryMatches = selectedCategoryId === "all" || item.categoryId === selectedCategoryId;
      const searchTarget = [
        item.name,
        item.memo ?? "",
        item.category.name,
        item.member.name,
        ...item.wantedBy.map((want) => want.member.name)
      ].join(" ");

      return memberMatches && categoryMatches && matchesKoreanSearch(searchTarget, searchQuery);
    });
  }, [group, searchQuery, selectedCategoryId, selectedMemberId]);

  function hydrateItem(item: ItemResponse, previousItem?: ShoppingItem): ShoppingItem | null {
    if (!group) return null;

    const member = group.members.find((entry) => entry.id === item.memberId);
    const category = group.categories.find((entry) => entry.id === item.categoryId);
    if (!member || !category) return null;

    return {
      ...item,
      member,
      category,
      wantedBy: previousItem?.wantedBy ?? [],
      purchases: previousItem?.purchases ?? []
    };
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploadingImage(true);

    let uploadFile: File;
    try {
      const compressed = await compressImage(file);
      uploadFile = compressed.file;
      setPreviewUrl(compressed.previewUrl);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "이미지 압축에 실패했어요.");
      setIsUploadingImage(false);
      return;
    }

    let response: Response;
    try {
      response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: uploadFile.name,
          contentType: uploadFile.type
        })
      });
    } catch {
      setUploadError("업로드 준비에 실패했어요.");
      setIsUploadingImage(false);
      return;
    }

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      setUploadError(data?.message || "업로드 준비에 실패했어요.");
      setIsUploadingImage(false);
      return;
    }

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
      .uploadToSignedUrl(data.path, data.token, uploadFile, {
        contentType: data.contentType
      });

    if (error) {
      setUploadError(error.message);
      setIsUploadingImage(false);
      return;
    }

    setForm((current) => ({ ...current, imageUrl: data.publicUrl }));
    setIsUploadingImage(false);
  }

  function openCreateModal() {
    if (!group) return;
    setEditingItem(null);
    setPreviewUrl(null);
    setUploadError(null);
    setIsUploadingImage(false);
    setForm({
      ...emptyForm,
      categoryId: group.categories[0]?.id || "",
      memberId: group.members[0]?.id || ""
    });
    setIsItemModalOpen(true);
  }

  function openEditModal(item: ShoppingItem) {
    setEditingItem(item);
    setPreviewUrl(null);
    setUploadError(null);
    setIsUploadingImage(false);
    setForm({
      name: item.name,
      categoryId: item.categoryId,
      memberId: item.memberId,
      memo: item.memo || "",
      imageUrl: item.imageUrl || "",
      mapUrl: item.mapUrl || "",
      referenceUrl: item.referenceUrl || ""
    });
    setIsItemModalOpen(true);
  }

  function closeItemModal() {
    setIsItemModalOpen(false);
    setEditingItem(null);
    setPreviewUrl(null);
    setUploadError(null);
    setIsUploadingImage(false);
  }

  async function handleSaveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!group || !form.name.trim() || !form.categoryId || !form.memberId || isSavingItem) return;

    setIsSavingItem(true);
    try {
      const response = await fetch(
        editingItem ? `/api/items/${editingItem.id}` : `/api/groups/${params.groupId}/items`,
        {
          method: editingItem ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        }
      );

      if (response.ok) {
        const item = hydrateItem(await response.json(), editingItem ?? undefined);
        if (!item) return;

        if (editingItem) {
          updateItem(item);
        } else {
          addItem(item);
        }
        setForm({
          ...emptyForm,
          categoryId: group.categories[0]?.id || "",
          memberId: group.members[0]?.id || ""
        });
        closeItemModal();
      }
    } finally {
      setIsSavingItem(false);
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
        : item.wantedBy.filter((want) => want.memberId !== memberId),
      purchases: checked
        ? item.purchases
        : item.purchases.filter((purchase) => purchase.memberId !== memberId)
    };

    updateItem(optimisticItem);
    setSavingWantKey(wantKey);
    try {
      const response = await fetch(`/api/items/${item.id}/wants`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, checked })
      });

      if (!response.ok) {
        updateItem(item);
      }
    } catch {
      updateItem(item);
    } finally {
      setSavingWantKey(null);
    }
  }

  async function handleTogglePurchase(item: ShoppingItem, memberId: string) {
    if (!group || savingPurchaseKey) return;

    const purchaseKey = `${item.id}:${memberId}`;
    const member = group.members.find((entry) => entry.id === memberId);
    if (!member) return;

    const currentPurchase = item.purchases.find((purchase) => purchase.memberId === memberId);
    const isPurchased = !currentPurchase?.isPurchased;
    const optimisticItem: ShoppingItem = {
      ...item,
      purchases: currentPurchase
        ? item.purchases.map((purchase) =>
            purchase.memberId === memberId ? { ...purchase, isPurchased } : purchase
          )
        : [
            ...item.purchases,
            {
              id: `optimistic-purchase-${purchaseKey}`,
              itemId: item.id,
              memberId,
              isPurchased,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              member
            }
          ]
    };

    updateItem(optimisticItem);
    setSavingPurchaseKey(purchaseKey);
    try {
      const response = await fetch(`/api/items/${item.id}/purchases`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, isPurchased })
      });

      if (!response.ok) {
        updateItem(item);
      }
    } catch {
      updateItem(item);
    } finally {
      setSavingPurchaseKey(null);
    }
  }

  async function handleDeleteItem() {
    if (!deleteTargetItem || selectedMemberId === "all" || deletingItemId) return;

    setDeletingItemId(deleteTargetItem.id);
    try {
      const response = await fetch(`/api/items/${deleteTargetItem.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: selectedMemberId })
      });

      if (response.ok) {
        removeItem(deleteTargetItem.id);
        if (editingItem?.id === deleteTargetItem.id) {
          closeItemModal();
        }
        setDeleteTargetItem(null);
      }
    } finally {
      setDeletingItemId(null);
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

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onClear={() => setSearchQuery("")}
      />

      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-sm font-bold text-ink/55">담긴 쇼핑템</p>
          <p className="text-3xl font-black">{filteredItems.length}개</p>
        </div>
        <p className="rounded-full bg-white px-3 py-2 text-xs font-black text-ink/60">
          구매완료 {group.items.reduce((sum, item) => sum + item.purchases.filter((purchase) => purchase.isPurchased).length, 0)}
        </p>
      </div>

      <div className="mt-4 space-y-4">
        {filteredItems.map((item) => {
          const canDeleteItem = selectedMemberId !== "all" && item.memberId === selectedMemberId;

          return (
            <ItemCard
              key={item.id}
              item={item}
              members={group.members}
              savingWantKey={savingWantKey}
              savingPurchaseKey={savingPurchaseKey}
              selectedMemberId={selectedMemberId}
              onEdit={() => openEditModal(item)}
              onToggleWant={(memberId) => handleToggleWant(item, memberId)}
              onTogglePurchase={(memberId) => handleTogglePurchase(item, memberId)}
              onDelete={canDeleteItem ? () => setDeleteTargetItem(item) : undefined}
            />
          );
        })}

        {filteredItems.length === 0 && (
          <EmptyState
            title={searchQuery.trim() ? "검색 결과가 없어요" : "아직 담긴 아이템이 없어요"}
            description={
              searchQuery.trim()
                ? "초성이나 자모를 조금 줄여서 다시 찾아봐요."
                : "추가 버튼으로 첫 쇼핑템을 담아봐요."
            }
          />
        )}
      </div>

      <AddItemButton onClick={openCreateModal} />

      <button
        type="button"
        onClick={openCreateModal}
        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[20px] bg-ink text-sm font-black text-white"
      >
        <Plus size={18} />
        쇼핑템 추가
      </button>

      {isItemModalOpen && (
        <AddItemModal
          mode={editingItem ? "edit" : "create"}
          form={form}
          previewUrl={previewUrl}
          categories={group.categories}
          members={group.members}
          isSaving={isSavingItem}
          onClose={closeItemModal}
          onSubmit={handleSaveItem}
          onFormChange={setForm}
          onImageChange={handleImageChange}
          uploadError={uploadError}
          isUploadingImage={isUploadingImage}
        />
      )}

      {deleteTargetItem && (
        <DeleteItemConfirmModal
          item={deleteTargetItem}
          isDeleting={deletingItemId === deleteTargetItem.id}
          onClose={() => {
            if (!deletingItemId) setDeleteTargetItem(null);
          }}
          onConfirm={handleDeleteItem}
        />
      )}
    </div>
  );
}

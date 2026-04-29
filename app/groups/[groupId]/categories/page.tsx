"use client";

import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";
import { useWecartStore } from "@/stores/useWecartStore";
import { CategoryManager } from "../_components/group-ui";

export default function CategoriesPage() {
  const { group, addCategory, removeCategory, updateCategory } = useWecartStore();
  const [categoryName, setCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");

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
            itemCount={group.items.filter((item) => item.categoryId === category.id).length}
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
    </div>
  );
}

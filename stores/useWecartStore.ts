"use client";

import { create } from "zustand";
import type { Category, GroupDetail, Member, ShoppingItem } from "@/lib/types";

type WecartState = {
  group: GroupDetail | null;
  selectedMemberId: string;
  selectedCategoryId: string;
  isLoading: boolean;
  setGroup: (group: GroupDetail) => void;
  setLoading: (isLoading: boolean) => void;
  setSelectedMemberId: (memberId: string) => void;
  setSelectedCategoryId: (categoryId: string) => void;
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  removeCategory: (categoryId: string) => void;
  addItem: (item: ShoppingItem) => void;
  updateItem: (item: ShoppingItem) => void;
};

export const useWecartStore = create<WecartState>((set) => ({
  group: null,
  selectedMemberId: "all",
  selectedCategoryId: "all",
  isLoading: true,
  setGroup: (group) => set({ group, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setSelectedMemberId: (memberId) => set({ selectedMemberId: memberId }),
  setSelectedCategoryId: (categoryId) => set({ selectedCategoryId: categoryId }),
  addCategory: (category) =>
    set((state) =>
      state.group
        ? { group: { ...state.group, categories: [...state.group.categories, category] } }
        : state
    ),
  updateCategory: (category) =>
    set((state) =>
      state.group
        ? {
            group: {
              ...state.group,
              categories: state.group.categories.map((item) => (item.id === category.id ? category : item))
            }
          }
        : state
    ),
  removeCategory: (categoryId) =>
    set((state) =>
      state.group
        ? {
            selectedCategoryId: state.selectedCategoryId === categoryId ? "all" : state.selectedCategoryId,
            group: {
              ...state.group,
              categories: state.group.categories.filter((item) => item.id !== categoryId),
              items: state.group.items.filter((item) => item.categoryId !== categoryId)
            }
          }
        : state
    ),
  addItem: (item) =>
    set((state) =>
      state.group ? { group: { ...state.group, items: [item, ...state.group.items] } } : state
    ),
  updateItem: (item) =>
    set((state) =>
      state.group
        ? {
            group: {
              ...state.group,
              items: state.group.items.map((entry) => (entry.id === item.id ? item : entry))
            }
          }
        : state
    )
}));

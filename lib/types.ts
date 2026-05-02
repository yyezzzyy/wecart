export type Member = {
  id: string;
  name: string;
  groupId: string;
};

export type Category = {
  id: string;
  name: string;
  groupId: string;
};

export type ShoppingItem = {
  id: string;
  name: string;
  memo: string | null;
  imageUrl: string | null;
  mapUrl: string | null;
  referenceUrl: string | null;
  isPurchased: boolean;
  groupId: string;
  memberId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  member: Member;
  category: Category;
  wantedBy: ShoppingItemWant[];
};

export type GroupDetail = {
  id: string;
  name: string;
  members: Member[];
  categories: Category[];
  items: ShoppingItem[];
};

export type ShoppingItemWant = {
  id: string;
  itemId: string;
  memberId: string;
  createdAt: string;
  member: Member;
};

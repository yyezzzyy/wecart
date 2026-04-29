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
  isPurchased: boolean;
  groupId: string;
  memberId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  member: Member;
  category: Category;
};

export type GroupDetail = {
  id: string;
  name: string;
  members: Member[];
  categories: Category[];
  items: ShoppingItem[];
};

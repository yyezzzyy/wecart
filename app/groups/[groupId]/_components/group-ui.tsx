'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Check,
  ChevronDown,
  CirclePlus,
  ImagePlus,
  LayoutGrid,
  LoaderCircle,
  MapPin,
  Newspaper,
  ExternalLink,
  ListChecks,
  Maximize2,
  Pencil,
  Search,
  ShoppingBag,
  Trash2,
  UserPlus,
  UserRound,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import type { Category, Member, ShoppingItem } from '@/lib/types';

export type MemberSummary = {
  member: Member;
  items: ShoppingItem[];
  totalCount: number;
  purchasedCount: number;
  remainingCount: number;
};

type ItemForm = {
  name: string;
  categoryId: string;
  memberId: string;
  memo: string;
  imageUrl: string;
  mapUrl: string;
  referenceUrl: string;
};

export function GroupLoading() {
  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="rounded-[30px] bg-white/80 p-6 text-center shadow-sticker">
        <LoaderCircle
          className="mx-auto mb-3 animate-spin text-sakura"
          size={34}
        />
        <p className="font-black">리스트를 꺼내는 중...</p>
      </div>
    </div>
  );
}

export function GroupHeader({
  title,
  subtitle,
  memberCount,
}: {
  title: string;
  subtitle: string;
  memberCount: number;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-ivory/92 px-4 pb-4 pt-5 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-sakura">
            WECART
          </p>
          <h1 className="mt-1 text-2xl font-black text-ink">{title}</h1>
          <p className="mt-1 text-xs font-bold text-ink/50">{subtitle}</p>
        </div>
        <div className="rounded-2xl bg-white px-3 py-2 text-right shadow-sm">
          <p className="text-xs font-bold text-ink/50">멤버</p>
          <p className="text-sm font-black">{memberCount}명</p>
        </div>
      </div>
    </header>
  );
}

export function BottomTabs({ groupId }: { groupId: string }) {
  const pathname = usePathname();
  const tabs = [
    { href: `/groups/${groupId}/members`, label: '멤버', icon: UserRound },
    { href: `/groups/${groupId}/items`, label: '쇼핑템', icon: ListChecks },
    {
      href: `/groups/${groupId}/categories`,
      label: '카테고리',
      icon: LayoutGrid,
    },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 z-30 grid w-[min(calc(100%-28px),402px)] -translate-x-1/2 grid-cols-3 gap-2 rounded-[26px] border-2 border-white bg-white/92 p-2 shadow-sticker backdrop-blur">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={clsx(
              'flex h-[52px] flex-col items-center justify-center gap-1 rounded-[20px] text-xs font-black transition',
              active ? 'bg-ink text-white' : 'bg-cream text-ink/60',
            )}
          >
            <Icon size={19} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'h-10 shrink-0 rounded-full border-2 px-4 text-sm font-black transition',
        active
          ? 'border-ink bg-ink text-white'
          : 'border-white bg-white text-ink',
      )}
    >
      {label}
    </button>
  );
}

export function CategoryChip({
  category,
  active,
  onSelect,
}: {
  category: Category;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        'h-10 shrink-0 rounded-2xl border-2 px-4 text-sm font-black transition',
        active
          ? 'border-sakura bg-sakura text-white'
          : 'border-ink/10 bg-cream text-ink',
      )}
    >
      {category.name}
    </button>
  );
}

export function SearchBar({
  value,
  onChange,
  onClear,
}: {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="mt-4 rounded-[24px] border-2 border-white bg-white/78 p-2 shadow-sticker">
      <label className="flex h-12 items-center gap-2 rounded-[18px] bg-ivory px-3">
        <Search className="shrink-0 text-sakura" size={19} />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="쇼핑템 검색 (초성 가능)"
          className="min-w-0 flex-1 bg-transparent text-sm font-black text-ink outline-none placeholder:text-ink/35"
          autoComplete="off"
          inputMode="search"
        />

        {value && (
          <button
            type="button"
            onClick={onClear}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-ink/55"
            aria-label="검색어 지우기"
          >
            <X size={17} />
          </button>
        )}
      </label>
    </div>
  );
}

export function MemberSummaryCard({
  summary,
  active,
  onSelect,
}: {
  summary: MemberSummary;
  active: boolean;
  onSelect: () => void;
}) {
  const previewItems = summary.items.slice(0, 3);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        'w-full rounded-[24px] border-2 p-3 text-left transition active:scale-[0.99]',
        active ? 'border-sakura bg-sakura/12' : 'border-ink/10 bg-ivory',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="break-words text-lg font-black">
            {summary.member.name}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-ink/65">
              전체 {summary.totalCount}
            </span>
            <span className="rounded-full bg-mint/70 px-3 py-1 text-xs font-black text-ink/70">
              완료 {summary.purchasedCount}
            </span>
            <span className="rounded-full bg-peach/60 px-3 py-1 text-xs font-black text-ink/70">
              남음 {summary.remainingCount}
            </span>
          </div>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white">
          <UserRound size={20} className="text-sakura" />
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {previewItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-2 rounded-2xl bg-white/75 px-3 py-2"
          >
            <span
              className={clsx(
                'min-w-0 truncate text-sm font-black',
                item.purchases.some(
                  (purchase) =>
                    purchase.memberId === summary.member.id &&
                    purchase.isPurchased,
                ) && 'text-ink/40 line-through',
              )}
            >
              {item.name}
            </span>
            <span className="shrink-0 rounded-full bg-sky/24 px-2 py-1 text-[11px] font-black text-ink/55">
              {item.category.name}
            </span>
          </div>
        ))}

        {summary.totalCount === 0 && (
          <p className="rounded-2xl bg-white/70 px-3 py-3 text-sm font-bold text-ink/45">
            아직 담긴 아이템이 없어요.
          </p>
        )}
      </div>
    </button>
  );
}

export function CategoryManager({
  category,
  itemCount,
  active,
  editingCategoryId,
  editingCategoryName,
  isSaving,
  isDeleting,
  onSelect,
  onEdit,
  onNameChange,
  onCancel,
  onSave,
  onDelete,
}: {
  category: Category;
  itemCount: number;
  active?: boolean;
  editingCategoryId: string | null;
  editingCategoryName: string;
  isSaving?: boolean;
  isDeleting?: boolean;
  onSelect?: () => void;
  onEdit: () => void;
  onNameChange: (name: string) => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  const isEditing = editingCategoryId === category.id;
  const isBusy = Boolean(isSaving || isDeleting);

  return (
    <div
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (!onSelect || (event.key !== 'Enter' && event.key !== ' ')) return;
        event.preventDefault();
        onSelect();
      }}
      className={clsx(
        'rounded-[24px] border-2 bg-white/78 p-3 shadow-sticker transition',
        active ? 'border-sakura' : 'border-white',
      )}
    >
      <div className="flex items-center gap-2">
        {isEditing ? (
          <input
            value={editingCategoryName}
            onChange={(event) => onNameChange(event.target.value)}
            disabled={isBusy}
            className="h-11 min-w-0 flex-1 rounded-2xl border-2 border-sakura bg-ivory px-3 text-sm font-bold outline-none disabled:opacity-60"
          />
        ) : (
          <div className="min-w-0 flex-1">
            <p className="break-words text-lg font-black">{category.name}</p>
            <p className="mt-1 text-xs font-bold text-ink/45">
              담긴 쇼핑템 {itemCount}개
            </p>
          </div>
        )}

        {isEditing ? (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onSave();
              }}
              disabled={isBusy}
              className="grid h-11 w-11 place-items-center rounded-2xl bg-mint disabled:opacity-50"
            >
              {isSaving ? (
                <LoaderCircle className="animate-spin" size={18} />
              ) : (
                <Check size={18} />
              )}
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onCancel();
              }}
              disabled={isBusy}
              className="grid h-11 w-11 place-items-center rounded-2xl bg-cream disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onEdit();
              }}
              disabled={isBusy}
              className="grid h-11 w-11 place-items-center rounded-2xl bg-cream disabled:opacity-50"
            >
              <Pencil size={17} />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
              disabled={isBusy}
              className="grid h-11 w-11 place-items-center rounded-2xl bg-peach/80 disabled:opacity-50"
            >
              {isDeleting ? (
                <LoaderCircle className="animate-spin" size={17} />
              ) : (
                <Trash2 size={17} />
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function ItemCard({
  item,
  members,
  savingWantKey,
  savingPurchaseKey,
  selectedMemberId,
  onEdit,
  onToggleWant,
  onTogglePurchase,
  onDelete,
}: {
  item: ShoppingItem;
  members?: Member[];
  savingWantKey?: string | null;
  savingPurchaseKey?: string | null;
  selectedMemberId?: string;
  onEdit: () => void;
  onToggleWant?: (memberId: string) => void;
  onTogglePurchase?: (memberId: string) => void;
  onDelete?: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const checkedMemberCount = new Set([
    item.memberId,
    ...item.wantedBy.map((want) => want.memberId),
  ]).size;
  const purchasedMemberCount = item.purchases.filter(
    (purchase) => purchase.isPurchased,
  ).length;
  const isPurchasedForSelectedMember =
    Boolean(selectedMemberId) &&
    selectedMemberId !== 'all' &&
    item.purchases.some(
      (purchase) =>
        purchase.memberId === selectedMemberId && purchase.isPurchased,
    );

  return (
    <>
      <article
        className={clsx(
          'overflow-hidden rounded-[26px] border-2 border-white bg-white/84 shadow-sticker transition duration-300',
          isExpanded && 'translate-y-[-1px] border-sakura/30',
          isPurchasedForSelectedMember && 'opacity-60',
        )}
      >
        <div className="p-3">
          <div className="grid min-h-[68px] grid-cols-[minmax(0,1fr)_44px_44px] items-center gap-2">
            <div className="min-w-0 flex-1">
              <p
                className={clsx(
                  'truncate text-base font-black',
                  isPurchasedForSelectedMember && 'line-through',
                )}
              >
                {item.name}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-sakura/16 px-2.5 py-1 text-[11px] font-black text-sakura">
                  {item.member.name}
                </span>
                <span className="rounded-full bg-sky/28 px-2.5 py-1 text-[11px] font-black text-ink/65">
                  {item.category.name}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onEdit}
              className="grid h-11 w-11 place-items-center rounded-2xl border-2 border-ink/10 bg-white text-ink transition active:scale-95"
              aria-label={`${item.name} 수정`}
            >
              <Pencil size={17} />
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded((current) => !current)}
              className="grid h-11 w-11 place-items-center rounded-2xl bg-ink text-white transition active:scale-95"
              aria-label={`${item.name} 상세 ${isExpanded ? '닫기' : '보기'}`}
            >
              <ChevronDown
                className={clsx(
                  'transition duration-300 ease-out',
                  isExpanded && 'rotate-180',
                )}
                size={22}
              />
            </button>
          </div>

          <div
            className={clsx(
              'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
              isExpanded
                ? 'grid-rows-[1fr] opacity-100'
                : 'grid-rows-[0fr] opacity-0',
            )}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="mt-3 border-t-2 border-cream pt-4">
                {members &&
                  members.length > 0 &&
                  onToggleWant &&
                  onTogglePurchase && (
                    <div className="mb-4 rounded-[20px] border-2 border-cream bg-ivory p-2">
                      <div className="mb-2 flex items-center justify-between gap-2 px-1">
                        <p className="text-xs font-black text-ink/50">
                          멤버 / 구매
                        </p>
                        <p className="text-xs font-black text-sakura">
                          함께 {checkedMemberCount} · 구매{' '}
                          {purchasedMemberCount}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {members.map((member) => {
                          const isOwner = item.memberId === member.id;
                          const isIncluded =
                            isOwner ||
                            item.wantedBy.some(
                              (want) => want.memberId === member.id,
                            );
                          const isPurchased = item.purchases.some(
                            (purchase) =>
                              purchase.memberId === member.id &&
                              purchase.isPurchased,
                          );
                          const wantKey = `${item.id}:${member.id}`;
                          const purchaseKey = `${item.id}:${member.id}`;
                          const isSavingWant = savingWantKey === wantKey;
                          const isSavingPurchase =
                            savingPurchaseKey === purchaseKey;

                          return isIncluded ? (
                            <div
                              key={member.id}
                              className={clsx(
                                'inline-flex h-10 items-center overflow-hidden rounded-full border-2 bg-white text-sm font-black shadow-sm',
                                isPurchased ? 'border-mint' : 'border-ink/10',
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  if (!isOwner) onToggleWant(member.id);
                                }}
                                disabled={isOwner || isSavingWant}
                                className={clsx(
                                  'inline-flex h-full items-center gap-2 rounded-l-full px-3 pr-2 transition active:scale-95 disabled:opacity-80',
                                  isOwner
                                    ? 'cursor-default text-ink'
                                    : 'text-ink',
                                )}
                              >
                                <span
                                  className={clsx(
                                    'grid h-5 w-5 place-items-center rounded-full',
                                    isOwner
                                      ? 'bg-sky text-ink'
                                      : 'bg-peach/45 text-ink/65',
                                  )}
                                >
                                  {isSavingWant ? (
                                    <LoaderCircle
                                      className="animate-spin"
                                      size={14}
                                    />
                                  ) : (
                                    <UserRound size={13} strokeWidth={3} />
                                  )}
                                </span>
                                <span className="max-w-24 truncate">
                                  {member.name}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onTogglePurchase(member.id)}
                                disabled={isSavingPurchase}
                                className={clsx(
                                  'mr-1 grid h-5 w-5 place-items-center rounded-full transition active:scale-95 disabled:opacity-70',
                                  isPurchased
                                    ? 'bg-mint text-ink'
                                    : 'bg-cream text-ink/45',
                                )}
                                aria-label={`${member.name} 구매 완료`}
                              >
                                {isSavingPurchase ? (
                                  <LoaderCircle
                                    className="animate-spin"
                                    size={15}
                                  />
                                ) : (
                                  <ShoppingBag size={13} strokeWidth={3} />
                                )}
                              </button>
                            </div>
                          ) : (
                            <button
                              key={member.id}
                              type="button"
                              onClick={() => onToggleWant(member.id)}
                              disabled={isSavingWant}
                              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border-2 border-ink/10 bg-white px-3 pr-4 text-sm font-black text-ink/62 transition active:scale-95 disabled:opacity-70"
                            >
                              <span className="grid h-5 w-5 place-items-center rounded-full bg-cream text-ink/45">
                                {isSavingWant ? (
                                  <LoaderCircle
                                    className="animate-spin"
                                    size={14}
                                  />
                                ) : (
                                  <UserPlus size={13} strokeWidth={3} />
                                )}
                              </span>
                              <span className="max-w-24 truncate">
                                {member.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                {item.wantedBy.length > 0 && (
                  <div className="mb-4 rounded-[20px] bg-sakura/10 px-3 py-3">
                    <p className="text-xs font-black text-sakura">
                      같이 사고 싶은 멤버
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.wantedBy.map((want) => (
                        <span
                          key={want.id}
                          className="rounded-full bg-white px-3 py-1 text-xs font-black text-ink/70"
                        >
                          {want.member.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {item.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setIsImagePreviewOpen(true)}
                    className="relative mb-4 block aspect-[16/10] w-full overflow-hidden rounded-[22px] bg-cream text-left"
                    aria-label={`${item.name} 이미지 크게 보기`}
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="390px"
                    />
                    <span className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-2xl bg-white/90 text-ink shadow-lg">
                      <Maximize2 size={18} />
                    </span>
                    {isPurchasedForSelectedMember && (
                      <div className="absolute inset-0 grid place-items-center bg-white/25">
                        <div className="grid h-16 w-16 place-items-center rounded-full bg-mint text-ink">
                          <Check size={34} strokeWidth={4} />
                        </div>
                      </div>
                    )}
                  </button>
                )}

                {item.memo && (
                  <p className="break-words text-sm leading-6 text-ink/60">
                    {item.memo}
                  </p>
                )}

                {!item.memo &&
                  !item.mapUrl &&
                  !item.referenceUrl &&
                  !item.imageUrl && (
                    <p className="text-sm font-bold text-ink/40">
                      추가 정보가 아직 없어요.
                    </p>
                  )}

                {(item.mapUrl || item.referenceUrl) && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {item.mapUrl && (
                      <a
                        href={item.mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-mint text-xs font-black text-ink"
                      >
                        <MapPin size={16} />
                        지도
                        <ExternalLink size={13} />
                      </a>
                    )}
                    {item.referenceUrl && (
                      <a
                        href={item.referenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-cream text-xs font-black text-ink"
                      >
                        <Newspaper size={16} />
                        참고
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                )}

                {onDelete && (
                  <div className="mt-4 border-t-2 border-cream pt-3">
                    <button
                      type="button"
                      onClick={onDelete}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border-2 border-peach bg-white text-sm font-black text-ink transition active:scale-[0.99]"
                    >
                      <Trash2 size={16} />
                      쇼핑템 삭제
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>

      {isImagePreviewOpen && item.imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/92 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${item.name} 이미지 미리보기`}
          onClick={() => setIsImagePreviewOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsImagePreviewOpen(false)}
            className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white text-ink shadow-lg"
            aria-label="이미지 닫기"
          >
            <X size={22} />
          </button>
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="h-auto max-h-[92dvh] w-auto max-w-full object-contain"
            sizes="100vw"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

export function DeleteItemConfirmModal({
  item,
  isDeleting,
  onClose,
  onConfirm,
}: {
  item: ShoppingItem;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-ink/35 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${item.name} 삭제 확인`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[360px] rounded-[28px] bg-ivory p-4 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative pt-1 text-center">
          <p className="text-xs font-black text-sakura">DELETE ITEM</p>
          <h2 className="mt-1 break-words px-8 text-xl font-black">
            이 쇼핑템을 삭제할게요?
          </h2>
          <div className="mt-3 flex justify-center">
            <p className="max-w-full break-words rounded-2xl bg-white px-4 py-2 text-center text-sm font-black leading-6 text-ink/70">
              {item.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="absolute right-0 top-0 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white disabled:opacity-50"
            aria-label="삭제 확인 닫기"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="h-12 rounded-[20px] bg-white text-sm font-black text-ink disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[20px] bg-peach text-sm font-black text-ink disabled:opacity-50"
          >
            {isDeleting && <LoaderCircle className="animate-spin" size={16} />}
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[30px] border-2 border-dashed border-sakura/35 bg-white/66 px-5 py-12 text-center">
      <ShoppingBag className="mx-auto mb-3 text-sakura" size={34} />
      <p className="font-black">{title}</p>
      <p className="mt-2 text-sm text-ink/55">{description}</p>
    </div>
  );
}

export function AddItemButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-[104px] right-[max(20px,calc((100vw-430px)/2+20px))] z-30 grid h-[60px] w-[60px] place-items-center rounded-[22px] bg-sakura text-white shadow-sticker active:scale-[0.98]"
      aria-label="아이템 추가"
    >
      <CirclePlus size={30} />
    </button>
  );
}

export function AddItemModal({
  mode = 'create',
  form,
  previewUrl,
  categories,
  members,
  isSaving,
  onClose,
  onSubmit,
  onFormChange,
  onImageChange,
  uploadError,
  isUploadingImage,
}: {
  mode?: 'create' | 'edit';
  form: ItemForm;
  previewUrl: string | null;
  categories: Category[];
  members: Member[];
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onFormChange: (form: ItemForm) => void;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadError?: string | null;
  isUploadingImage?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-40 grid place-items-end bg-ink/35 px-3 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onSubmit={onSubmit}
        onClick={(event) => event.stopPropagation()}
        className="mb-3 w-full max-w-[430px] rounded-[32px] bg-ivory p-4 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-sakura">
              {mode === 'edit' ? 'EDIT ITEM' : 'NEW ITEM'}
            </p>
            <h2 className="mt-1 text-xl font-black">
              {mode === 'edit' ? '쇼핑템 수정' : '쇼핑템 추가'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving || isUploadingImage}
            className="grid h-10 w-10 place-items-center rounded-full bg-white disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <input
            value={form.name}
            onChange={(event) =>
              onFormChange({ ...form, name: event.target.value })
            }
            placeholder="상품명"
            className="h-[52px] w-full rounded-2xl border-2 border-ink/10 bg-white px-4 font-bold outline-none focus:border-sakura"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.categoryId}
              onChange={(event) =>
                onFormChange({ ...form, categoryId: event.target.value })
              }
              className="h-[52px] rounded-2xl border-2 border-ink/10 bg-white px-3 font-bold outline-none"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              value={form.memberId}
              onChange={(event) =>
                onFormChange({ ...form, memberId: event.target.value })
              }
              className="h-[52px] rounded-2xl border-2 border-ink/10 bg-white px-3 font-bold outline-none"
            >
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex min-h-28 cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-sakura/45 bg-white p-3">
            <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-cream">
              {previewUrl || form.imageUrl ? (
                <Image
                  src={previewUrl || form.imageUrl}
                  alt=""
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImagePlus className="text-sakura" size={25} />
              )}
            </div>
            <div>
              <p className="font-black">
                {isUploadingImage
                  ? '이미지 줄이는 중...'
                  : mode === 'edit'
                    ? '이미지 변경'
                    : '이미지 업로드'}
              </p>
              <p className="mt-1 text-xs leading-5 text-ink/55">
                {isUploadingImage
                  ? '모바일 원본 사진을 작게 압축해서 올리고 있어요.'
                  : mode === 'edit'
                    ? '새 사진을 올리면 기존 이미지를 교체해요.'
                    : '캡쳐 이미지나 상품 사진을 올려요.'}
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="sr-only"
            />
          </label>
          {uploadError && (
            <p className="rounded-2xl bg-peach/45 px-3 py-2 text-xs font-black leading-5 text-ink">
              이미지 업로드 실패: {uploadError}
            </p>
          )}

          <textarea
            value={form.memo}
            onChange={(event) =>
              onFormChange({ ...form, memo: event.target.value })
            }
            placeholder="메모"
            rows={3}
            className="w-full resize-none rounded-2xl border-2 border-ink/10 bg-white px-4 py-3 font-bold outline-none focus:border-sakura"
          />

          <div className="grid grid-cols-1 gap-2">
            <input
              value={form.mapUrl}
              onChange={(event) =>
                onFormChange({ ...form, mapUrl: event.target.value })
              }
              placeholder="구글지도 URL"
              inputMode="url"
              className="h-[52px] w-full rounded-2xl border-2 border-ink/10 bg-white px-4 font-bold outline-none focus:border-sakura"
            />
            <input
              value={form.referenceUrl}
              onChange={(event) =>
                onFormChange({ ...form, referenceUrl: event.target.value })
              }
              placeholder="참고 블로그 URL"
              inputMode="url"
              className="h-[52px] w-full rounded-2xl border-2 border-ink/10 bg-white px-4 font-bold outline-none focus:border-sakura"
            />
          </div>
        </div>

        <button
          disabled={
            isSaving ||
            isUploadingImage ||
            !form.name.trim() ||
            !form.categoryId ||
            !form.memberId
          }
          className="mt-4 inline-flex h-14 w-full items-center justify-center gap-2 rounded-[22px] bg-ink text-base font-black text-white disabled:bg-ink/30"
        >
          {(isUploadingImage || isSaving) && (
            <LoaderCircle className="animate-spin" size={18} />
          )}
          {isUploadingImage
            ? '이미지 업로드 중...'
            : isSaving
              ? '저장 중...'
              : mode === 'edit'
                ? '수정 저장'
                : '저장'}
        </button>
      </form>
    </div>
  );
}

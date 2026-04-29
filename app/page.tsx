"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles, Ticket } from "lucide-react";

const headcountOptions = [2, 3, 4, 5];

export default function SetupPage() {
  const router = useRouter();
  const [headcount, setHeadcount] = useState(3);
  const [names, setNames] = useState(["", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canSubmit = useMemo(() => names.every((name) => name.trim().length > 0), [names]);

  function changeHeadcount(nextCount: number) {
    setHeadcount(nextCount);
    setNames((current) =>
      Array.from({ length: nextCount }, (_, index) => current[index] ?? "")
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    const response = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ members: names.map((name) => name.trim()) })
    });

    if (!response.ok) {
      setIsSubmitting(false);
      return;
    }

    const group = await response.json();
    router.push(`/groups/${group.id}`);
  }

  return (
    <section className="relative min-h-dvh overflow-hidden px-5 py-7">
      <div className="absolute -right-10 top-20 h-36 w-36 rounded-full bg-mint/60 blur-2xl" />
      <div className="absolute -left-12 bottom-28 h-32 w-32 rounded-full bg-sky/50 blur-2xl" />

      <div className="relative flex min-h-[calc(100dvh-56px)] flex-col">
        <div className="rounded-[32px] border-2 border-ink/10 bg-white/72 p-5 shadow-sticker">
          <div className="mb-7 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-sm font-bold">
              <Ticket size={17} />
              Japan trip cart
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-full bg-sakura text-white shadow-lg shadow-sakura/30">
              <Sparkles size={22} />
            </div>
          </div>

          <h1 className="font-display text-6xl leading-none text-sakura drop-shadow-[0_4px_0_rgba(66,55,58,0.10)]">
            WECART
          </h1>
          <p className="mt-3 text-lg font-bold text-ink">사야돼 리스트 만들기</p>
          <p className="mt-2 text-sm leading-6 text-ink/65">
            여행 전 캡쳐와 부탁받은 쇼핑템을 친구별로 모아두고, 현장에서 톡톡 체크해요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative mt-6 flex flex-1 flex-col gap-5">
          <div className="rounded-[28px] border-2 border-white bg-white/78 p-4 shadow-sticker">
            <label className="text-sm font-bold text-ink/70">인원 수</label>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {headcountOptions.map((count) => (
                <button
                  type="button"
                  key={count}
                  onClick={() => changeHeadcount(count)}
                  className={`h-12 rounded-2xl border-2 text-lg font-black transition ${
                    headcount === count
                      ? "border-sakura bg-sakura text-white shadow-lg shadow-sakura/30"
                      : "border-ink/10 bg-cream text-ink"
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border-2 border-white bg-white/78 p-4 shadow-sticker">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-bold text-ink/70">멤버 이름</label>
              <button
                type="button"
                onClick={() => changeHeadcount(Math.min(headcount + 1, 8))}
                className="inline-flex h-9 items-center gap-1 rounded-full bg-mint px-3 text-sm font-black"
              >
                <Plus size={16} />
                추가
              </button>
            </div>

            <div className="space-y-3">
              {names.map((name, index) => (
                <input
                  key={index}
                  value={name}
                  onChange={(event) =>
                    setNames((current) =>
                      current.map((entry, entryIndex) =>
                        entryIndex === index ? event.target.value : entry
                      )
                    )
                  }
                  placeholder={`친구 ${index + 1}`}
                  className="h-[52px] w-full rounded-2xl border-2 border-ink/10 bg-ivory px-4 text-base font-bold outline-none transition placeholder:text-ink/30 focus:border-sakura"
                />
              ))}
            </div>
          </div>

          <button
            disabled={!canSubmit || isSubmitting}
            className="mt-auto h-16 w-full rounded-[24px] bg-ink text-lg font-black text-white shadow-sticker transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-ink/30"
          >
            {isSubmitting ? "만드는 중..." : "시작하기"}
          </button>
        </form>
      </div>
    </section>
  );
}

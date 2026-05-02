"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Database, LoaderCircle, Sparkles, Ticket } from "lucide-react";

type BootstrapResponse =
  | {
      groupId: string;
    }
  | {
      message: string;
    };

export default function HomePage() {
  const router = useRouter();
  const [message, setMessage] = useState("Supabase 멤버를 확인하는 중...");

  useEffect(() => {
    async function bootstrap() {
      const response = await fetch("/api/bootstrap", {
        cache: "no-store"
      });
      const data = (await response.json()) as BootstrapResponse;

      if (response.ok && "groupId" in data) {
        router.replace(`/groups/${data.groupId}`);
        return;
      }

      setMessage("members 테이블에 groupId가 연결된 멤버를 먼저 추가해 주세요.");
    }

    bootstrap();
  }, [router]);

  return (
    <section className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-7">
      <div className="absolute -right-10 top-20 h-36 w-36 rounded-full bg-mint/60 blur-2xl" />
      <div className="absolute -left-12 bottom-28 h-32 w-32 rounded-full bg-sky/50 blur-2xl" />

      <div className="relative w-full rounded-[32px] border-2 border-ink/10 bg-white/78 p-5 text-center shadow-sticker">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-sm font-bold">
          <Ticket size={17} />
          Japan trip cart
        </div>

        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sakura text-white shadow-lg shadow-sakura/30">
          <Sparkles size={28} />
        </div>

        <h1 className="mt-5 font-display text-6xl leading-none text-sakura drop-shadow-[0_4px_0_rgba(66,55,58,0.10)]">
          WECART
        </h1>
        <p className="mt-3 text-lg font-bold text-ink">사야돼 리스트</p>
        <p className="mx-auto mt-2 max-w-[300px] text-sm leading-6 text-ink/65">
          지금은 Supabase에 등록된 멤버만 사용해요. 로그인 기능이 생기면 멤버 초대 흐름을 다시 연결합니다.
        </p>

        <div className="mt-6 rounded-[24px] bg-ivory p-4 text-left">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-mint">
              <Database size={21} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black">DB 멤버 사용</p>
              <p className="mt-1 text-xs leading-5 text-ink/55">{message}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-black text-white">
          <LoaderCircle className="animate-spin" size={18} />
          리스트 준비 중
        </div>
      </div>
    </section>
  );
}

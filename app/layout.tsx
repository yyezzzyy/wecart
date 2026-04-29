import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const memoment = localFont({
  src: "./assets/fonts/MemomentKkukkukk.otf",
  variable: "--font-memoment",
  display: "swap"
});

export const metadata: Metadata = {
  title: "WECART",
  description: "친구들과 함께 쓰는 사야돼 리스트"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={memoment.variable}>
        <main className="mobile-shell">{children}</main>
      </body>
    </html>
  );
}

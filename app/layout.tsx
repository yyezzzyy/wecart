import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WECART",
  description: "친구들과 함께 쓰는 사야돼 리스트"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <main className="mobile-shell">{children}</main>
      </body>
    </html>
  );
}

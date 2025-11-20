import type { Metadata } from "next";
import "./globals.css"; // <--- 关键就是这一行！没有它，Tailwind 就是废铁。

export const metadata: Metadata = {
  title: "Ourbowl",
  description: "记录情绪，抚摸灵魂",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
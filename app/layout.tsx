import type { Metadata } from "next";
import "./globals.css"; // <--- 关键就是这一行！没有它，Tailwind 就是废铁。
import NavBar from '@/components/NavBar' 

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
      <body>
        {/* 放在这里，所有页面都会有导航栏 */}
        <NavBar /> 
        {/* 给下面留出一点 padding，防止内容被导航栏挡住 */}
        <div className="pt-20 md:pt-24">
          {children}
        </div>
      </body>
    </html>
  );
}
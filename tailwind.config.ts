import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 高级莫兰迪背景色
        bg: "#F0F2F5", 
        // 主色调：不再是刺眼的纯黄，而是柔和的奶酪黄
        primary: "#F5C066",
        primaryHover: "#E0A845",
        // 文字颜色
        textMain: "#2D3748",
        textSub: "#718096",
      },
      boxShadow: {
        // 核心技术：多重阴影制造“悬浮感” (Claymorphism / Neumorphism)
        'clay': '10px 10px 20px #d1d5db, -10px -10px 20px #ffffff',
        'clay-sm': '5px 5px 10px #d1d5db, -5px -5px 10px #ffffff',
        'inset': 'inset 5px 5px 10px #d1d5db, inset -5px -5px 10px #ffffff',
      }
    },
  },
  plugins: [],
};
export default config;
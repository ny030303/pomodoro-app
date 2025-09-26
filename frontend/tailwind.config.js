// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 이 부분을 수정/추가합니다.
  ],
  darkMode: 'class', // 다크 모드를 위해 이 줄을 추가합니다.
  theme: {
    extend: {},
  },
  plugins: [],
}
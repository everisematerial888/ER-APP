/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./App.jsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        en: ["'Times New Roman'", "Times", "serif"],
        zh: ["'BiaoKai'", "'標楷體'", "'DFKai-SB'", "'STKaiti'", "serif"],
      },
    },
  },
  plugins: [],
};

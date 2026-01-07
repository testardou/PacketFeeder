import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "../../**/**/*.{js,ts,jsx,tsx}",
    "../../",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;

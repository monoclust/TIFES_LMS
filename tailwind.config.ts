import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        paper: "#FFFFFF",
        accent: "#F5C400",
        muted: "#6B7280",
        line: "#E5E7EB",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(17, 17, 17, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;

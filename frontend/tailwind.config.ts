import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "light-green": {
          primary: "#0d9488",
          "primary-dark": "#0f766e",
          "primary-light": "#5eead4",
          dark: "#0f172a",
          "dark-grey": "#475569",
          "light-grey": "#94a3b8",
          light: "#f0fdfa",
          subtle: "#ccfbf1",
        },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "card-hover": "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)",
      },
      keyframes: {
        "rhombus-bounce": {
          "0%, 100%": { transform: "translateY(0) scale(1)", opacity: "0.6" },
          "50%": { transform: "translateY(-6px) scale(1.1)", opacity: "1" },
        },
        "rhombus-flow-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "25%": { opacity: "0.8" },
          "50%": { transform: "translateY(0)", opacity: "1" },
          "75%": { opacity: "0.8" },
          "100%": { transform: "translateY(-100%)", opacity: "0" },
        },
        /* Circle tilted 45°: bottom-right → bottom-left → top-left → top-right → back */
        "rhombus-circle-45": {
          "0%, 100%": { transform: "translate(10px, 10px)", opacity: "1" },
          "25%": { transform: "translate(-10px, 10px)", opacity: "0.9" },
          "50%": { transform: "translate(-10px, -10px)", opacity: "1" },
          "75%": { transform: "translate(10px, -10px)", opacity: "0.9" },
        },
      },
      animation: {
        "rhombus-bounce": "rhombus-bounce 0.6s ease-in-out infinite",
        "rhombus-flow-up": "rhombus-flow-up 1.2s ease-in-out infinite",
        "rhombus-circle-45": "rhombus-circle-45 1.7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;

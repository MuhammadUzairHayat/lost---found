import type { Config } from "tailwindcss";

const withAlpha = (name: string) => `rgb(var(--${name}-rgb) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: withAlpha("ink"),
        paper: withAlpha("paper"),
        body: withAlpha("body"),
        mute: withAlpha("mute"),
        subtle: withAlpha("subtle"),
        line: withAlpha("line"),
        surface: withAlpha("surface"),
        card: "var(--card)",
        input: "var(--input)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-hover":
          "0 4px 12px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "hero-lost-in": "hero-lost-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "hero-lost-out": "hero-lost-out 0.45s ease-in forwards",
        "hero-found-in": "hero-found-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "shape-rise": "shape-rise 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "shape-fade": "shape-fade 0.8s ease-out forwards",
        "ring-draw": "ring-draw 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "dot-pop": "dot-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "hero-bag-in": "hero-bag-in 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "hero-scope-in": "hero-scope-in 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "hero-bubble-in": "hero-bubble-in 0.55s cubic-bezier(0.34, 1.2, 0.64, 1) forwards",
        "hero-scan-pulse": "hero-scan-pulse 1.2s ease-out forwards",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "hero-lost-in": {
          "0%": {
            opacity: "0",
            transform: "translateX(-24px) scale(0.92)",
            filter: "blur(4px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0) scale(1)",
            filter: "blur(0)",
          },
        },
        "hero-lost-out": {
          "0%": {
            opacity: "1",
            transform: "translateY(0) scale(1)",
            filter: "blur(0)",
          },
          "100%": {
            opacity: "0",
            transform: "translateY(-12px) scale(0.95)",
            filter: "blur(3px)",
          },
        },
        "hero-found-in": {
          "0%": {
            opacity: "0",
            transform: "translateX(20px) scale(0.88)",
            filter: "blur(4px)",
          },
          "60%": {
            opacity: "1",
            transform: "translateX(-2px) scale(1.03)",
            filter: "blur(0)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0) scale(1)",
            filter: "blur(0)",
          },
        },
        "shape-rise": {
          "0%": { opacity: "0", transform: "translateY(16px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "shape-fade": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "ring-draw": {
          "0%": {
            opacity: "0",
            transform: "scale(0.6) rotate(-20deg)",
            strokeDashoffset: "120",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1) rotate(0deg)",
            strokeDashoffset: "0",
          },
        },
        "dot-pop": {
          "0%": { opacity: "0", transform: "scale(0)" },
          "70%": { opacity: "1", transform: "scale(1.15)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "hero-bag-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(48px) translateX(-12px) scale(0.88) rotate(-6deg)",
          },
          "65%": {
            opacity: "1",
            transform: "translateY(-6px) translateX(0) scale(1.02) rotate(2deg)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) translateX(0) scale(1) rotate(0deg)",
          },
        },
        "hero-scope-in": {
          "0%": {
            opacity: "0",
            transform: "translateX(72px) translateY(8px) rotate(18deg) scale(0.85)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0) translateY(0) rotate(-8deg) scale(1)",
          },
        },
        "hero-bubble-in": {
          "0%": {
            opacity: "0",
            transform: "translateX(24px) scale(0.92)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0) scale(1)",
          },
        },
        "hero-scan-pulse": {
          "0%": { opacity: "0", transform: "scale(0.6)" },
          "40%": { opacity: "0.35", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(1.35)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

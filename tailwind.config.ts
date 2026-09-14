import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#08111f",
        panel: "#0e1b2d",
        line: "#203550",
        signal: "#47f0b5",
        electric: "#68a6ff"
      },
      boxShadow: {
        glow: "0 0 40px rgba(71, 240, 181, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;

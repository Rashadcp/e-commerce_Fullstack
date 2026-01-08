import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// ✅ Correct Tailwind v4 integration
export default defineConfig({
  plugins: [
    react(),
    tailwindcss({
      // optional: only if you want to customize paths
      config: "./tailwind.config.js",
    }),
  ],
});

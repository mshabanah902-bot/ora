import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev
export default defineConfig({
  base: './', // يحافظ على مرونة روابط المجلد العام بعد النشر
  plugins: [
    react(), 
    tailwindcss() // تم إزالة إضافة single file تماماً لتسريع الموقع
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
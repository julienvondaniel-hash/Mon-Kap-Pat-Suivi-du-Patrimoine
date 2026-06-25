import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Isole les grosses dépendances dans des chunks séparés : meilleur cache
        // (elles changent rarement) et chargement initial allégé sur mobile.
        manualChunks: {
          charts: ["recharts"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        lang: "fr",
        name: "Mon Kap Pat",
        short_name: "Mon Kap Pat",
        description: "Suivez votre patrimoine et visualisez sa progression",
        theme_color: "#1B2B4B",
        background_color: "#0A1226",
        display: "standalone",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          { src: "/icon.svg", sizes: "any", type: "image/svg+xml" }
        ]
      }
    })
  ]
});

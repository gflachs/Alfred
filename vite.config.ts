import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      strategies: "generateSW",
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https?.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "offlineCache",
              expiration: {
                maxEntries: 50,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "Alfred",
        short_name: "Alfred",
        display: "standalone",
        start_url: "/",
        description:
          "Alfred is the app, which is used to connected to the Alfred device",
        theme_color: "#00e5ff",
        background_color: "#121212",
        icons: [
          {
            src: "/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          { src: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
          { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
      },
    }),
  ],
});

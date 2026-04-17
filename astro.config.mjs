import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  site: "https://o6ivp.github.io",
  base: "/profile/",
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  vite: {
    plugins: [wasm()],
    ssr: {
      noExternal: ["three"],
    },
  },
});

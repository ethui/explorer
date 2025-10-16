import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitroV2Plugin } from "@tanstack/nitro-v2-vite-plugin";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart(),
    nitroV2Plugin({
      preset: "vercel",
    }),
    tailwindcss(),
    viteReact(),
  ],
  ssr: {
    noExternal: ["@rainbow-me/rainbowkit"],
  },
});

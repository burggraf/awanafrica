import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import pkg from "./package.json"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "pocketbase": path.resolve(__dirname, "./node_modules/pocketbase"),
    },
  },
  define: {
    '__APP_VERSION__': JSON.stringify(pkg.version),
    '__APP_NAME__': JSON.stringify(pkg.title || pkg.name),
  },
})

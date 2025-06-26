import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

const testApiUrl = "http://localhost:3000"; // mock or dummy API

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
  define: {
    "import.meta.env.VITE_API_URL": JSON.stringify(testApiUrl),
  },
});

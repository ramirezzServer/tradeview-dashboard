import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    // Bind to loopback only. The previous "::" exposed the dev server on every
    // network interface — unnecessary here and a needless attack surface while
    // Vite's dev-server file-serving advisories remain open. Set VITE_EXPOSE=1
    // for the occasional need to reach the dev server from another device.
    host: process.env.VITE_EXPOSE ? true : "localhost",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../shared/src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "@tanstack/react-query"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "@tanstack/react-query"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React runtime
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Data layer
          'vendor-query': ['@tanstack/react-query'],
          // Radix UI primitives (large — split from main)
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
}));

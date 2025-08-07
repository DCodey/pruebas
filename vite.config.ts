import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: '/',
  plugins: [reactRouter(), tsconfigPaths()],
  appType: 'spa',
  server: {
    // This handles client-side routing, return all requests to index.html
    // and let the client router handle the rest
  },
  optimizeDeps: {
    include: ['react-datepicker'], // fuerza a Vite a procesarlo como ESM
  },
  ssr: {
    noExternal: ['react-datepicker'], // evita que lo trate como paquete externo en SSR
  },
});

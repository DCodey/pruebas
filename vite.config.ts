import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: '/',
  plugins: [reactRouter(), tsconfigPaths()],
  appType: 'spa',
  server: {
    // host: '0.0.0.0',      // Escucha todas las IPs (necesario para acceder desde otro dispositivo)
    // port: 5173,           // Puerto por defecto de Vite
    // strictPort: true,
    // cors: true,           // Habilita CORS por si haces peticiones desde otro origen
  },
  optimizeDeps: {
    include: ['react-datepicker'], // fuerza a Vite a procesarlo como ESM
  },
  ssr: {
    noExternal: ['react-datepicker'], // evita que lo trate como paquete externo en SSR
  },
});

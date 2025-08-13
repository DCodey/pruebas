import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: '/',
  plugins: [reactRouter(), tsconfigPaths()],
  appType: 'spa',
  server: {
    // host: true,
    // port: 5173,
    // allowedHosts: ['14077e2166ce.ngrok-free.app']
    // host: '0.0.0.0', // Permite conexiones desde cualquier dirección IP
    // port: 3000, // Puerto en el que se ejecutará la aplicación
    // strictPort: true, // No intentar usar otro puerto si el 3000 está ocupado
    // hmr: {
    //   host: 'localhost',
    //   port: 3000,
    //   protocol: 'ws',
    // },
    // cors: true, // Habilita CORS para desarrollo
  },
  optimizeDeps: {
    include: ['react-datepicker'], // fuerza a Vite a procesarlo como ESM
  },
  ssr: {
    noExternal: ['react-datepicker'], // evita que lo trate como paquete externo en SSR
  },
});

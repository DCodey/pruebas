import { type RouteConfig, route } from "@react-router/dev/routes";

// Ruta protegida para clientes
const protectedRoutes = [
  route("resumen", "routes/resumen.tsx"),
  route("ventas", "routes/ventas.tsx"),
  route("clientes", "routes/clientes.tsx"),
  route("productos", "routes/productos.tsx"),
  // Agrega más rutas protegidas aquí
];

// Ruta raíz protegida
const protectedRoute = route(
  "",
  "../src/components/Auth/ProtectedRoute.tsx",
  protectedRoutes
);

// Todas las rutas
export default [
  // Ruta pública
  route("inicio_sesion", "routes/inicio_sesion.tsx"),
  
  // Ruta protegida
  protectedRoute,
  
  // Ruta comodín para páginas no encontradas
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;

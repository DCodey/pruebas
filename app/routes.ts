import { type RouteConfig, route } from "@react-router/dev/routes";
import { ROUTES } from "../src/routes/paths";

// Ruta protegida para clientes
const protectedRoutes = [
  route(ROUTES.RESUMEN, "routes/resumen.tsx"),
  route(ROUTES.VENTAS, "routes/ventas.tsx"),
  route(ROUTES.CLIENTES, "routes/clientes.tsx"),
  route(ROUTES.PRODUCTOS, "routes/productos.tsx"),
  route(ROUTES.SERVICIOS_ESPECIALES, "routes/servicios-especiales.tsx"),
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
  route(ROUTES.LOGIN, "routes/inicio_sesion.tsx"),
  
  // Ruta protegida
  protectedRoute,
  
  // Ruta comodín para páginas no encontradas
  route(ROUTES.NOT_FOUND, "routes/not-found.tsx"),
] satisfies RouteConfig;

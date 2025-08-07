export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-primary-600 font-bold text-lg animate-pulse">🌸</span>
        </div>
      </div>
      <span className="text-primary-700 font-medium text-base">Cargando...</span>
    </div>
  );
}

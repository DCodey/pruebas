export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm gap-4">
      <div className="relative">
        <div className="w-10 h-10"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="/flower2.png"
              alt="Flor"
              className="h-10 w-10 inline-block text-primary-600 animate-spin duration-700"
            />
            <img src="/talloflor.png" className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-4" style={{zIndex:0}} />
        </div>
      </div>
      <span className="text-primary-700 font-semibold text-base animate-pulse">Cargando...</span>
    </div>
  );
}

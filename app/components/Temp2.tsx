export default function Temp2() {
  return (
    <div className="w-full bg-[#D6E0E5] py-[120px]">
      <div
        className="relative max-w-[1370px] mx-auto min-h-[300px] rounded-[6px] py-[90px] px-[88px]"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1370&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
            pointerEvents: "none",
          }}
        ></div>
        <div className="relative z-10 flex justify-between items-center gap-5">
          <div>
            <p className="text-white text-[36px] font-bold mb-2">
              ¿Necesitas ayuda?
            </p>
            <p className="text-white text-[22px]">
              Te ayudamos eligiendo un vehículo adaptado a tus planes de viaje.
            </p>
          </div>
          <div>
            <button className="bg-[#D9531D] rounded-[4px] text-white text-[17px] py-4 px-8">
              Contactar con un agente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

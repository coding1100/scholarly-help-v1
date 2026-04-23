export default function Temp() {
  return (
    <div className="w-full bg-gradient-to-b from-[#252E30] to-[#0F0C0B] pt-16 pb-9">
      <div className="max-w-[1370px] mx-auto">
        <div className="flex justify-between items-start gap-5">
          <div>
            <p className="text-white text-[36px] font-bold leading-[41px]">
              No importa dónde estés hoy,
              <br />
              tenemos el auto para vos.
            </p>
          </div>
          <div>
            <p className="text-white text-[22px]">
              <span className="font-bold">US</span>(940)7673608
            </p>
          </div>
          <div>
            <p className="text-white text-[22px]">
              <span className="font-bold">SV</span>(503)73123604
            </p>
          </div>
          <div className="flex gap-10 justify-end items-center">
            <div className="w-[20px] h-[20px] border border-white "></div>
            <div className="w-[20px] h-[20px] border border-white "></div>
            <div className="w-[20px] h-[20px] border border-white "></div>
          </div>
        </div>

        <div className="mt-10 flex justify-between items-start gap-5">
          <div>
            <p className="text-white text-[22px]">
              Radar Rent A Car {new Date().getFullYear()}
            </p>
          </div>
          <div className="flex gap-[14px] justify-end items-center">
            <div className="w-[50px] h-[20px] border border-white "></div>
            <div className="w-[50px] h-[20px] border border-white "></div>
            <div className="w-[50px] h-[20px] border border-white "></div>
          </div>
          <div className="flex justify-end items-center gap-20 text-white">
            <div>
              <a href="#" className="underline">
                Términos y condiciones
              </a>
            </div>
            <div>
              <a href="#" className="underline">
                Políticas de privacidad
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

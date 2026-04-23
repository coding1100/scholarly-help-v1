"use client";
import { useState } from "react";

export default function Temp3() {
  const [openQuestion, setOpenQuestion] = useState(0);

  const faqs = [
    {
      question: "¿Cuáles son los requisitos para rentar un vehículo?",
      answer:
        "Para garantizar un proceso ágil, solicitamos: Licencia de conducir vigente (nacional o extranjera). Documento de identidad (DUI o Pasaporte), ser mayor de 21 años y contar con tarjeta de crédito para el depósito de garantía.",
    },
    {
      question: "¿Qué incluye la tarifa de alquiler?",
      answer:
        "Nuestras tarifas incluyen seguro básico de responsabilidad civil, kilometraje ilimitado dentro del territorio nacional, asistencia en carretera 24/7, y mantenimiento preventivo del vehículo. Los combustibles y peajes van por cuenta del cliente.",
    },
    {
      question: "¿Cómo funciona el depósito de garantía?",
      answer:
        "El depósito de garantía se realiza mediante autorización en tarjeta de crédito al momento de retirar el vehículo. Este monto se libera automáticamente al devolver el auto en las mismas condiciones, sin daños adicionales y con el nivel de combustible acordado.",
    },
    {
      question:
        "¿Puedo retirar el auto en el aeropuerto y entregarlo en otra oficina?",
      answer:
        "Sí, ofrecemos el servicio de entrega y recogida en diferentes ubicaciones. Contamos con oficinas en el aeropuerto internacional y sucursales en las principales ciudades. Este servicio puede tener un costo adicional dependiendo de las ubicaciones seleccionadas.",
    },
    {
      question: "¿Qué pasa si mi vuelo se retrasa?",
      answer:
        "Entendemos que los retrasos de vuelos son impredecibles. Nuestro servicio de aeropuerto opera las 24 horas, y monitoreamos los vuelos automáticamente. No se aplicarán cargos adicionales por retrasos de vuelos, y nuestro personal estará disponible para asistirte a tu llegada.",
    },
    {
      question: "¿Cuáles son las políticas de combustible?",
      answer:
        "Aplicamos la política de 'lleno a lleno': recibes el vehículo con tanque completo y debes devolverlo con la misma cantidad de combustible. Si no es posible llenar el tanque, se cobrará el combustible faltante más una tarifa de servicio administrativa.",
    },
  ];

  const toggleQuestion = (index: number) => {
    setOpenQuestion(openQuestion === index ? -1 : index);
  };

  return (
    <div className="w-full py-20 bg-white">
      <div className="relative max-w-[1128px] mx-auto px-6">
        <p className="text-[50px] font-black text-[#0F0C0B] mb-9 uppercase tracking-tight">
          PREGUNTAS FRECUENTES
        </p>

        <div>
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`${index !== faqs.length - 1 ? "border-b border-gray-200" : ""}`}
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full px-6 py-5 text-left flex justify-between items-center"
              >
                <p className="text-[26px] font-semibold text-gray-900 pr-4">
                  {faq.question}
                </p>
                <div className="flex-shrink-0">
                  <svg
                    className={`w-6 h-6 text-gray-600 transition-transform duration-300 ${
                      openQuestion === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              <div
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                  openQuestion === index
                    ? "max-h-96 pb-5 opacity-100"
                    : "max-h-0 pb-0 opacity-0"
                }`}
              >
                <div className="text-[#181818] leading-relaxed text-[22px] w-[90%]">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

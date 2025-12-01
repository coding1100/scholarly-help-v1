import Image from "next/image";

export default function SubjectsSection() {
  const subjects = [
    { src: "/assets/Icon/english.png", label: "English" },
    { src: "/assets/Icon/math.png", label: "Math" },
    {
      src: "/assets/Icon/anatomyandphysiology.png",
      label: "Anatomy and Physiology",
    },
    { src: "/assets/Icon/statistics.png", label: "Statistics" },
    { src: "/assets/Icon/hrmclass.png", label: "HRM Class" },
    {
      src: "/assets/Icon/operationmanagement.png",
      label: "Operation Management",
    },
    { src: "/assets/Icon/computerscience.png", label: "Computer Science" },
    { src: "/assets/Icon/accounting.png", label: "Accounting" },
    { src: "/assets/Icon/history.png", label: "History" },
    { src: "/assets/Icon/marketing.png", label: "Marketing" },
    { src: "/assets/Icon/psychology.png", label: "Psychology" },
    { src: "/assets/Icon/philosophy.png", label: "Philosophy" },
  ];

  return (
    <section className="pt-[86px] pb-16 bg-[#ECECFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="sm:text-[42px] text-[32px] sm:font-bold font-semibold text-gray-900 mb-3">
          Subjects & Majors We Cover
        </h2>
        <p className="sm:text-base text-sm text-gray-600 max-w-3xl mx-auto mb-12">
          Beyond the subjects listed below, we excel at handling diverse topics
          effectively. Our expertise knows no bounds, ensuring we’re ready for
          any challenge that comes our way.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-12">
          {subjects.map((subject, index) => (
            <div
              key={index}
              className="bg-[#F2F2FD] rounded-lg p-6 h-[200px] flex flex-col items-center justify-center cursor-pointer"
            >
              <div className="w-12 h-12 mb-3 relative">
                <Image
                  src={subject.src}
                  alt={subject.label}
                  fill
                  className="object-contain"
                  sizes="48px"
                />
              </div>
              <span className="text-sm font-medium text-gray-800 text-center sm:text-[23px]">
                {subject.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-[60px]">
          <button
            type="button"
            className="rounded-md px-3 cursor-pointer bg-[#ff641a] text-white border border-transparent transition duration-300 text-[15px] font-medium flex items-center justify-center hover:bg-white hover:text-[#ff641a] hover:border-[#ff641a] h-[54px] md:w-64 w-48"
          >
            Take my online class
          </button>
        </div>
      </div>
    </section>
  );
}

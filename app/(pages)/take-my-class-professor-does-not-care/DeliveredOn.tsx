import Canvas from "@/app/assets/Images/canvas.png";
import Blackboard from "@/app/assets/Images/blackboard.png";
import Pearson from "@/app/assets/Images/pearson.png";
import McGrawHill from "@/app/assets/Images/mcgrawhill.png";
import Cengage from "@/app/assets/Images/cengage.png";
import Moodle from "@/app/assets/Images/moodle.png";
import Image from "next/image";

export default function DeliveredOn() {
  return (
    <div className="xl:flex justify-center py-8 mt-[-96px]">
      <div
        className="w-full max-w-7xl container py-6 px-12 rounded-lg bg-[#fff]"
        style={{ boxShadow: " 0px 11px 32px 0px #DFE5FF " }}
      >
        <p className="md:text-3xl text-2xl font-bold text-center mb-8">
          10,000+ A-Grades Delivered On
        </p>
        <div className="w-full flex-wrap flex justify-between items-center gap-6 ">
          {/* <div className=" flex justify-between items-center gap-6"> */}
          <Image
            src={Canvas}
            alt="canvas"
            loading="lazy"
            className="md:max-w-auto sm:max-w-[50%] max-w-[25%]"
          />
          <Image
            src={Blackboard}
            alt="Blackboard"
            loading="lazy"
            className="md:max-w-auto sm:max-w-[50%] max-w-[25%]"
          />

          {/* </div>
          <div className=" flex justify-between items-center gap-6"> */}
          <Image
            src={McGrawHill}
            alt="McGrawHill"
            loading="lazy"
            className="md:max-w-auto sm:max-w-[50%] max-w-[25%]"
          />
          <Image
            src={Pearson}
            alt="Pearson"
            loading="lazy"
            className="md:max-w-auto sm:max-w-[50%] max-w-[25%]"
          />
          <Image
            src={Cengage}
            alt="Cengage"
            loading="lazy"
            className="md:max-w-auto sm:max-w-[50%] max-w-[25%]"
          />

          <Image
            src={Moodle}
            alt="Moodle"
            loading="lazy"
            className="md:max-w-auto sm:max-w-[50%] max-w-[25%]"
          />
          {/* </div> */}
        </div>
      </div>
    </div>
  );
}

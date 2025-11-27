import React, { useState } from "react";
import heroBackground from "@/app/assets/Images/Group-29.png";
import axios from "axios";

const HeroSection = () => {
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState("");
  const [solutions, setSolutions] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();

    fd.append("query", query);
    fd.append("image", file);

    try {
      const res = await axios.post(
        "https://mind.scholarlyhelps.com/v1/order/predictImage",
        fd,
        {
          headers: {
            "Content-Type": "multipart/formdata",
          },
        }
      );

      setSolutions([...solutions, res.data.content]);
      setQuery("");
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div
      className="w-full py-16 bg-center bg-cover"
      style={{ backgroundImage: `url(${heroBackground.src})` }}
    >
      <div className="container mx-auto">
        <div>
          <p className="text-base text-white text-center">
            Solve any Exercise in a second{" "}
            <img src="src/assets/Vector-17.png" alt="" />
          </p>
          <h1 className="text-6xl leading-tight font-extrabold mb-4 text-white text-center">
            Navigating Challenges
          </h1>
          <h1 className="text-6xl leading-tight font-extrabold mb-4 text-[#FF3449] text-center">
            Crafting Solutions.
          </h1>
          <p className="text-base text-center text-white">
            Solve math exercises, Physics, etc thanks to artifical intelligence
          </p>
          <div className="flex justify-center">
            <button className="mx-2 bg-[#FF3449] hover:bg-red-700 text-white font-bold py-2 px-8 rounded-full text-left my-4">
              Scan my images
            </button>
          </div>
        </div>

        {/* <div className="w-full align-middle sm:relative basis-full sm:basis-8/12">
          <div className="left-0 w-[100%]  bg-white sm:left-[-5px] sm:top-[72px] whiteBox rounded-3xl inline-block  sm:absolute sm:w-[80%]  z-10  ">
            <div className="">
              <div id="exercise" className="h-[150px] overflow-y-auto">
                <p className="p-8 text-lg font-semibold text-left"> Exercise</p>
                {solutions.map((solution, i) => (
                  <pre key={i}>
                    <p
                      className="pl-8 text-lg font-semibold text-left whitespace-break-spaces"
                      dangerouslySetInnerHTML={{ __html: solution }}
                    />
                  </pre>
                ))}
              </div>
              <div className="sm:h-[260px] bg-[#FAFAFA]  rounded-b-3xl">
                <div id="solution">
                  <p className="px-8 py-4 text-lg font-semibold text-left">
                    {" "}
                    Solution
                  </p>
                  <div className="flex justify-around p-2 blur-[0.6px] ">
                    <div className="border-[#FF3449] border w-[45%] ">
                      <p className="px-4 py-2 text-left">
                        Select you Exercise language
                      </p>
                      <p className="px-4 py-2 text-left">
                        Integer diam arcu, cursus tincidunt .
                      </p>
                    </div>
                    <div className="border-[#FF3449] border w-[45%]">
                      <p className="px-4 py-2 text-left">
                        Select you Exercise language
                      </p>
                      <p className="px-4 py-2 text-left">
                        Integer diam arcu, cursus tincidunt .
                      </p>
                    </div>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <div className="flex items-center p-4 space-x-4 sm:px-8 sm:py-4 ">
                      <label
                        htmlFor="files"
                        className="p-0 sm:p-4 text-lg border-dashed font-medium border-2 border-[#FF3449] rounded-full shadow-sm text-[#FF3449]"
                      >
                        + Drag Files
                      </label>
                      <input
                        type="file"
                        id="files"
                        name="files"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files[0])}
                      />
                      {file && (
                        <div className="absolute bottom-0 left-[25px]">
                          <p>{file.name}</p>
                        </div>
                      )}
                      <div className=" flex justify-between border font-medium  border-[#FF3449] rounded-full bg-white w-[80%] ">
                        <input
                          type="text"
                          id="text"
                          name="text"
                          className="w-[80%] focus:ring-0 focus:outline-none p-2 text-lg rounded-full text-[#FF3449]"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                        />
                        <button
                          type="submit"
                          className="bg-[#FF3449] justify-items-end hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full text-left flex m-1"
                        >
                          {" "}
                          Solution{" "}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="w-[100%] sm:top-[77px] sm:left-0 sm:w-[80%] sm:h-[410px] bg-[#FF3449] redBox rounded-3xl z-0 sm:absolute"></div>
        </div> */}
      </div>
    </div>
  );
};

function GotoExercise() {
  //    return( <Link to = "/exercise" className="text-white">Exercise</Link>
  //    );
  window.location.href = "/exercise";
}
export default HeroSection;

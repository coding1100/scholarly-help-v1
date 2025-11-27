import logo from "@/app/assets/Images/ScanToSolve.png";
import Image from "next/image";
import Link from "next/link";

const Header = () => {
  return (
    <header className="p-4 bg-white ">
      <div className="container flex justify-between h-16 mx-auto align-center w-[92%] ">
        <a
          rel="noopener noreferrer"
          href="#"
          aria-label="Back to homepage"
          className="flex items-center p-2"
        >
          {/* <img className="w-30" src="src/assets/ScanToSolve.png" alt="logo" /> */}
          <Image src={logo} alt="logo" />
        </a>
        <div className="items-stretch hidden space-x-3 md:flex" id="showMenu">
          <div className="flex flex-col items-center justify-end px-5 py-6 pr-8 md:flex-row ">
            <div>
              <Link href="/scan/login">
                <button>Login</button>
              </Link>
            </div>
            <div className="ml-5">
              <Link href="/scan/register">
                <button className="bg-[#FF3449] hover:bg-red-700 text-white font-bold py-2 px-8 rounded-full">
                  Register
                </button>
              </Link>
            </div>

            {/* <div
              id="dropdownBtn"
              className="relative cursor-pointer select-none"
            >
              <div className="flex justify-between" onClick={toggleDropdown}>
                <img className="p-2" src="src/assets/Group-2.png" alt="" />
                English
                <img width={25} src="src/icon.svg" alt="" />
              </div>
              <div
                id="dropdown"
                className="absolute bg-white  border-gray-500 top-[30px] left-[20px] shadow hidden select-none"
              >
                <div className="px-10 py-2 cursor-pointer hover:bg-gray-300">
                  <div className="">English</div>
                </div>
                <div className="px-10 py-2 cursor-pointer hover:bg-gray-300">
                  Spanish
                </div>
              </div>
            </div> */}
          </div>
        </div>

        <button
          className="flex justify-end p-4 md:hidden"
          onClick={handleClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>
      </div>
    </header>
  );
};

function MyButton() {
  return <button>Login</button>;
}
function Registerbtn() {
  return (
    <button className="bg-[#FF3449] hover:bg-red-700 text-white font-bold py-2 px-8 rounded-full">
      Register
    </button>
  );
}
function toggleDropdown() {
  let dropdownbtn = document.querySelector("#dropdownBtn #dropdown");
  dropdownbtn.classList.toggle("hidden");
}
function handleClick() {
  let showmenu = document.getElementById("showMenu");
  showmenu.classList.toggle("hidden");
}

export default Header;

import axiosInstance from "@/app/axios";
import { notification } from "@/app/utilities/utilities";
import { useRouter } from "next/navigation";
import { FC, FormEvent, useState } from "react";
import toast from "react-hot-toast";

interface RegisterProps {}
const Register: FC<RegisterProps> = ({}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      notification("error", "Email or password can't empty");
      return;
    }

    setIsLoading(true);

    try {
      let payload = {
        email,
        password,
      };
      await axiosInstance.post("/scan-to-solve/auth/signup", payload);
      setIsLoading(false);
      router.push("/scan/login");
    } catch (error) {
      // @ts-ignore
      notification("error", error?.response?.data?.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="max-w-[400px] mx-auto">
          <div className="text-center text-[#7A7A7A] text-4xl font-semibold">
            Sign <span className="text-[#FF3449]">Up</span>
          </div>
          <div className="mt-10">
            <label className="text-[#7a7a7a]">Email Address</label>
            <input
              type="email"
              autoComplete="off"
              className="border-2 border-[1px solid #CCCCCC] w-full rounded-full focus:outline-none pl-3 p-1 mt-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mt-6">
            <label className="text-[#7a7a7a]">Password</label>
            <input
              autoComplete="off"
              className="border-2 border-[1px solid #CCCCCC] w-full rounded-full focus:outline-none pl-3 p-1 mt-4"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-center mt-10">
            <button
              type="submit"
              className="bg-[#FF3449] hover:bg-red-700 text-white font-bold py-2 px-16 rounded-lg text-left flex my-4"
            >
              {isLoading ? "Submitting" : "Register"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Register;

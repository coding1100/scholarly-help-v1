"use client";

import Button from "@/app/components/Button/Button";
import GoogleAuth from "@/app/components/GoogleAuth/GoogleAuth";
// import GoogleAuth from "@/app/components/GoogleAuth/GoogleAuth";
import { useAuthContext } from "@/app/context/auth/AuthContext";
import axios from "axios";
import { FC, useEffect, useState } from "react";

interface Step2Props {
  setActiveStep: any;
}
const Step2: FC<Step2Props> = ({ setActiveStep }) => {
  const { state, dispatch } = useAuthContext();
  const [showSigninScreen, setShowSigninScreen] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [loginErr, setLoginErr] = useState("");
  const [signupErr, setSignupErr] = useState("");

  useEffect(() => {
    setLoading(false);
  }, [showSigninScreen]);
  // console.log("dispatch",dispatch)

  const login = async () => {
    if (loading || !email.trim() || !password.trim()) return;
    setLoading(true);

    const fd = new FormData();
    fd.append("email", email);
    fd.append("password", password);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_NEW_API_URL}/login.php`,
        fd
      );

      if (res.data.status === 400) {
        setLoginErr(res.data.data.msg);
        setLoading(false);
        return;
      }

      setEmail("");
      setPassword("");
      dispatch({ type: "SET_USER", payload: { email, name: "user name" } });
      setSuccess(true);
      setActiveStep(3);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };
  const signup = async () => {
    if (loading || !email.trim()) return;
    setLoading(true);

    const fd = new FormData();
    fd.append("email", email);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_NEW_API_URL}/register.php`,
        fd
      );

      if (res.data.status === 400) {
        setSignupErr(res.data.data.msg);
        setLoading(false);
        return;
      }

      setEmail("");
      dispatch({ type: "SET_USER", payload: { email, name: "user name" } });
      // setSuccess(true);
      setActiveStep(3);
    } catch (error) {}
    setLoading(false);
  };

  return (
    <div className="container mx-auto py-7 flex justify-center">
      <div className="w-[475px]">
        {state.user.email ? (
          <div className="mt-5">
            <div className="grid grid-cols-2">
              <div className="font-bold">Name:</div>
              <div>{state.user.name}</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="font-bold">Email:</div>
              <div>{state.user.email}</div>
            </div>
            <div className="flex justify-center my-5">
              <div className="w-[155px] border border-[#E0E0E0]"></div>
            </div>
            <div className=" text-center font-semibold">Click on Step 3</div>
          </div>
        ) : (
          <div>
            {showSigninScreen ? (
              <div>
                <div className="text-5xl text-primary-400 font-bold text-center">
                  Sign in
                </div>
                {/* sign in with Google */}
                <div className="my-3">
                  <GoogleAuth setActiveStep={setActiveStep} />
                </div>
                {/* sign in with email */}
                <div className="mt-5">
                  <div className="flex justify-between items-center">
                    <div className="w-[155px] border border-[#E0E0E0]"></div>
                    <div className="text-sm font-light">
                      or signin with email
                    </div>
                    <div className="w-[155px] border border-[#E0E0E0]"></div>
                  </div>
                  <div className="mt-4">
                    <form>
                      <div>
                        <label className="text-xs text-[#7a8794] font-light">
                          Username or Email
                        </label>
                        <div>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border border-[#E0E0E0] px-4 py-2 rounded-xl w-full"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between">
                          <label className="text-xs text-[#7a8794] font-light">
                            Password
                          </label>
                          <div className="text-xs text-[#7a8794] font-light">
                            Forgot?
                          </div>
                        </div>
                        <div>
                          <input
                            type="password"
                            className="border border-[#E0E0E0] px-4 py-2 rounded-xl w-full"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button
                          className={`rounded-full text-sm w-full h-10 font-light ${
                            loading ? "opacity-75" : "opacity-100"
                          }`}
                          onClick={login}
                        >
                          {loading ? "Loading" : "Sign in"}
                        </Button>
                      </div>
                      {loginErr && (
                        <div className="text-[#E15562]">{loginErr}</div>
                      )}
                      <div className="text-xs text-[#7a8794] font-light mt-4 text-center">
                        Don&apos;t have an acount?{" "}
                        <span
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setShowSigninScreen(false);
                            setEmail("");
                          }}
                        >
                          Sign up
                        </span>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <div className="">
                <h2 className="text-5xl text-primary-400 font-bold text-center">
                  Sign up
                </h2>
                <div className="my-3">
                  <GoogleAuth setActiveStep={setActiveStep} />
                </div>
                <div className="flex justify-between items-center mb-4">
                  <div className="w-[155px] border border-[#E0E0E0]"></div>
                  <div className="text-sm font-light">or signin with email</div>
                  <div className="w-[155px] border border-[#E0E0E0]"></div>
                </div>
                <label className="text-xs text-[#7a8794] font-light">
                  Please enter your email and you will receive password on this
                  email
                </label>

                <div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value), setSignupErr("");
                    }}
                    className="border border-[#E0E0E0] px-4 py-2 rounded-xl w-full"
                  />
                </div>
                <div className="mt-4">
                  <Button
                    className={`rounded-full text-sm w-full h-10 font-light ${
                      loading ? "opacity-75" : "opacity-100"
                    }`}
                    onClick={signup}
                  >
                    {loading ? "Submitting" : " Send"}
                  </Button>
                </div>
                <div>
                  {success && (
                    <div className="text-[#01A601]">
                      An email has been sent to your email address with login
                      credentials
                    </div>
                  )}
                  {signupErr && (
                    <div className="text-[#E15562]">{signupErr}</div>
                  )}
                </div>
                <div className="text-xs text-[#7a8794] font-light mt-4 text-center cursor-pointer">
                  Already have an account?{" "}
                  <span
                    onClick={() => {
                      setShowSigninScreen(true);
                      setEmail("");
                    }}
                  >
                    Sign in
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Step2;

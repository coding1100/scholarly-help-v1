"use client";

import React, { useContext } from "react";
import { Auth } from "../contexts/Auth/Auth";

const useAuth = () => {
  const authContext = useContext(Auth);

  if (!authContext) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return authContext;
};

export default useAuth;

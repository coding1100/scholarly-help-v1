"use client";

import React, {
  Dispatch,
  FC,
  SetStateAction,
  createContext,
  useState,
} from "react";

interface AuthContextProps {
  isAuthenticated: boolean;
  authToken: string;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  setAuthToken: Dispatch<SetStateAction<string>>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export const Auth = createContext<AuthContextProps | undefined>(undefined);

const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  let token = "";
  if (typeof localStorage !== "undefined") {
    token = localStorage.getItem("authToken") || "";
  }

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
  const [authToken, setAuthToken] = useState(token);

  return (
    <Auth.Provider
      value={{ isAuthenticated, authToken, setIsAuthenticated, setAuthToken }}
    >
      {children}
    </Auth.Provider>
  );
};

export default AuthProvider;

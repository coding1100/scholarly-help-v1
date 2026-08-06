"use client";

import React, {
  Dispatch,
  FC,
  SetStateAction,
  createContext,
  useState,
} from "react";
import { getScanAccessToken } from "@/app/lib/scanAccessTokenStore";

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
  const token = getScanAccessToken();

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

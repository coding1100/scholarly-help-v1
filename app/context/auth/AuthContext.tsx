import { createContext, useContext } from "react";

interface AuthState {
  user?: any;
  accessToken?: string | null;
  order?: any;
}

type AuthAction = { type: string; payload?: any };

interface AuthContextType {
  state: AuthState;
  dispatch: (action: AuthAction) => void;
}

// Create context with initial state
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an auth provider");
  }
  return context;
};

// const getStoredState = JSON.parse(localStorage.getItem('authState'));

// const storedState = localStorage.getItem("authState");

// const storedAuthState =
//   typeof storedState === "string"
//     ? JSON.parse(storedState)
//     : {
//         user: {},
//         accessToken: null,
//         order: {},
//       };
// export const initialState = storedAuthState;
let storedAuthState: AuthState = {
  user: {},
  accessToken: null,
  order: {},
};

if (typeof window !== "undefined") {
  // Check if window is defined (client-side)
  const storedState = localStorage.getItem("authState");
  storedAuthState =
    typeof storedState === "string"
      ? JSON.parse(storedState)
      : {
          user: {},
          accessToken: null,
          order: {},
        };
}

export const initialState = storedAuthState;
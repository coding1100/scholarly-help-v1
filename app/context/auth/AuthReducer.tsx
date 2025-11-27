import { initialState } from "./AuthContext";

type Action = {
  payload?: any;
  type: string;
};

const AuthReducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case "SET_USER": {
      const newState = {
        ...state,
        user: action.payload,
      };
      // Update state in localStorage
      localStorage.setItem("authState", JSON.stringify(newState));
      return newState;
    }
    case "LOGOUT": {
      const newState = {
        ...state,
        user: {},
      };

      // Update state in localStorage
      localStorage.setItem("authState", JSON.stringify(newState));
      return newState;
    }
    case "UPDATE_ORDER": {
      const newState = {
        ...state,
        order: action.payload,
      };
      // Update state in localStorage
      localStorage.setItem("authState", JSON.stringify(newState));
      return newState;
    }
    default:
      return state;
  }
};

export default AuthReducer;

import React, { FC } from "react";
import AuthProvider from "./contexts/Auth/Auth";

type LayoutProps = {
  children: React.ReactNode;
};

const layout: FC<LayoutProps> = ({ children }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default layout;

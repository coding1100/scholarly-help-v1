import AuthLayout from "@/app/components/Auth/AuthLayout";
import ForgotPassword from "@/app/components/Auth/ForgotPassword";
import React, { Suspense } from "react";

const page = () => {
  return (
    <div>
      <AuthLayout>
        <Suspense fallback={null}>
          <ForgotPassword />
        </Suspense>
      </AuthLayout>
    </div>
  );
};

export default page;

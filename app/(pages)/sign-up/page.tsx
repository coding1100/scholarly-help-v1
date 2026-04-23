import AuthLayout from "@/app/components/Auth/AuthLayout";
// import SignInCard from "@/app/components/Auth/SignInCard";
import SignUpCard from "@/app/components/Auth/SignUpCard";
import React, { Suspense } from "react";

const page = () => {
  return (
    <div>
      <AuthLayout>
        {/* <SignInCard /> */}
        <Suspense fallback={null}>
          <SignUpCard />
        </Suspense>
      </AuthLayout>
    </div>
  );
};

export default page;

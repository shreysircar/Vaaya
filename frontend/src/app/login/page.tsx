/*import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <AuthForm type="login" />
    </div>
  );
}*/
// app/login/page.tsx
"use client";

import dynamic from "next/dynamic";

const AuthForm = dynamic(() => import("@/components/AuthForm"), {
  ssr: false,
});

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full bg-[#F5F5F4] overflow-hidden">
      {/* Left Section: Image */}
      <div className="hidden lg:flex w-6/12 h-full">
        <img
          src="images/login_sofa.png"
          alt="New Collection Product Showcase"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Section: Form */}
      <div className="flex w-full lg:w-6/12 items-center justify-center p-8 sm:p-12 lg:p-16">
        <div className="w-full max-w-md">
          <AuthForm type="login" />
        </div>
      </div>
    </div>
  );
}

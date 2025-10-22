"use client";

import dynamic from "next/dynamic";

const AuthForm = dynamic(() => import("@/components/AuthForm"), {
  ssr: false, // Prevent SSR for this component
});

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F4] flex items-center justify-center pb-20">
      {/* Added bottom padding to create clear gap before footer */}
      <AuthForm type="register" />
    </div>
  );
}

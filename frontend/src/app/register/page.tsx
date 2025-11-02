"use client";

import dynamic from "next/dynamic";

const AuthForm = dynamic(() => import("@/components/AuthForm"), {
  ssr: false, // Prevent SSR for this component
});

export default function RegisterPage() {
  return (
<div className="min-h-screen bg-gradient-to-b from-[#FFF8E1] via-[#E0F7FA] to-[#B2EBF2] flex items-center justify-center pb-20">
  <AuthForm type="register" />
</div>


  );
}

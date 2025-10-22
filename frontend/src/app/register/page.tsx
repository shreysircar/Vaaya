// app/register/page.tsx
"use client";

import dynamic from "next/dynamic";

const AuthForm = dynamic(() => import("@/components/AuthForm"), {
  ssr: false, // Prevent SSR for this component
});

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F4] flex items-center justify-center">
      <AuthForm type="register" />
    </div>
  );
}

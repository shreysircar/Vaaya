import AuthForm from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <AuthForm type="register" />
    </div>
  );
}

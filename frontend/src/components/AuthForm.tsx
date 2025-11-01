
"use client";

import { useState } from "react";
import { apiRequest } from "@/utils/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface AuthFormProps {
  type: "login" | "register";
}

export default function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const { login } = useAuth();
  const isLogin = type === "login";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin ? { email, password } : { name, email, password };
      const data = await apiRequest<{ token: string; user: any }>(endpoint, { method: "POST", body });
      await login(data.token);
      setMessage("✅ Success! Redirecting...");
      setTimeout(() => router.push("/profile"), 800);
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md mx-auto mt-20 border border-gray-100"
    >
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        {isLogin ? "Welcome Back!" : "Create Account"}
      </h2>

      {!isLogin && (
        <div className="mb-4">
          <label className="block text-gray-700 text-sm mb-2">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            placeholder="John Doe"
          />
        </div>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 text-sm mb-2">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          placeholder="you@example.com"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 text-sm mb-2">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
          placeholder="••••••••"
        />
      </div>

      {/* Teal Submit Button */}
  <button
  type="submit"
  disabled={loading}
  className={`w-full py-3 rounded-xl text-white font-semibold text-lg transition ${
    loading
      ? "bg-[#025a6a]/60 cursor-not-allowed"
      : "bg-[#025a6a] hover:bg-[#014c57]"
  }`}
>
  {loading ? "Processing..." : isLogin ? "LOGIN" : "REGISTER"}
</button>

      <p className="text-sm text-gray-600 text-center mt-5">
        {isLogin ? (
          <>Don’t have an account? <Link href="/register" className="text-teal-600 font-medium hover:underline">Sign up</Link></>
        ) : (
          <>Already have an account? <Link href="/login" className="text-teal-600 font-medium hover:underline">Log in</Link></>
        )}
      </p>

      {message && (
        <p className={`text-center mt-4 p-3 rounded-lg font-medium ${message.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message}
        </p>
      )}
    </form>
  );
}

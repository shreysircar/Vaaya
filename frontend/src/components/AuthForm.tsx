"use client";

import { useState } from "react";
import { apiRequest } from "@/utils/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // ✅ use global auth context

interface AuthFormProps {
  type: "login" | "register";
}

export default function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const { login } = useAuth(); // ✅ use login function from context
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

      // ✅ call backend API
      const data = await apiRequest<{ token: string; user: any }>(endpoint, {
        method: "POST",
        body,
      });

      // ✅ use context to save token & user
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
      className="bg-white shadow-md rounded-lg p-6 w-full max-w-md mx-auto mt-16"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        {isLogin ? "Sign In" : "Create Account"}
      </h2>

      {!isLogin && (
        <div className="mb-4">
          <label className="block text-gray-700 text-sm mb-2">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 text-sm mb-2">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 rounded-md text-white transition ${
          loading
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Processing..." : isLogin ? "Sign In" : "Register"}
      </button>

      <p className="text-sm text-gray-600 text-center mt-4">
        {isLogin ? (
          <>
            Don’t have an account?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Log in
            </a>
          </>
        )}
      </p>

      {message && (
        <p className="text-center text-sm mt-4 text-gray-700">{message}</p>
      )}
    </form>
  );
}

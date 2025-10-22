"use client";

import { useState } from "react";

interface AuthFormProps {
  type: "login" | "register";
}

export default function AuthForm({ type }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isLogin = type === "login";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`${isLogin ? "Logging in" : "Registering"} with`, email, password);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-lg p-6 w-full max-w-md mx-auto mt-16"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        {isLogin ? "Sign In" : "Create Account"}
      </h2>

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
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
      >
        {isLogin ? "Sign In" : "Register"}
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
    </form>
  );
}

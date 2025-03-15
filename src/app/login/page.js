"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "@/config/firebase";
import Link from "next/link";
import { setCookie } from "cookies-next";

export default function LoginPage() {
  const [user, setUser] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    const { email, password } = user;

    if (!email || !password) {
      setError("Please fill out all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await setPersistence(auth, browserSessionPersistence);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const token = await userCredential.user.getIdToken();

      setCookie("token", token, { path: "/" });

      router.push("/find-ride");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-blue-200 h-[641px] p-4">
        <div className="flex flex-col justify-center items-center w-[400px] h-[340px] bg-white rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold mb-8">Welcome Back!</h2>
      <form onSubmit={handleLogin} className="flex flex-col text-black">
        <input
          type="email"
          placeholder="Email"
          id="email"
          value={user.email}
          autoComplete="email"
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          className="border border-gray-300  bg-gray-100 mb-3 p-2 w-[310px] rounded-full pl-4 justify-center placeholder:text-gray-400"
        />
        <input
          type="password"
          placeholder="Password"
          id="password"
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
          className="border border-gray-300 mb-5 bg-gray-100 p-2 w-[310px] rounded-full pl-4 justify-center  placeholder:text-gray-400 "
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 active:bg-blue-700"
        >
          {isLoading ? "Loading..." : "Login"}
        </button>
      </form>
      {error && <p className="text-red-500">{error}</p>}

      <p className="mt-4">
        Don't have an account?{" "}
        <Link href="/signup" className="text-blue-500  hover:text-blue-600 active:text-blue-700">
          Sign Up
        </Link>
      </p>
      </div>
    </div>
  );
}

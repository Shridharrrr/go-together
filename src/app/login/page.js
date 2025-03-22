"use client";
import { motion } from "framer-motion";
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
import Navbar from "@/components/Navbar";

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
    <div className=" bg-slate-900 h-screen overflow-hidden">
      <Navbar/>
      <div className="flex flex-col items-center justify-center">
        <div className="relative flex gap-10 flex-wrap lg:flex-nowrap">
          <motion.img
            src="Pic-1.png"
            className="h-[460px] w-[400px] rounded-l-xl hidden lg:block"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />

          <div className="flex flex-col justify-center items-center w-[400px] md:w-[440px] h-[460px] bg-slate-800 border-indigo-500 rounded-2xl border-2 shadow-2xl">
            <h2 className="text-4xl text-white font-bold">Welcome Back!</h2>
            <span className="text-white mb-8">Let’s Go-Together Again!</span>
            <form
              onSubmit={handleLogin}
              className="flex flex-col text-gray-900"
            >
              <input
                type="email"
                placeholder="Email"
                id="email"
                value={user.email}
                autoComplete="email"
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                className="border border-gray-300 bg-gray-100 mb-3 p-2 w-[310px] rounded-full pl-4 justify-center placeholder:text-gray-400"
              />
              <input
                type="password"
                placeholder="Password"
                id="password"
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                className="border border-gray-300 mb-5 bg-gray-100 p-2 w-[310px] rounded-full pl-4 justify-center placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-indigo-500 text-white p-2 rounded-full hover:bg-indigo-600 active:bg-indigo-700"
              >
                {isLoading ? "Loading..." : "Login"}
              </button>
            </form>
            {error && <p className="text-red-500">{error}</p>}
            <p className="mt-4 text-white">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-blue-500 hover:text-blue-600 active:text-blue-700"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

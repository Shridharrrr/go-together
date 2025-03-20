"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/config/firebase";
import { deleteCookie } from "cookies-next";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const authInstance = getAuth();
    const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const getButtonStyles = (page) => {
    const isActive = pathname === page;
    return `py-2 px-5 rounded-full active:scale-95 transition-all ${
      isActive
        ? "bg-transparent border border-indigo-500 text-indigo-500 cursor-not-allowed active:scale-100"
        : "bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white"
    }`;
  };

  const handleLogout = async () => {
    await signOut(auth);
    deleteCookie("token");
    router.push("/login");
  };

  return (
    <nav className="bg-slate-900 text-white p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold ml-3">GoTogether</h1>

      <div className="flex gap-4 mr-3">
        {user ? (
          <>
            <Link
              href="/my-rides"
              className=" bg-indigo-500 py-2 px-5 rounded-full active:scale-95 hover:bg-indigo-600 active:bg-indigo-700"
            >
              My Rides
            </Link>
            <Link
              href="/my-requests"
              className=" bg-indigo-500 py-2 px-5 rounded-full active:scale-95 hover:bg-indigo-600 active:bg-indigo-700"
            >
              My Requests
            </Link>
            <Link
              href="/create-ride"
              className=" bg-indigo-500 py-2 px-5 rounded-full active:scale-95 hover:bg-indigo-600 active:bg-indigo-700"
            >
              Create Ride
            </Link>
            <Link
              href="/find-ride"
              className=" bg-indigo-500 py-2 px-5 rounded-full active:scale-95 hover:bg-indigo-600 active:bg-indigo-700"
            >
              Find Ride
            </Link>
            <Link
              href="/available-rides"
              className=" bg-indigo-500 py-2 px-5 rounded-full active:scale-95 hover:bg-indigo-600 active:bg-indigo-700"
            >
              All rides
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded"
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link
              href={pathname === "/signup" ? "#" : "/signup"}
              className={getButtonStyles("/signup")}
            >
              Sign Up
            </Link>
            <Link
              href={pathname === "/login" ? "#" : "/login"}
              className={getButtonStyles("/login")}
            >
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

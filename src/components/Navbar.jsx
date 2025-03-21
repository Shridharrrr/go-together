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
        ? "bg-transparent outline outline-2 outline-indigo-500 text-indigo-500 cursor-not-allowed active:scale-100"
        : "bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white"
    }`;
  };

  const handleLogout = async () => {
    await signOut(auth);
    deleteCookie("token");
    router.push("/login");
  };

  return (
    <nav className="bg-slate-900 text-white p-4 pt-6 flex justify-between items-center">
      <h1 className="text-2xl font-bold ml-3">GoTogether</h1>

      <div className="flex gap-4 mr-3">
        {user ? (
          <>
            <Link
              href={pathname === "/my-rides"? "#" : "/my-rides"}
              className={getButtonStyles("/my-rides")}
            >
              My Rides
            </Link>
            <Link
              href={pathname === "/my-requests"? "#" : "/my-requests"}
              className={getButtonStyles("/my-requests")}
            >
              My Requests
            </Link>
            <Link
              href={pathname === "/create-ride"? "#" : "/create-ride"}
              className={getButtonStyles("/create-ride")}
            >
              Create Ride
            </Link>
            <Link
             href={pathname === "/find-ride"? "#" : "/find-ride"}
             className={getButtonStyles("/find-ride")}
            >
              Find Ride
            </Link>
            <Link
              href={pathname === "/available-rides" ? "#" : "/available-rides"}
              className={getButtonStyles("/available-rides")}
            >
              All rides
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 px-4 py-2 rounded-full hover:bg-red-700"
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

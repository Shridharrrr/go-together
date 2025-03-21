"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/config/firebase";
import { deleteCookie } from "cookies-next";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
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

  const getButtonStylesmobile = (page) => {
    const isActive = pathname === page;
    return `py-2 px-5 rounded-full active:scale-95 transition-all ${
      isActive
        ? "bg-transparent text-center w-3/4 outline outline-2 outline-indigo-500 text-indigo-500 cursor-not-allowed active:scale-100"
        : "bg-indigo-600 text-center w-3/4 hover:bg-indigo-700 active:bg-indigo-800 text-white"
    }`;
  };

  const handleLogout = async () => {
    await signOut(auth);
    deleteCookie("token");
    router.push("/login");
  };

  return (
    <nav className="bg-slate-900 text-white p-4 py-6 mb-6 flex justify-between items-center relative z-50">
  <h1 className="text-2xl font-bold ml-3">GoTogether</h1>

  {/* Desktop Navigation */}
  <div className="hidden lg:flex gap-4 mr-3">
    {user ? (
      <>
        <Link href="/my-rides" className={getButtonStyles("/my-rides")}>
          My Rides
        </Link>
        <Link href="/my-requests" className={getButtonStyles("/my-requests")}>
          My Requests
        </Link>
        <Link href="/create-ride" className={getButtonStyles("/create-ride")}>
          Create Ride
        </Link>
        <Link href="/find-ride" className={getButtonStyles("/find-ride")}>
          Find Ride
        </Link>
        <Link href="/available-rides" className={getButtonStyles("/available-rides")}>
          All Rides
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
        <Link href="/signup" className={getButtonStyles("/signup")}>
          Sign Up
        </Link>
        <Link href="/login" className={getButtonStyles("/login")}>
          Login
        </Link>
      </>
    )}
  </div>

  {/* Mobile Menu Button */}
  <button
    className="lg:hidden p-2 focus:outline-none"
    onClick={() => setIsOpen(!isOpen)}
  >
    {isOpen ? <X size={28} /> : <Menu size={28} />}
  </button>

  {/* Mobile Menu (Fixing Hidden Issue) */}
  {isOpen && (
    <div className="absolute top-full left-0 w-full bg-slate-900 text-white flex flex-col items-center py-4 space-y-3 shadow-lg lg:hidden z-[1000]">
      {user ? (
        <>
          <Link href="/my-rides" className={getButtonStylesmobile("/my-rides")} onClick={() => setIsOpen(false)}>
            My Rides
          </Link>
          <Link href="/my-requests" className={getButtonStylesmobile("/my-requests")} onClick={() => setIsOpen(false)}>
            My Requests
          </Link>
          <Link href="/create-ride" className={getButtonStylesmobile("/create-ride")} onClick={() => setIsOpen(false)}>
            Create Ride
          </Link>
          <Link href="/find-ride" className={getButtonStylesmobile("/find-ride")} onClick={() => setIsOpen(false)}>
            Find Ride
          </Link>
          <Link href="/available-rides" className={getButtonStylesmobile("/available-rides")} onClick={() => setIsOpen(false)}>
            All Rides
          </Link>
          <button
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            className="bg-red-600 w-3/4 text-center px-4 py-2 rounded-full hover:bg-red-700"
          >
            Log Out
          </button>
        </>
      ) : (
        <>
          <Link href="/signup" className={getButtonStylesmobile("/signup")} onClick={() => setIsOpen(false)}>
            Sign Up
          </Link>
          <Link href="/login" className={getButtonStylesmobile("/login")} onClick={() => setIsOpen(false)}>
            Login
          </Link>
        </>
      )}
    </div>
  )}
</nav>

  );
}

"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/config/firebase";
import { deleteCookie } from "cookies-next";
import { usePathname } from "next/navigation";
import { Car, Menu, X } from "lucide-react";

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

  const getButtonStylesMobile = (page) => {
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
    <nav className="bg-slate-900 text-white p-3 py-6 mb-6 flex justify-between items-center relative z-50">
      <h1 className="flex items-center text-2xl font-bold ml-3 text-indigo-500"><span className="text-white">Trip</span>Mate&nbsp; <Car size={32} color="#ffffff" strokeWidth={1.5} /></h1>

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

      {/* Mobile Menu Button (Only for Logged-in Users) */}
      {user ? (
        <button
          className="lg:hidden p-2 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      ) : (
        // Show Sign Up and Login directly if the user is not logged in
        <div className="lg:hidden flex gap-3">
          <Link href="/signup" className={getButtonStyles("/signup")}>
            Sign Up
          </Link>
          <Link href="/login" className={getButtonStyles("/login")}>
            Login
          </Link>
        </div>
      )}

      {/* Mobile Menu */}
      {isOpen && user && (
        <div className="absolute top-full left-0 w-full bg-slate-900 text-white flex flex-col items-center py-4 space-y-3 shadow-lg lg:hidden z-[1000]">
          <Link href="/my-rides" className={getButtonStylesMobile("/my-rides")} onClick={() => setIsOpen(false)}>
            My Rides
          </Link>
          <Link href="/my-requests" className={getButtonStylesMobile("/my-requests")} onClick={() => setIsOpen(false)}>
            My Requests
          </Link>
          <Link href="/create-ride" className={getButtonStylesMobile("/create-ride")} onClick={() => setIsOpen(false)}>
            Create Ride
          </Link>
          <Link href="/find-ride" className={getButtonStylesMobile("/find-ride")} onClick={() => setIsOpen(false)}>
            Find Ride
          </Link>
          <Link href="/available-rides" className={getButtonStylesMobile("/available-rides")} onClick={() => setIsOpen(false)}>
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
        </div>
      )}
    </nav>
  );
}

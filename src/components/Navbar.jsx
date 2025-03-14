"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/config/firebase"; 
import { deleteCookie } from "cookies-next";

export default function Navbar() {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const authInstance = getAuth();
        const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe(); 
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        deleteCookie("token"); 
        router.push("/login"); 
    };

    return (
        <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">Carpool</h1>

            <div className="flex gap-4">
                {user ? (
                    <>
                        <Link href="/my-rides" className="hover:text-gray-400">My Rides</Link>
                        <Link href="/my-requests" className="hover:text-gray-400">My Requests</Link>
                        <Link href="/create-ride" className="hover:text-gray-400">Create Ride</Link>
                        <Link href="/find-ride" className="hover:text-gray-400">Find Ride</Link>
                        <Link href="/available-rides" className="hover:text-gray-400">All rides</Link>
                        <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded">
                            Log Out
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/signup" className="hover:text-gray-400">Sign Up</Link>
                        <Link href="/login" className="hover:text-gray-400">Login</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
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
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h2 className="text-2xl font-bold mb-4">Login</h2>

            {error && <p className="text-red-500">{error}</p>}

            <form onSubmit={handleLogin} className="flex flex-col gap-4 text-black">
                <input
                    type="email"
                    placeholder="Email"
                    id="email"
                    value={user.email}
                    autoComplete="email"
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    className="border p-2 rounded"
                />
                <input
                    type="password"
                    placeholder="Password"
                    id="password"
                    value={user.password}
                    onChange={(e) => setUser({ ...user, password: e.target.value })}
                    className="border p-2 rounded"
                />
                <button type="submit" disabled={isLoading} className="bg-blue-500 text-white p-2 rounded">
                    {isLoading ? "Loading..." : "Login"}
                </button>
            </form>

            <p className="mt-4">
                Don't have an account? <Link href="/signup" className="text-blue-500">Sign Up</Link>
            </p>
        </div>
    );
}

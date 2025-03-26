"use client";

import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="flex flex-col lg:flex-row justify-center items-center px-12 ">
        {/* Text Section */}
        <div className="flex flex-col gap-6 text-center justify-center items-center p-6">
          <h4 className="text-5xl lg:text-6xl font-semibold text-white">
            Let's travel with <span className="text-green-500">GoTogether!</span>
          </h4>
          <button
            onClick={() => router.push("/signup")}
            className="relative group text-lg md:text-xl bg-indigo-500 w-[350px] font-semibold text-white p-3 md:p-4 rounded-full hover:bg-indigo-600 active:bg-indigo-700 transition-all overflow-hidden"
          >
            <span className="group-hover:opacity-0 transition-opacity duration-300">
              Get Started
            </span>
            <span className="absolute inset-0 flex items-center text-xl md:text-2xl mb-1 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              →
            </span>
          </button>
        </div>

        {/* Image Section */}
        <div className="w-full lg:h-[480px] flex justify-center">
        <motion.img
            src="Pic-3.png"
            className="w-full"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}


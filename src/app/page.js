"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-900 overflow-x-hidden">
      <Navbar />
      
      
      <div className=" flex flex-col lg:flex-row justify-center items-center px-6 md:px-12 h-[490px] mb-16 md:mb-28 text-center lg:text-left">
        <div className="flex flex-col w-full lg:w-1/2 items-center text-center p-6">
          <h4 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight">
            Let's travel with <span className="text-green-400 font-bold text-5xl md:text-6xl lg:text-7xl">GoTogether!</span>
          </h4>
          <button
            onClick={() => router.push("/signup")}
            className="relative group text-lg md:text-xl bg-indigo-500 w-[250px] md:w-[350px] font-semibold text-white p-3 md:p-4 mt-6 rounded-full hover:bg-indigo-600 active:bg-indigo-700 transition-all overflow-hidden"
          >
            <span className="group-hover:opacity-0 transition-opacity duration-300">Get Started</span>
            <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">➤</span>
          </button>
        </div>
        <div className="w-full max-w-md md:max-w-lg lg:max-w-xl flex justify-center">
          <motion.img
            src="Pic-3.png"
            className="w-full"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      
      <div className="flex flex-col md:flex-row justify-center items-center p-4 sm:p-6 gap-8 sm:gap-12 md:gap-24 bg-white w-full py-12 md:py-8">
        <FeatureCard
          title="Your pick of rides at low prices"
          description="Find the perfect ride from our wide range of destinations and routes at low prices."
        />
        <div className="hidden sm:block h-16 w-px bg-gray-200"></div>
        <FeatureCard
          title="Scroll, click, tap and go"
          description="Booking a ride has never been easier! Thanks to our simple app, you can book a ride in just minutes."
        />
      </div>

      
      <div className="flex flex-col md:flex-row justify-center items-center p-12 sm:p-12 md:p-12 lg:p-16 gap-8 sm:gap-12 md:gap-24 bg-slate-900 w-full">
        <div className="text-center md:text-left max-w-md flex flex-col items-center">
          <h3 className="text-3xl sm:text-3xl md:text-4xl text-indigo-500 font-semibold">What's your destination?</h3>
          <p className="text-gray-100 font-light mt-2 text-sm sm:text-base">Let's make this your least expensive journey ever</p>
          <button
            onClick={() => router.push("/create-ride")}
            className="relative group text-base sm:text-lg md:text-xl bg-indigo-500 w-3/4 sm:w-[200px] md:w-[250px] font-semibold text-white p-3 md:p-4 mt-6 rounded-full hover:bg-indigo-600 active:bg-indigo-700 transition-all overflow-hidden"
          >
            <span className="group-hover:opacity-0 transition-opacity duration-300">Offer a ride</span>
            <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
          </button>
        </div>
        <div className="mt-2 md:mt-0">
          <img 
            src="Pic-2.png" 
            className="h-32 sm:h-40 md:h-[260px] bg-contain" 
            alt="Carpooling" 
          />
        </div>
        
      </div>

      
      <footer className="flex flex-col md:flex-row justify-between items-center bg-gray-800 py-12 px-4 sm:px-6 md:px-12 text-center md:text-left">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 md:gap-6 items-center">
          <h1 className="text-lg sm:text-lg md:text-xl font-semibold text-white">Connect with me on :</h1>
          <div className="flex gap-3 sm:gap-4">
          <div className="bg-white rounded-lg">
          <a href="https://www.linkedin.com/in/shridhar-mandrekar-53437b326?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="40"
              height="40"
              viewBox="0 0 50 50"
            >
              <path d="M41,4H9C6.24,4,4,6.24,4,9v32c0,2.76,2.24,5,5,5h32c2.76,0,5-2.24,5-5V9C46,6.24,43.76,4,41,4z M17,20v19h-6V20H17z M11,14.47c0-1.4,1.2-2.47,3-2.47s2.93,1.07,3,2.47c0,1.4-1.12,2.53-3,2.53C12.2,17,11,15.87,11,14.47z M39,39h-6c0,0,0-9.26,0-10 c0-2-1-4-3.5-4.04h-0.08C27,24.96,26,27.02,26,29c0,0.91,0,10,0,10h-6V20h6v2.56c0,0,1.93-2.56,5.81-2.56 c3.97,0,7.19,2.73,7.19,8.26V39z"></path>
            </svg>
          </a>
          </div>
          <div className="bg-white rounded-full">
          <a
            href="https://github.com/Shridharrrr"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="40"
              height="40"
              viewBox="0 0 30 30"
            >
              <path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"></path>
            </svg>
          </a>
          </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description }) {
  return (
    <div className="flex flex-col w-full max-w-md items-center text-center p-4">
      <h3 className="text-gray-700 text-xl sm:text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-500 text-sm sm:text-base">{description}</p>
    </div>
  );
}

function SocialLink({ href, icon }) {
  const icons = {
    linkedin: "M41,4H9C6.24,4,4,6.24,4,9v32c0,2.76,2.24,5,5,5h32c2.76,0,5-2.24,5-5V9C46,6.24,43.76,4,41,4z M17,20v19h-6V20H17z M11,14.47c0-1.4,1.2-2.47,3-2.47s2.93,1.07,3,2.47c0,1.4-1.12,2.53-3,2.53C12.2,17,11,15.87,11,14.47z M39,39h-6c0,0,0-9.26,0-10 c0-2-1-4-3.5-4.04h-0.08C27,24.96,26,27.02,26,29c0,0.91,0,10,0,10h-6V20h6v2.56c0,0,1.93-2.56,5.81-2.56 c3.97,0,7.19,2.73,7.19,8.26V39z",
    github: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
  };
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="bg-white p-1 sm:p-2 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="24" height="24" fill="#000">
        <path d={icons[icon]} />
      </svg>
    </a>
  );
}

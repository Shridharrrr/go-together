"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/config/firebase";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";
import { doc, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const totalSteps = 6;
  const [user, setUser] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    phone: "",
    age: "",
    gender: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const isValidPassword = (password) =>
    password.length >= 6 && /\d/.test(password);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const nextStep = () => {
    if (!user.email && step === 1) return setError("Please enter your email.");
    if (!validateEmail(user.email) && step === 1)
      return setError("Invalid email format.");
    if (!user.firstname && step === 2) return setError("Enter your firstname.");
    if ((!user.age || user.age < 16) && step === 3)
      return setError("Age must be greater than 16.");
    if (!user.gender && step === 4) return setError("Select your gender.");
    if (!isValidPassword(user.password) && step === 5)
      return setError(
        "Password must be at least 6 characters long and contain a number."
      );
    if (!user.phone && step === 6) return setError("Enter your phone number.");

    setError("");
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );
      const newUser = userCredential.user;
      await updateProfile(newUser, {
        displayName: `${user.firstname} ${user.lastname}`,
      });
      await setDoc(doc(db, "userInfo", newUser.uid), {
        ...user,
        uid: newUser.uid,
      });

      router.push("/find-ride");
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };
  return (
    <div className="flex flex-col bg-slate-900 h-[628px] items-center w-screen">
      <span className="mt-4 text-6xl mb-3 font-bold bg-gradient-to-r from-[#4c3fff] via-[#665bff] to-[#7579ff] bg-clip-text text-transparent leading-tight pb-1">
        <span className="text-green-400">Sign-Up</span> and Get started!
      </span>
      <span className="text-white text-xl mb-16 ">"Meet, share, and ride - your carpooling community awaits!"</span>

      <div className="flex gap-6 items-start justify-center w-full">
        <motion.img
          src="Pic-2.png"
          className="h-[340px] w-[520px] bg-contain"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        ></motion.img>
        <div className="flex flex-col mt-4 items-center justify-center border-2 border-indigo-500 rounded-2xl py-10 w-[520px] px-4 bg-slate-800 shadow-lg">
          <div className="flex justify-center mb-4">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div
                key={num}
                className={`h-3 w-3 mx-1 rounded-full transition-all duration-800 ${
                  num === step ? "bg-green-400 w-4 h-4" : "bg-gray-500"
                }`}
              ></div>
            ))}
          </div>
          {step === 1 && (
            <>
              <label className="text-2xl mb-4 text-white font-semibold">
                What is your email?
              </label>
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="border border-gray-300 bg-gray-100 mb-3 p-2 w-[410px] rounded-full pl-4 justify-center placeholder:text-gray-400"
              />

              <button
                onClick={nextStep}
                className="relative group bg-indigo-500 w-[120px] text-white p-2 rounded-2xl hover:bg-indigo-600 active:bg-indigo-700 transition-all overflow-hidden"
              >
                <span className="group-hover:opacity-0 transition-opacity duration-300">
                  Next
                </span>
                <span className="absolute inset-0 flex items-center text-2xl mb-1 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  →
                </span>
              </button>
              {error && <p className="mt-2 text-red-500 text-md">{error}</p>}
            </>
          )}
          {step === 2 && (
            <>
              <label className="text-2xl mb-4 text-white font-semibold">
                What is your name?
              </label>
              <input
                type="text"
                name="firstname"
                value={user.firstname}
                onChange={handleChange}
                placeholder="Firstname"
                required
                className="border border-gray-300  bg-gray-100 mb-3 p-2 w-[410px] rounded-full pl-4 justify-center placeholder:text-gray-400"
              />
              <input
                type="text"
                name="lastname"
                value={user.lastname}
                onChange={handleChange}
                placeholder="Lastname (Optional)"
                className="border border-gray-300 bg-gray-100 mb-3 p-2 w-[410px] rounded-full pl-4 justify-center placeholder:text-gray-400"
              />
              <div className="flex gap-4 mt-2">
                <button
                  onClick={prevStep}
                  className="relative group w-[120px] text-indigo-500 p-2 rounded-full border border-indigo-500 bg-transparen transition-all overflow-hidden"
                >
                  <span className="group-hover:opacity-0 transition-opacity duration-300">
                    Back
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center text-2xl mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-indigo-500">
                    ←
                  </span>
                </button>

                <button
                  onClick={nextStep}
                  className="relative group bg-indigo-500 w-[120px] text-white p-2 rounded-full hover:bg-indigo-600 active:bg-indigo-700 transition-all overflow-hidden"
                >
                  <span className="group-hover:opacity-0 transition-opacity duration-300">
                    Next
                  </span>
                  <span className="absolute inset-0 flex items-center text-2xl mb-1 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    →
                  </span>
                </button>
              </div>
              {error && <p className="mt-2 text-red-500 text-md">{error}</p>}
            </>
          )}
          {step === 3 && (
            <>
              <label className="text-2xl mb-4 text-white font-semibold">
                What is your age?
              </label>
              <input
                type="number"
                name="age"
                value={user.age}
                onChange={handleChange}
                placeholder="Age"
                required
                className="border border-gray-300 bg-gray-100 mb-3 p-2 w-[410px] rounded-full pl-4 justify-center placeholder:text-gray-400"
              />
              <div className="flex gap-4 mt-2">
                <button
                  onClick={prevStep}
                  className="relative group w-[120px] text-indigo-500 p-2 rounded-full border border-indigo-500 bg-transparen transition-all overflow-hidden"
                >
                  <span className="group-hover:opacity-0 transition-opacity duration-300">
                    Back
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center text-2xl mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-indigo-500">
                    ←
                  </span>
                </button>

                <button
                  onClick={nextStep}
                  className="relative group bg-indigo-500 w-[120px] text-white p-2 rounded-full hover:bg-indigo-600 active:bg-indigo-700 transition-all overflow-hidden"
                >
                  <span className="group-hover:opacity-0 transition-opacity duration-300">
                    Next
                  </span>
                  <span className="absolute inset-0 flex items-center text-2xl mb-1 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    →
                  </span>
                </button>
              </div>
              {error && <p className="mt-2 text-red-500 text-md">{error}</p>}
            </>
          )}
          {step === 4 && (
            <>
              <label className="text-2xl mb-4 text-white font-semibold">
                What is your gender?
              </label>
              <select
                name="gender"
                value={user.gender}
                onChange={handleChange}
                required
                className="border border-gray-300 bg-gray-100 mb-3 p-2 w-[410px] rounded-full pl-4 justify-center placeholder:text-gray-400"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <div className="flex gap-4 mt-2">
                <button
                  onClick={prevStep}
                  className="relative group w-[120px] text-indigo-500 p-2 rounded-full border border-indigo-500 bg-transparen transition-all overflow-hidden"
                >
                  <span className="group-hover:opacity-0 transition-opacity duration-300">
                    Back
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center text-2xl mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-indigo-500">
                    ←
                  </span>
                </button>

                <button
                  onClick={nextStep}
                  className="relative group bg-indigo-500 w-[120px] text-white p-2 rounded-full hover:bg-indigo-600 active:bg-indigo-700 transition-all overflow-hidden"
                >
                  <span className="group-hover:opacity-0 transition-opacity duration-300">
                    Next
                  </span>
                  <span className="absolute inset-0 flex items-center text-2xl mb-1 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    →
                  </span>
                </button>
              </div>
              {error && <p className="mt-2 text-red-500 text-md">{error}</p>}
            </>
          )}

          {step === 5 && (
            <>
              <label className="text-2xl mb-4 text-white font-semibold">
                <div className="flex m-0">
                  <span>Create password&nbsp;</span>{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#e3e3e3"
                    className="mt-1"
                  >
                    <path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z" />
                  </svg>
                </div>
              </label>
              <input
                type="password"
                name="password"
                value={user.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="border border-gray-300 bg-gray-100 mb-3 p-2 w-[410px] rounded-full pl-4 justify-center placeholder:text-gray-400"
              />
              <div className="flex gap-4 mt-2">
                <button
                  onClick={prevStep}
                  className="relative group w-[120px] text-indigo-500 p-2 rounded-full border border-indigo-500 bg-transparen transition-all overflow-hidden"
                >
                  <span className="group-hover:opacity-0 transition-opacity duration-300">
                    Back
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center text-2xl mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-indigo-500">
                    ←
                  </span>
                </button>

                <button
                  onClick={nextStep}
                  className="relative group bg-indigo-500 w-[120px] text-white p-2 rounded-full hover:bg-indigo-600 active:bg-indigo-700 transition-all overflow-hidden"
                >
                  <span className="group-hover:opacity-0 transition-opacity duration-300">
                    Next
                  </span>
                  <span className="absolute inset-0 flex items-center text-2xl mb-1 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    →
                  </span>
                </button>
              </div>
              {error && <p className="mt-2 text-red-500 text-md">{error}</p>}
            </>
          )}

          {step === 6 && (
            <>
              <label className="text-2xl mb-4 text-white font-semibold">
                Enter phone number
              </label>
              <div className="flex justify-center [410px]">
                <PhoneInput
                  country={"in"}
                  value={user.phone}
                  onChange={(phone) => setUser({ ...user, phone })}
                  inputProps={{
                    name: "phone",
                    required: true,
                  }}
                  containerClass="w-[410px]"
                  inputClass="border p-2"
                />
              </div>

              <div className="flex gap-4 mt-4">
                <button
                  onClick={prevStep}
                  className="relative group w-[120px] text-indigo-500 p-2 rounded-full border border-indigo-500 bg-transparent transition-all overflow-hidden"
                >
                  <span className="group-hover:opacity-0 transition-opacity duration-300">
                    Back
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center text-2xl mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-indigo-500">
                    ←
                  </span>
                </button>
                <button
                  onClick={handleSignup}
                  className="relative group w-[120px] bg-green-500 text-white rounded-full hover:bg-green-600 active:bg-green-700 transition-all overflow-hidden"
                  disabled={isLoading}
                >
                  <span className="group-hover:opacity-0 transition-opacity duration-300">
                    {isLoading ? "Submitting..." : "Submit"}
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center  opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    ✓
                  </span>
                </button>
              </div>
              {error && <p className="mt-2 text-red-500 text-md">{error}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/config/firebase";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";
import { doc, setDoc } from "firebase/firestore";

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

  const isValidPassword = (password) => password.length >= 6 && /\d/.test(password);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const nextStep = () => {
    if (!user.email && step === 1) return setError("Please enter your email.");
    if (!validateEmail(user.email) && step === 1) return setError("Invalid email format.");
    if ((!user.firstname || !user.lastname) && step === 2) return setError("Enter your full name.");
    if (!user.age && step === 3) return setError("Enter your age.");
    if (!user.gender && step === 4) return setError("Select your gender.");
    if (!isValidPassword(user.password) && step === 5) return setError("Password must be at least 6 characters long and contain a number.");
    if (!user.phone && step === 6) return setError("Enter your phone number.");
    
    setError("");
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      const newUser = userCredential.user;
      await updateProfile(newUser, { displayName: `${user.firstname} ${user.lastname}` });
      await setDoc(doc(db, "userInfo", newUser.uid), { ...user, uid: newUser.uid });
      
      router.push("/find-ride");
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };
  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-md mx-auto">
      <div className="w-full bg-gray-300 h-2 rounded">
        <div
          className="bg-blue-500 h-2 rounded"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        ></div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
      {step === 1 && (
        <>
          <label className="text-lg font-semibold">What is your email?</label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
          <button
            onClick={nextStep}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Next
          </button>
        </>
      )}
      {step === 2 && (
        <>
          <label className="text-lg font-semibold">What is your name?</label>
          <input
            type="text"
            name="firstname"
            value={user.firstname}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
          <input
            type="text"
            name="lastname"
            value={user.lastname}
            onChange={handleChange}
            className="border p-2 w-full"
          />
          <div className="flex gap-4">
            <button
              onClick={prevStep}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Back
            </button>
            <button
              onClick={nextStep}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Next
            </button>
          </div>
        </>
      )}
      {step === 3 && (
        <>
          <label className="text-lg font-semibold">What is your age?</label>
          <input
            type="number"
            name="age"
            value={user.age}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
          <div className="flex gap-4">
            <button
              onClick={prevStep}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Back
            </button>
            <button
              onClick={nextStep}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Next
            </button>
          </div>
        </>
      )}
      {step === 4 && (
        <>
          <label className="text-lg font-semibold">What is your gender?</label>
          <select
            name="gender"
            value={user.gender}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <div className="flex gap-4">
            <button
              onClick={prevStep}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Back
            </button>
            <button
              onClick={nextStep}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Next
            </button>
          </div>
        </>
      )}

      {step === 5 && (
        <>
          <label className="text-lg font-semibold">Create password</label>
          <input
            type="password"
            name="password"
            value={user.password}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
          <div className="flex gap-4">
            <button
              onClick={prevStep}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Back
            </button>
            <button
              onClick={nextStep}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Next
            </button>
          </div>
        </>
      )}

      {step === 6 && (
        <>
          <label className="text-lg font-semibold">Enter phone number</label>
          <PhoneInput
            country={"in"}
            value={user.phone}
            onChange={(phone) => setUser({ ...user, phone })}
            inputProps={{
              name: "phone",
              required: true,
            }}
            containerClass="w-full"
            inputClass="border p-2 w-full"
          />
          <div className="flex gap-4">
            <button
              onClick={prevStep}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Back
            </button>
            <button
              onClick={handleSignup}
              className="bg-green-500 text-white px-4 py-2 rounded"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </>
      )}
    </div>
  );
} 
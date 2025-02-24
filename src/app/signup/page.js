"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/config/firebase";
import PhoneInput from "react-phone-input-2";
import { doc, setDoc } from "firebase/firestore";
import "react-phone-input-2/lib/style.css";

const totalSteps = 6;

const SignUpPage = () => {
  const [step, setStep] = useState(1);
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
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const nextStep = () => {
    if (!userValidation()) return;
    setError("");
    setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const userValidation = () => {
    if (
      (step === 1 && !validateEmail(user.email)) ||
      (step === 2 && (!user.firstname || !user.lastname)) ||
      (step === 3 && !user.age) ||
      (step === 4 && !user.gender) ||
      (step === 5 && !isValidPassword(user.password)) ||
      (step === 6 && !user.phone)
    ) {
      setError("Please fill in all required fields correctly.");
      return false;
    }
    return true;
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (password) => password.length >= 6 && /\d/.test(password);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!userValidation()) return;

    setIsLoading(true);
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, user.email, user.password);
      await setDoc(doc(db, "userInfo", newUser.uid), { ...user, uid: newUser.uid });
      router.push("/find-ride");
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-md mx-auto">
      <ProgressBar step={step} />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <StepContent step={step} user={user} handleChange={handleChange} setUser={setUser} />
      <StepNavigation step={step} prevStep={prevStep} nextStep={nextStep} handleSignup={handleSignup} isLoading={isLoading} />
    </div>
  );
};

const ProgressBar = ({ step }) => (
  <div className="w-full bg-gray-300 h-2 rounded">
    <div className="bg-blue-500 h-2 rounded" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
  </div>
);

const StepContent = ({ step, user, handleChange, setUser }) => {
  const steps = {
    1: <InputField label="What is your email?" type="email" name="email" value={user.email} handleChange={handleChange} />, 
    2: (
      <>
        <InputField label="What is your first name?" type="text" name="firstname" value={user.firstname} handleChange={handleChange} />
        <InputField label="What is your last name?" type="text" name="lastname" value={user.lastname} handleChange={handleChange} />
      </>
    ),
    3: <InputField label="What is your age?" type="number" name="age" value={user.age} handleChange={handleChange} />, 
    4: (
      <select name="gender" value={user.gender} onChange={handleChange} className="border p-2 w-full">
        <option value="">Select</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
    ),
    5: <InputField label="Create password" type="password" name="password" value={user.password} handleChange={handleChange} />, 
    6: (
      <PhoneInput country="in" value={user.phone} onChange={(phone) => setUser({ ...user, phone })} containerClass="w-full" inputClass="border p-2 w-full" />
    )
  };
  return steps[step] || null;
};

const StepNavigation = ({ step, prevStep, nextStep, handleSignup, isLoading }) => (
  <div className="flex gap-4">
    {step > 1 && <Button onClick={prevStep} label="Back" color="gray" />}
    {step < totalSteps ? <Button onClick={nextStep} label="Next" color="blue" /> : <Button onClick={handleSignup} label={isLoading ? "Submitting..." : "Submit"} color="green" disabled={isLoading} />}
  </div>
);

const InputField = ({ label, type, name, value, handleChange }) => (
  <>
    <label className="text-lg font-semibold">{label}</label>
    <input type={type} name={name} value={value} onChange={handleChange} className="border p-2 w-full" required />
  </>
);

const Button = ({ onClick, label, color, disabled = false }) => (
  <button onClick={onClick} className={`bg-${color}-500 text-white px-4 py-2 rounded`} disabled={disabled}>{label}</button>
);

export default SignUpPage;
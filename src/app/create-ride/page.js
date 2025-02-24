"use client";
import { useState } from "react";
import { db, auth } from "@/config/firebase"; // Import auth
import { collection, addDoc } from "firebase/firestore";

export default function CreateRide() {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [seats, setSeats] = useState("");

  const handleCreateRide = async (e) => {
    e.preventDefault();

    if (!pickup || !drop || !date || !time || !seats) {
      alert("Please fill all fields!");
      return;
    }

    const user = auth.currentUser; // Get the logged-in user
    if (!user) {
      alert("User not logged in!");
      return;
    }

    try {
      await addDoc(collection(db, "availableRides"), {
        pickup,
        drop,
        date,
        time,
        seats: parseInt(seats),
        driverId: user.uid, // Store the driver's UID
      });

      alert("Ride created successfully!");
      setPickup("");
      setDrop("");
      setDate("");
      setTime("");
      setSeats("");
    } catch (error) {
      console.error("Error creating ride:", error);
      alert("Failed to create ride. Try again!");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Offer a Ride</h1>
      <form onSubmit={handleCreateRide} className="flex flex-col space-y-4">
        <input
          type="text"
          placeholder="Pickup Location"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Drop Location"
          value={drop}
          onChange={(e) => setDrop(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Available Seats"
          value={seats}
          onChange={(e) => setSeats(e.target.value)}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Create Ride
        </button>
      </form>
    </div>
  );
}



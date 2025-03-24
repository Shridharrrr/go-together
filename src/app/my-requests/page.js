"use client";

import { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const fetchRequests = async () => {
      try {
        const q = query(
          collection(db, "rideRequests"),
          where("requesterId", "==", currentUser.uid)
        );
        const requestDocs = await getDocs(q);
        setRequests(
          requestDocs.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
        );
      } catch (err) {
        console.error("Error fetching requests:", err);
      }
    };

    fetchRequests();
  }, [currentUser]);

  return (
    <div className="h-screen bg-slate-900 overflow-y-auto">
      <Navbar />
      <h2 className="text-3xl font-semibold text-white pl-4">My Requests :</h2>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.length > 0 ? (
          requests.map((req) => (
            <Card key={req.id} className="w-full bg-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <h4 className="font-bold text-white leading-5">
                    <span className="text-yellow-300">{req.pickup}</span> →{" "}
                    <span>{req.drop}</span>
                  </h4>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-md text-white">Date: {req.date}</p>
                <p className="text-md text-white">Time: {req.time}</p>
                <p className="text-md text-white">Driver: {req.driverName}</p>
                <p
                  className={`text-md ${
                    req.status === "Accepted"
                      ? "text-green-500"
                      : req.status === "Rejected"
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  Status: {req.status}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className=" text-gray-300">No ride requests found.</p>
        )}
      </div>
    </div>
  );
};

export default MyRequests;

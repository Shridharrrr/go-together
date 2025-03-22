"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User } from "lucide-react";
import {
  fetchAvailableRides,
  fetchUserInfo,
  requestRide,
  fetchUserRequests,
  saveRideRequest,
} from "@/services/firebaseService";
import Navbar from "@/components/Navbar";

const AvailableRides = () => {
  const [rideDetails, setRideDetails] = useState([]);
  const [userDetails, setUserDetails] = useState([]);
  const [showDriverInfo, setShowDriverInfo] = useState({});
  const [requestedRides, setRequestedRides] = useState({});
  const { currentUser } = useAuth();

  useEffect(() => {
    const getDetails = async () => {
      const rides = await fetchAvailableRides();
      const users = await fetchUserInfo();

      setRideDetails(rides);
      setUserDetails(users);
      setShowDriverInfo(
        Object.fromEntries(rides.map((ride) => [ride.id, false]))
      );

      if (currentUser) {
        const userRequests = await fetchUserRequests(currentUser.uid);
        const requestedMap = Object.fromEntries(
          userRequests.map((req) => [req.rideId, true])
        );
        setRequestedRides(requestedMap);
      }
    };

    getDetails();
  }, [currentUser]);

  const toggleDriverInfo = (rideId) => {
    setShowDriverInfo((prev) => ({ ...prev, [rideId]: !prev[rideId] }));
  };

  const handleRequestRide = async (ride) => {
    setRequestedRides((prev) => ({ ...prev, [ride.id]: true }));

    try {
      await requestRide(ride, currentUser, userDetails);
      await saveRideRequest(currentUser.uid, ride.id);
    } catch (error) {
      console.error("Ride request failed:", error);
      setRequestedRides((prev) => ({ ...prev, [ride.id]: false }));
    }
  };

  return (
    <div className="h-screen bg-slate-900 overflow-y-auto">
      <Navbar />
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rideDetails.map((ride) => {
          const driver = userDetails.find((user) => user.uid === ride.driverId);
          const isDriver = currentUser?.uid === ride.driverId;
          const isRequested = requestedRides[ride.id];

          return (
            <Card key={ride.id} className="w-full bg-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <h4 className="font-bold text-white leading-5">
                    <span className="text-yellow-300">{ride.from}</span> → <span>{ride.to}</span>
                  </h4>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!showDriverInfo[ride.id] ? (
                  <>
                    <p className="text-md text-white">Date: {ride.date}</p>
                    <p className="text-md text-white">Time: {ride.time}</p>
                    <p className="text-md text-white">
                      Seats Available: {ride.seats}
                    </p>
                    <p className="text-md text-white">
                        Charges : {ride.price} Rs
                      </p>
                    
                  </>
                ) : (
                  driver && (
                    <>
                      <p className="text-md text-white">Age: {driver.age}</p>
                      <p className="text-md text-white">
                        Gender: {driver.gender}
                      </p>
                      <p className="text-md text-white">
                        Contact No: {driver.phone}
                      </p>
                      <p className="text-md text-white">
                      Driver Name:{" "}
                      {driver
                        ? `${driver.firstname} ${driver.lastname}`
                        : "Unknown"}
                    </p>
                    </>
                  )
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <button
                  className={`
      px-4 py-3 rounded-full 
      ${
        isDriver
          ? "outline-indigo-500 bg-transparent outline-2 outline text-indigo-500" // Blue for "Your Ride"
          : isRequested
          ? "bg-gray-400 text-white cursor-not-allowed" // Gray for "Requested"
          : "bg-green-500 text-white hover:bg-green-600 active:bg-green-700" // Green for "Request Ride"
      }
    `}
                  onClick={() => handleRequestRide(ride)}
                  disabled={isRequested || isDriver || ride.seats <= 0}
                >
                  {isDriver
                    ? "Your Ride"
                    : isRequested
                    ? "Requested"
                    : "Request Ride"}
                </button>
                <button
                  className="bg-gray-200 px-4 py-3 rounded-full hover:bg-gray-300 flex items-center"
                  onClick={() => toggleDriverInfo(ride.id)}
                >
                  {showDriverInfo[ride.id] ? (
                    "Ride Info"
                  ) : (
                    <>
                      <User className="mr-2 h-4 w-4" /> Driver Info
                    </>
                  )}
                </button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AvailableRides;

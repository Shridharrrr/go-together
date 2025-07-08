"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User, CarFront } from "lucide-react";
import { 
  fetchAvailableRides, 
  fetchUserInfo, 
  requestRide, 
  fetchUserRequests, 
  saveRideRequest 
} from "@/services/firebaseService";
import Navbar from "@/components/Navbar";

const AvailableRides = () => {
  // State management
  const [rides, setRides] = useState([]);
  const [users, setUsers] = useState([]);
  const [expandedDriverCards, setExpandedDriverCards] = useState({});
  const [userRequests, setUserRequests] = useState({});
  const { currentUser } = useAuth();

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      const [availableRides, userData] = await Promise.all([
        fetchAvailableRides(),
        fetchUserInfo()
      ]);

      setRides(availableRides);
      setUsers(userData);
      
      // Initialize all cards to show ride info by default
      setExpandedDriverCards(
        Object.fromEntries(availableRides.map(ride => [ride.id, false]))
      );

      // Load user's ride requests if logged in
      if (currentUser) {
        const requests = await fetchUserRequests(currentUser.uid);
        setUserRequests(
          Object.fromEntries(requests.map(req => [req.rideId, true]))
        );
      }
    };

    loadData();
  }, [currentUser]);

  const toggleCardView = (rideId) => {
    setExpandedDriverCards(prev => ({ 
      ...prev, 
      [rideId]: !prev[rideId] 
    }));
  };

  const handleRideRequest = async (ride) => {
    // Optimistically update UI
    setUserRequests(prev => ({ ...prev, [ride.id]: true }));

    try {
      await requestRide(ride, currentUser, users);
      await saveRideRequest(currentUser.uid, ride.id);
    } catch (error) {
      console.error("Request failed:", error);
      // Revert UI if request fails
      setUserRequests(prev => ({ ...prev, [ride.id]: false }));
    }
  };

  // Helper function to get driver info
  const getDriver = (ride) => users.find(user => user.uid === ride.driverId);

  return (
    <div className="h-screen bg-slate-900 overflow-y-auto">
      <Navbar />
      
      <h2 className="text-3xl font-semibold text-white pl-6">All Rides:</h2>
      
      <div className="pl-6 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rides.map(ride => {
          const driver = getDriver(ride);
          const isCurrentUserDriver = currentUser?.uid === ride.driverId;
          const isAlreadyRequested = userRequests[ride.id];
          const showDriverDetails = expandedDriverCards[ride.id];

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
                {showDriverDetails ? (
                  // Driver information view
                  <>
                    <p className="text-md text-white">Driver: {driver?.firstname.charAt(0).toUpperCase() + driver?.firstname.slice(1)} {driver?.lastname.charAt(0).toUpperCase() + driver?.lastname.slice(1)}</p>
                    <p className="text-md text-white">Age: {driver?.age}</p>
                    <p className="text-md text-white">Gender: {driver?.gender}</p>
                    <p className="text-md text-white">Contact: {"+" + driver?.phone.slice(0,2) + " " + driver?.phone.slice(2)}</p>
                  </>
                ) : (
                  // Ride information view
                  <>
                    <p className="text-md text-white">Date: {ride.date}</p>
                    <p className="text-md text-white">Time: {ride.time}</p>
                    <p className="text-md text-white">Seats: {ride.seats}</p>
                    <p className="text-md text-white">Price: {ride.price} Rs</p>
                  </>
                )}
              </CardContent>

              <CardFooter className="flex justify-between">
                <button
                  className={`px-4 py-3 rounded-full ${
                    isCurrentUserDriver
                      ? "outline-indigo-500 bg-transparent outline-2 outline text-indigo-500"
                      : isAlreadyRequested
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-green-500 text-white hover:bg-green-600 active:bg-green-700"
                  }`}
                  onClick={() => handleRideRequest(ride)}
                  disabled={isAlreadyRequested || isCurrentUserDriver || ride.seats <= 0}
                >
                  {isCurrentUserDriver ? "Your Ride" : isAlreadyRequested ? "Requested" : "Request Ride"}
                </button>

                <button
                  className="bg-gray-200 px-4 py-3 rounded-full hover:bg-gray-300 flex items-center"
                  onClick={() => toggleCardView(ride.id)}
                >
                  {showDriverDetails ? (
                    <>
                      <CarFront className="mr-2 h-6 w-4" /> Ride Info
                    </>
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

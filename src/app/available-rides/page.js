"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, User } from "lucide-react";
import { fetchAvailableRides, fetchUserInfo, requestRide } from "@/services/firebaseService";

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
      setShowDriverInfo(Object.fromEntries(rides.map((ride) => [ride.id, false])));
    };

    getDetails();
  }, []);

  const toggleDriverInfo = (rideId) => {
    setShowDriverInfo((prev) => ({ ...prev, [rideId]: !prev[rideId] }));
  };

  const handleRequestRide = async (ride) => {
    setRequestedRides((prev) => ({ ...prev, [ride.id]: true })); // Disable button instantly

    try {
      await requestRide(ride, currentUser, userDetails);
    } catch (error) {
      console.error("Ride request failed:", error);
      setRequestedRides((prev) => ({ ...prev, [ride.id]: false })); // Re-enable button if error occurs
    }
  };

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rideDetails.map((ride) => {
        const driver = userDetails.find((user) => user.uid === ride.driverId);
        const isDriver = currentUser?.uid === ride.driverId;
        const isRequested = requestedRides[ride.id];

        return (
          <Card key={ride.id} className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{ride.from}</span>
                <ArrowRight className="mx-2" />
                <span>{ride.to}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showDriverInfo[ride.id] ? (
                <>
                  <p className="text-sm text-muted-foreground">Date: {ride.date}</p>
                  <p className="text-sm text-muted-foreground">Time: {ride.time}</p>
                  <p className="text-sm text-muted-foreground">Seats Available: {ride.seats}</p>
                  <p className="text-sm text-muted-foreground">
                    Driver: {driver ? `${driver.firstname} ${driver.lastname}` : "Unknown"}
                  </p>
                </>
              ) : (
                driver && (
                  <>
                    <p className="text-sm text-muted-foreground">Age: {driver.age}</p>
                    <p className="text-sm text-muted-foreground">Gender: {driver.gender}</p>
                    <p className="text-sm text-muted-foreground">Phone: {driver.phone}</p>
                  </>
                )
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="default" 
                onClick={() => handleRequestRide(ride)} 
                disabled={isRequested || isDriver}
              >
                {isDriver ? "Your Ride" : isRequested ? "Requested" : "Request Ride"}
              </Button>
              <Button variant="outline" onClick={() => toggleDriverInfo(ride.id)}>
                {showDriverInfo[ride.id] ? "Ride Info" : <><User className="mr-2 h-4 w-4" /> Driver Info</>}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default AvailableRides;




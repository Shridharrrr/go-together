"use client"

import { useEffect, useState } from "react"
import { db } from "@/config/firebase"
import { collection, getDocs, addDoc } from "firebase/firestore"
import { useAuth } from "@/context/AuthContext" // Assuming you have an Auth Context
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, User } from "lucide-react"

const AvailableRides = () => {
  const [rideDetails, setRideDetails] = useState([])
  const [userDetails, setUserDetails] = useState([])
  const [showDriverInfo, setShowDriverInfo] = useState({})
  const { currentUser } = useAuth() // Get logged-in user

  useEffect(() => {
    const getDetails = async () => {
      try {
        const rideData = await getDocs(collection(db, "availableRides"))
        const userData = await getDocs(collection(db, "userInfo"))

        const rides = rideData.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
        const users = userData.docs.map((doc) => ({ ...doc.data(), uid: doc.id }))

        setRideDetails(rides)
        setUserDetails(users)
        setShowDriverInfo(Object.fromEntries(rides.map((ride) => [ride.id, false])))
      } catch (err) {
        console.error("Error fetching data:", err)
      }
    }

    getDetails()
  }, [])

  const requestRide = async (ride) => {
    if (!currentUser) {
      alert("Please log in to request a ride.")
      return
    }

    const driver = userDetails.find((user) => user.uid === ride.driverId)

    if (!driver) {
      alert("Driver information not available.")
      return
    }

    try {
      await addDoc(collection(db, "rideRequests"), {
        requesterId: currentUser.uid,
        requesterName: currentUser.displayName || "Unknown",
        driverId: driver.uid,
        driverName: `${driver.firstname} ${driver.lastname}`,
        pickup: ride.from,
        drop: ride.to,
        date: ride.date,
        time: ride.time,
        status: "Pending" // Status can be "Accepted" or "Rejected"
      })

      alert("Ride request sent successfully!")
    } catch (err) {
      console.error("Error requesting ride:", err)
      alert("Failed to request ride.")
    }
  }

  const toggleDriverInfo = (rideId) => {
    setShowDriverInfo((prev) => ({ ...prev, [rideId]: !prev[rideId] }))
  }

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rideDetails.map((ride) => {
        const driver = userDetails.find((user) => user.uid === ride.driverId)

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
              <Button variant="default" onClick={() => requestRide(ride)}>Request Ride</Button>
              <Button variant="outline" onClick={() => toggleDriverInfo(ride.id)}>
                {showDriverInfo[ride.id] ? (
                  <>Ride Info</>
                ) : (
                  <>
                    <User className="mr-2 h-4 w-4" />
                    Driver Info
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

export default AvailableRides

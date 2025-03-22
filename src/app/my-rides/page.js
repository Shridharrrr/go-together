"use client"

import { useEffect, useState } from "react"
import { db } from "@/config/firebase"
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"

const MyRides = () => {
  const [rideRequests, setRideRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const { currentUser } = useAuth()

  useEffect(() => {
    if (!currentUser) return

    const fetchRideRequests = async () => {
      try {
        const q = query(collection(db, "rideRequests"), where("driverId", "==", currentUser.uid))
        const requestDocs = await getDocs(q)
        setRideRequests(requestDocs.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      } catch (err) {
        console.error("Error fetching ride requests:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRideRequests()
  }, [currentUser])
  
  const acceptRide = async (id, rideId) => {
    try {
     
      await updateDoc(doc(db, "rideRequests", id), { status: "Accepted" });
  
      const rideQuery = query(collection(db, "availableRides"), where("id", "==", rideId));
      const rideSnap = await getDocs(rideQuery); 
  
      if (!rideSnap.empty) {
       
        const rideDoc = rideSnap.docs[0]; 
  
        const rideRef = doc(db, "availableRides", rideDoc.id);
        const updatedSeats = rideDoc.data().seats - 1;
  
        await updateDoc(rideRef, { seats: updatedSeats });
      }
  
      setRideRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: "Accepted" } : req))
      );
    } catch (err) {
      console.error("Error accepting ride:", err);
    }
  };
  
  const rejectRide = async (id) => {
    try {
      await updateDoc(doc(db, "rideRequests", id), { status: "Rejected" });
  
      setRideRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: "Rejected" } : req))
      );
    } catch (err) {
      console.error("Error rejecting ride:", err);
    }
  };
  

  return (
    <div className="bg-slate-900 h-screen overflow-y-auto">
      <Navbar/>
      <h2 className="text-3xl font-semibold text-white pl-4">My Rides :</h2>
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {loading ? (
    
    <p className="text-center text-white">Loading ride requests...</p>
  ) : rideRequests.length > 0 ? (
    rideRequests.map((req) => (
      <Card key={req.id} className="w-full bg-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <h4 className="font-bold text-white leading-5">
              <span className="text-yellow-300">{req.pickup}</span> → <span>{req.drop}</span>
            </h4>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-md text-white">Date: {req.date}</p>
          <p className="text-md text-white">Time: {req.time}</p>
          <p className="text-md text-white">Requester: {req.requesterName}</p>
          <p className="text-md text-white">Status: {req.status}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          {req.status === "Pending" && (
            <>
              <button
                className="px-4 py-3 rounded-full bg-green-500 text-white hover:bg-green-600 active:bg-green-700"
                onClick={() => acceptRide(req.id, req.RideId)}
              >
                Accept
              </button>
              <button
                className="px-4 py-3 rounded-full bg-red-500 text-white hover:bg-red-600 active:bg-red-700"
                onClick={() => rejectRide(req.id)}
              >
                Reject
              </button>
            </>
          )}
        </CardFooter>
      </Card>
    ))
  ) : (
    <p className=" text-gray-300">No ride requests yet.</p>
  )}
</div>
</div>

  )
}

export default MyRides


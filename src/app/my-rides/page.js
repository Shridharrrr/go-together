"use client"

import { useEffect, useState } from "react"
import { db } from "@/config/firebase"
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const MyRides = () => {
  const [rideRequests, setRideRequests] = useState([])
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
      }
    }

    fetchRideRequests()
  }, [currentUser])

  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "rideRequests", id), { status })
      setRideRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status } : req))
      )
    } catch (err) {
      console.error("Error updating status:", err)
    }
  }

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rideRequests.length > 0 ? (
        rideRequests.map((req) => (
          <Card key={req.id} className="w-full">
            <CardHeader>
              <CardTitle>{req.pickup} → {req.drop}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Date: {req.date}</p>
              <p className="text-sm text-muted-foreground">Time: {req.time}</p>
              <p className="text-sm text-muted-foreground">Requester: {req.requesterName}</p>
              <p className="text-sm text-muted-foreground">Status: {req.status}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              {req.status === "Pending" && (
                <>
                  <Button variant="success" onClick={() => updateStatus(req.id, "Accepted")}>
                    Accept
                  </Button>
                  <Button variant="destructive" onClick={() => updateStatus(req.id, "Rejected")}>
                    Reject
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        ))
      ) : (
        <p className="text-center text-muted-foreground">No ride requests yet.</p>
      )}
    </div>
  )
}

export default MyRides;

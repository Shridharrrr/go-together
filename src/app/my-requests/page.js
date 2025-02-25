"use client"

import { useEffect, useState } from "react"
import { db } from "@/config/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const MyRequests = () => {
  const [requests, setRequests] = useState([])
  const { currentUser } = useAuth()

  useEffect(() => {
    if (!currentUser) return

    const fetchRequests = async () => {
      try {
        const q = query(collection(db, "rideRequests"), where("requesterId", "==", currentUser.uid))
        const requestDocs = await getDocs(q)
        setRequests(requestDocs.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      } catch (err) {
        console.error("Error fetching requests:", err)
      }
    }

    fetchRequests()
  }, [currentUser])

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {requests.length > 0 ? (
        requests.map((req) => (
          <Card key={req.id} className="w-full">
            <CardHeader>
              <CardTitle>{req.pickup} → {req.drop}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Date: {req.date}</p>
              <p className="text-sm text-muted-foreground">Time: {req.time}</p>
              <p className="text-sm text-muted-foreground">Driver: {req.driverName}</p>
              <p className="text-sm text-muted-foreground">Status: {req.status}</p>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-center text-muted-foreground">No ride requests found.</p>
      )}
    </div>
  )
}

export default MyRequests;

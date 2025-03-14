import { db, auth } from "@/config/firebase";
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

export const fetchUserInfo = async () => {
  try {
    const userData = await getDocs(collection(db, "userInfo"));
    return userData.docs.map((doc) => ({ ...doc.data(), uid: doc.id }));
  } catch (error) {
    console.error("Error fetching user info:", error);
    return [];
  }
};

export const fetchSuggestions = async (query, setSuggestions) => {
  if (query.length > 2) {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
    );
    const data = await res.json();
    setSuggestions(data);
  } else {
    setSuggestions([]);
  }
};

export const fetchRoute = async (fromPosition, toPosition) => {
  if (fromPosition && toPosition) {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${fromPosition[1]},${fromPosition[0]};${toPosition[1]},${toPosition[0]}?overview=full&geometries=geojson`
    );
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      return data.routes[0].geometry.coordinates.map(([lon, lat]) => [
        lat,
        lon,
      ]);
    }
  }
};

export const handleCreateRide = async (
  e,
  from,
  to,
  date,
  time,
  seats,
  fromPosition,
  toPosition,
  setFrom,
  setTo,
  setDate,
  setTime,
  setSeats,
  setFromPosition,
  setToPosition,
  setRouteCoords
) => {
  e.preventDefault();

  if (!from || !to || !date || !time || !seats) {
    alert("Please fill all fields!");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    alert("User not logged in!");
    return;
  }

  try {
    const userRef = collection(db, "userInfo");
    const userDoc = await getDoc(doc(userRef, user.uid));

    if (!userDoc.exists()) {
      alert("User info not found!");
      return;
    }

    const userInfo = userDoc.data();

    await addDoc(collection(db, "availableRides"), {
      from,
      to,
      date,
      time,
      seats: parseInt(seats),
      driverId: user.uid,
      fromCoords: fromPosition,
      toCoords: toPosition,
      driverName: `${userInfo.firstname} ${userInfo.lastname}`, // Fixed spacing
      driverPhone: userInfo.phone,
      driverGender: userInfo.gender,
      driverAge: userInfo.age,
    });

    alert("Ride created successfully!");

    setFrom("");
    setTo("");
    setDate("");
    setTime("");
    setSeats("");
    setFromPosition(null);
    setToPosition(null);
    setRouteCoords([]);
  } catch (error) {
    console.error("Error creating ride:", error);
    alert("Failed to create ride. Try again!");
  }
};

export const fetchAvailableRides = async () => {
  const ridesSnapshot = await getDocs(collection(db, "availableRides"));
  return ridesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const findMatchingRides = async (route) => {
  const rides = await fetchAvailableRides();

  return rides.filter((ride) =>
    route.some(
      (coord) =>
        Math.abs(coord[0] - ride.fromCoords[0]) < 0.05 &&
        Math.abs(coord[1] - ride.fromCoords[1]) < 0.05
    )
  );
};

export const requestRide = async (ride, user) => {
  if (!user) {
    return Promise.reject(new Error("Log in first to book the ride"));
  }

  if (ride.driverId === user.uid) {
    throw new Error("You cannot request your own ride");
  }

  try {
    await addDoc(collection(db, "rideRequests"), {
      driverId: ride.driverId,
      driverName: ride.driverName,
      requesterId: user.uid,
      requesterName: user.displayName || "Unknown",
      pickup: ride.from,
      drop: ride.to,
      date: ride.date,
      time: ride.time,
      status: "Pending",
    });

    alert("Ride request sent");
    return { success: true };
  } catch (error) {
    console.error("Error requesting ride:", error);
    alert("Failed to request ride. Please try again.");
    return { success: false, error };
  }
};


export const findRequestRide = async (ride, setRequestedRides) => {
  if (!currentUser) {
    alert("Please log in to request a ride.");
    return;
  }

  if (ride.driverId === currentUser.uid) {
    alert("You cannot request a ride from yourself.");
    return;
  }

  if (ride.availableSeats <= 0) {
    alert("This ride is already full.");
    return;
  }

  try {
    await addDoc(collection(db, "rideRequests"), {
      driverId: ride.driverId,
      driverName: ride.driverName,
      requesterId: currentUser.uid,
      requesterName: currentUser.displayName || "Unknown",
      pickup: ride.from,
      drop: ride.to,
      date: ride.date,
      time: ride.time,
      status: "Pending",
    });

    setRequestedRides((prev) => ({ ...prev, [ride.id]: true }));

    const rideRef = doc(db, "availableRides", ride.id);
    await updateDoc(rideRef, { seats: ride.seats - 1 });

    setAvailableRides((prevRides) =>
      prevRides.map((r) =>
        r.id === ride.id ? { ...r, seats: r.seats - 1 } : r
      )
    );

    alert("Ride request sent successfully!");
  } catch (err) {
    console.error("Error requesting ride:", err);
    alert("Failed to request ride.");
  }
};

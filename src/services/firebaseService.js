import { db, auth } from "@/config/firebase";
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  doc,
  updateDoc,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    const res = await fetch(`https://us1.locationiq.com/v1/search.php?key=pk.eed5afac263c470bcba317a30d5fd21e&q=${query}&format=json`);

    const data = await res.json();
    setSuggestions(data);
  } else {
    setSuggestions([]);
  }
};

export const fetchRouteFindRide = async (fromPosition, toPosition, setRouteCoords, fetchMatchingRides) => {
  if (fromPosition && toPosition) {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${fromPosition[1]},${fromPosition[0]};${toPosition[1]},${toPosition[0]}?overview=full&geometries=geojson`
    );
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const coords = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
      setRouteCoords(coords);
      fetchMatchingRides(coords);
    }
  }
};

export const fetchRouteCreateRide = async (fromPosition, toPosition, setRouteCoords, setDistance) => {
  if (fromPosition && toPosition) {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${fromPosition[1]},${fromPosition[0]};${toPosition[1]},${toPosition[0]}?overview=full&geometries=geojson`
    );
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const coords = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
      setRouteCoords(coords);
      setDistance(route.distance / 1000); 
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
  mileage,
  fromPosition,
  toPosition,
  distance,
  setFrom,
  setTo,
  setDate,
  setTime,
  setSeats,
  setMileage,
  setFromPosition,
  setToPosition,
  setRouteCoords
) => {
  e.preventDefault();

  if (!from || !to || !date || !time || !seats || !mileage) {
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

    const price = Math.round((((distance/mileage)*103.50)/seats),2);


    const docRef = await addDoc(collection(db, "availableRides"), {
      from,
      to,
      date,
      time,
      seats: parseInt(seats),
      mileage : parseInt(mileage),
      driverId: user.uid,
      fromCoords: fromPosition,
      toCoords: toPosition,
      driverName: `${userInfo.firstname} ${userInfo.lastname}`, 
      driverPhone: userInfo.phone,
      driverGender: userInfo.gender,
      driverAge: userInfo.age,
      id:"",
      price : price,
    });

    await updateDoc(docRef, { id: docRef.id });

    toast.success('Ride Created Successfully!', {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      progress: undefined,
      theme: "dark",
      transition: Bounce,
      });

    setFrom("");
    setTo("");
    setDate("");
    setTime("");
    setSeats("");
    setMileage("");
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
        Math.abs(coord[0] - ride.fromCoords[0]) < 0.08 &&
        Math.abs(coord[1] - ride.fromCoords[1]) < 0.08
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
      RideId: ride.id
    });

    alert("Ride request sent");
    return { success: true };
  } catch (error) {
    console.error("Error requesting ride:", error);
    alert("Failed to request ride. Please try again.");
    return { success: false, error };
  }
};

export const fetchUserRequests = async (userId) => {
  const q = query(collection(db, "rideRequests"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ rideId: doc.data().rideId }));
};

export const saveRideRequest = async (userId, rideId) => {
  const requestRef = doc(db, "rideRequests", `${userId}_${rideId}`);
  await setDoc(requestRef, { userId, rideId, status: "pending" });
};
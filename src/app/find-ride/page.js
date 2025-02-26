"use client";
import { useState, useEffect } from "react";
import { db } from "@/config/firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

const customMarkerIcon = new L.Icon({
  iconUrl: markerIconPng.src,
  shadowUrl: markerShadowPng.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function FindRide() {
  const { currentUser } = useAuth();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [fromPosition, setFromPosition] = useState(null);
  const [toPosition, setToPosition] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [availableRides, setAvailableRides] = useState([]);
  const [requestedRides, setRequestedRides] = useState({});

  const fetchSuggestions = async (query, setSuggestions) => {
    console.log(currentUser);
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

  const handleSelect = (place, setLocation, setPosition, setSuggestions) => {
    setLocation(place.display_name);
    setPosition([parseFloat(place.lat), parseFloat(place.lon)]);
    setSuggestions([]);
  };

  const fetchRoute = async () => {
    if (fromPosition && toPosition) {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${fromPosition[1]},${fromPosition[0]};${toPosition[1]},${toPosition[0]}?overview=full&geometries=geojson`
      );
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map(([lon, lat]) => [
          lat,
          lon,
        ]);
        setRouteCoords(coords);
        findMatchingRides(coords);
      }
    }
  };

  const findMatchingRides = async (route) => {
    const ridesSnapshot = await getDocs(collection(db, "availableRides"));
    const rides = ridesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const matchingRides = rides.filter((ride) => {
      return (
        ride.fromCoords &&
        ride.toCoords &&
        route.some((coord) => {
          return (
            Math.abs(coord[0] - ride.fromCoords[0]) < 0.05 &&
            Math.abs(coord[1] - ride.fromCoords[1]) < 0.05
          );
        })
      );
    });

    setAvailableRides(matchingRides);
  };

  const requestRide = async (ride) => {
    if (!currentUser) {
      alert("Please log in to request a ride.");
      return;
    }

    // Check if the current user is the driver of the ride
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

      // Disable button after requesting
      setRequestedRides((prev) => ({ ...prev, [ride.id]: true }));

      // Reduce available seats count
      const rideRef = doc(db, "availableRides", ride.id);
      await updateDoc(rideRef, { seats: ride.seats - 1 });

      // Update local state
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

  useEffect(() => {
    fetchRoute();
  }, [fromPosition, toPosition]);

  return (
    <div className="h-screen flex p-4">
      <div className="w-1/2 flex flex-col items-center p-4">
        <h2 className="text-xl font-bold mb-4">Find a Ride</h2>

        {/* From Input */}
        <div className="relative w-80">
          <input
            type="text"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              fetchSuggestions(e.target.value, setFromSuggestions);
            }}
            placeholder="From (Start Location)"
            className="p-2 border rounded w-full"
          />
          {fromSuggestions.length > 0 && (
            <ul className="border bg-white max-h-40 overflow-y-auto absolute z-10 w-full">
              {fromSuggestions.map((place) => (
                <li
                  key={place.place_id}
                  onClick={() =>
                    handleSelect(
                      place,
                      setFrom,
                      setFromPosition,
                      setFromSuggestions
                    )
                  }
                  className="p-2 hover:bg-gray-200 cursor-pointer"
                >
                  {place.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* To Input */}
        <div className="relative w-80 mt-4">
          <input
            type="text"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              fetchSuggestions(e.target.value, setToSuggestions);
            }}
            placeholder="To (Destination)"
            className="p-2 border rounded w-full"
          />
          {toSuggestions.length > 0 && (
            <ul className="border bg-white max-h-40 overflow-y-auto absolute z-10 w-full">
              {toSuggestions.map((place) => (
                <li
                  key={place.place_id}
                  onClick={() =>
                    handleSelect(place, setTo, setToPosition, setToSuggestions)
                  }
                  className="p-2 hover:bg-gray-200 cursor-pointer"
                >
                  {place.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Matching Rides */}
        <h3 className="mt-6 font-semibold">Matching Rides:</h3>
        <ul>
          {availableRides.length > 0 ? (
            availableRides.map((ride) => (
              <div key={ride.id} className="border p-4 rounded shadow-md mb-4">
                <h4 className="font-bold">
                  {ride.from} → {ride.to}
                </h4>
                <p>
                  Date: {ride.date} | Time: {ride.time}
                </p>
                <p>Seats Available: {ride.seats}</p>

                {/* Book Ride Button */}
                <button
                  onClick={() => requestRide(ride)}
                  className={`mt-2 px-4 py-2 rounded text-white ${
                    requestedRides[ride.id] ||
                    ride.seats <= 0 ||
                    ride.driverId === currentUser?.uid
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                  disabled={
                    requestedRides[ride.id] ||
                    ride.seats <= 0 ||
                    ride.driverId === currentUser?.uid
                  }
                >
                  {requestedRides[ride.id] ? "Request Sent" : "Book Ride"}
                </button>
              </div>
            ))
          ) : (
            <p>No matching rides found.</p>
          )}
        </ul>
      </div>
      <div className="w-1/2 h-full">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={6}
          className="w-full h-full rounded-lg border"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {fromPosition && (
            <Marker position={fromPosition} icon={customMarkerIcon} />
          )}
          {toPosition && (
            <Marker position={toPosition} icon={customMarkerIcon} />
          )}
          {routeCoords.length > 0 && (
            <Polyline positions={routeCoords} color="blue" />
          )}
        </MapContainer>
      </div>
    </div>
  );
}

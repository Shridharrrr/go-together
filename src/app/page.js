"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchAvailableRides,
  requestRide,
  fetchUserRequests,
  saveRideRequest,
} from "@/services/firebaseService";
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
  const [showMap, setShowMap] = useState(false);

  const fetchSuggestions = async (query, setSuggestions) => {
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

  const findMatchingRides = async () => {
    const matchingRides = await fetchAvailableRides();
    setAvailableRides(matchingRides);
  };

  const handleRequestRide = async (ride) => {
    try {
      await requestRide(ride, currentUser);
      await saveRideRequest(currentUser.uid, ride.id);
      setRequestedRides((prev) => ({ ...prev, [ride.id]: true }));
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchRoute();
  }, [fromPosition, toPosition]);

  useEffect(() => {
    const fetchRequestedRides = async () => {
      if (!currentUser) return;

      const userRequests = await fetchUserRequests(currentUser.uid);
      const requested = {};

      userRequests.forEach(({ rideId }) => {
        requested[rideId] = true; // Mark the ride as requested
      });

      setRequestedRides(requested);
    };

    fetchRequestedRides();
  }, [currentUser]);

  return (
    <div className="min-h-screen flex pb-4 px-4 bg-gray-900">
      <div className="w-full md:w-1/2 flex flex-col items-center p-4">
        <div className="mb-6 flex flex-col items-center justify-center w-full bg-slate-800 py-8 rounded-2xl border-indigo-500 border-2">
          <div className="flex  mb-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="50px"
              width="42px"
              className="text-[#4c3fff]"
              viewBox="0 -960 960 960"
              fill="#e3e3e3"
            >
              <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
            </svg>
            <h2 className="text-4xl font-bold text-white ml-1">
              Find Your Ride!
            </h2>
          </div>

          <div className="relative w-5/6">
            <input
              type="text"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                fetchSuggestions(e.target.value, setFromSuggestions);
              }}
              placeholder="Leaving From"
              className="p-2 border-2 rounded-full text-white w-full bg-gray-800 pl-3"
            />
            {fromSuggestions.length > 0 && (
              <ul className="border bg-slate-700 text-white max-h-40 overflow-y-auto absolute z-10 w-full">
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
                    className="p-2 hover:bg-slate-900 cursor-pointer"
                  >
                    {place.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative w-5/6 mt-4">
            <input
              type="text"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                fetchSuggestions(e.target.value, setToSuggestions);
              }}
              placeholder="Going To"
              className="p-2 border-2 rounded-full bg-gray-800 text-white w-full pl-3"
            />
            {toSuggestions.length > 0 && (
              <ul className="border bg-slate-700 text-white max-h-40 overflow-y-auto absolute z-10 w-full">
                {toSuggestions.map((place) => (
                  <li
                    key={place.place_id}
                    onClick={() =>
                      handleSelect(
                        place,
                        setTo,
                        setToPosition,
                        setToSuggestions
                      )
                    }
                    className="p-2 hover:bg-slate-900 cursor-pointer"
                  >
                    {place.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {from && to && (
          <div className="w-full ">
            
            {availableRides.length > 0 && (
              <>
                <h3 className="mt-4 mb-3 font-semibold text-3xl text-white">
                  Matching Rides:
                </h3>
                <ul>
                  {availableRides.map((ride) => (
                    <div
                      key={ride.id}
                      className="border p-4 rounded bg-gray-800 text-white shadow-md mb-4"
                    >
                      <h4 className="font-bold">
                        {ride.from} → {ride.to}
                      </h4>
                      <p>
                        Date: {ride.date} | Time: {ride.time}
                      </p>
                      <p>Seats Available: {ride.seats}</p>

                      <button
                        onClick={() => handleRequestRide(ride)}
                        className={`mt-2 px-4 py-2 rounded-full text-white ${
                          requestedRides[ride.id] ||
                          ride.seats <= 0 ||
                          ride.driverId === currentUser?.uid
                            ? "bg-gray-400"
                            : "bg-indigo-500 hover:bg-indigo-600"
                        }`}
                        disabled={
                          requestedRides[ride.id] ||
                          ride.seats <= 0 ||
                          ride.driverId === currentUser?.uid
                        }
                      >
                        {ride.driverId === currentUser?.uid
                          ? "Your Ride"
                          : requestedRides[ride.id]
                          ? "Request Sent"
                          : "Book Ride"}
                      </button>
                    </div>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>

      <div className="hidden w-1/2 h-[600px] md:flex flex-col justify-center p-4">
        <MapContainer
          center={[15.33, 74.05]}
          zoom={10}
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
      <button
        onClick={() => setShowMap(true)}
        className="fixed bottom-4 right-4 bg-indigo-500 text-white px-4 py-2 rounded-full md:hidden"
      >
        Show Map
      </button>

      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center z-50 items-center">
          <div className="z-20 w-3/4 h-3/4 md:w-1/2 md:h-[600px] relative">
            <MapContainer
              center={[15.33, 74.05]}
              zoom={9}
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
          <button
              onClick={() => setShowMap(false)}
              className="absolute z-30 top-8 right-16 bg-red-500 text-white px-4 py-2 rounded-full"
            >
              Close Map
            </button>
        </div>
      )}

      
    </div>
  );
}
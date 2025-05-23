"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  findMatchingRides,
  requestRide,
  fetchUserRequests,
  saveRideRequest,
  fetchSuggestions,
  fetchRouteFindRide,
  fetchUserInfo,
} from "@/services/firebaseService";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";
import Navbar from "@/components/Navbar";
import { User, CarFront } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState([]);
  const [expandedDriverCards, setExpandedDriverCards] = useState({});

  const handleSelect = (place, setLocation, setPosition, setSuggestions) => {
    setLocation(place.display_name);
    setPosition([parseFloat(place.lat), parseFloat(place.lon)]);
    setSuggestions([]);
  };

  const fetchMatchingRides = async (coords) => {
    setIsLoading(true);
    const matchingRides = await findMatchingRides(coords);
    setAvailableRides(matchingRides);
    setIsLoading(false);
  };

  const handleRequestRide = async (ride) => {
    try {
      setIsLoading(true);
      await requestRide(ride, currentUser);
      await saveRideRequest(currentUser.uid, ride.id);
      setRequestedRides((prev) => ({ ...prev, [ride.id]: true }));
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDriverInfo = (rideId) => {
    setExpandedDriverCards((prev) => ({ ...prev, [rideId]: !prev[rideId] }));
  };

  useEffect(() => {
    setIsLoading(true);
    fetchRouteFindRide(
      fromPosition,
      toPosition,
      setRouteCoords,
      fetchMatchingRides
    ).finally(() => setIsLoading(false));
  }, [fromPosition, toPosition]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Fetch user requests if logged in
        if (currentUser) {
          const userRequests = await fetchUserRequests(currentUser.uid);
          const requested = {};
          userRequests.forEach(({ rideId }) => {
            requested[rideId] = true;
          });
          setRequestedRides(requested);
        }

        // Fetch all user details for driver info
        const users = await fetchUserInfo();
        setUserDetails(users);

        // Initialize driver info toggles
        setExpandedDriverCards(
          Object.fromEntries(availableRides.map((ride) => [ride.id, false]))
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [currentUser, availableRides]);

  const getDriverInfo = (driverId) => {
    return userDetails.find((user) => user.uid === driverId);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="flex pb-4 px-4 ">
        <div className="w-full md:w-1/2 flex flex-col items-center ">
          <div className="mb-6 flex flex-col h-[300px] items-center justify-center border-2 border-dashed w-full lg:w-5/6 bg-slate-800 py-8 rounded-xl ">
            <div className="flex  mb-5">
              <h2 className="text-4xl lg:text-5xl  font-bold text-white ml-1">
                Find a ride!
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
                placeholder="⚲ Leaving From"
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
                placeholder="⚲ Going To"
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

          {isLoading ? (
            <div role="status">
              <svg
                aria-hidden="true"
                className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-indigo-500 mt-12"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
            </div>
          ) : (
            from &&
            to && (
              <div className="w-full ">
                {availableRides.length > 0 && (
                  <>
                    <h3 className="mt-4 mb-3 font-semibold text-3xl text-white">
                      Matching Rides:
                    </h3>
                    <ul>
                      {availableRides.map((ride) => {
                        const driver = getDriverInfo(ride.driverId);
                        const showDriverInfo = expandedDriverCards[ride.id];

                        return (
                          <div
                            key={ride.id}
                            className="border-2 border-indigo-500 border-dashed p-6 rounded-xl bg-gray-800 text-white shadow-md mb-4"
                          >
                            {!showDriverInfo ? (
                              <>
                                <h4 className="font-bold">
                                  <span className="text-yellow-300">
                                    {ride.from}
                                  </span>{" "}
                                  → <span>{ride.to}</span>
                                </h4>
                                <p>Date: {ride.date}</p>
                                <p>Time: {ride.time}</p>
                                <p>Seats Available: {ride.seats}</p>
                                <p>Price: {ride.price} Rs</p>
                              </>
                            ) : (
                              driver && (
                                <>
                                  <h4 className="font-bold">
                                    <span className="text-yellow-300">
                                      {ride.from}
                                    </span>{" "}
                                    → <span>{ride.to}</span>
                                  </h4>
                                  <p>
                                    Driver: {driver.firstname} {driver.lastname}
                                  </p>
                                  <p>Age: {driver.age}</p>
                                  <p>Gender: {driver.gender}</p>
                                  <p>Contact: {driver.phone}</p>
                                </>
                              )
                            )}

                            <div className="flex justify-between mt-3">
                              <button
                                onClick={() => handleRequestRide(ride)}
                                className={`relative group w-[120px] text-white p-2 rounded-xl transition-all overflow-hidden ${
                                  requestedRides[ride.id] ||
                                  ride.seats <= 0 ||
                                  ride.driverId === currentUser?.uid
                                    ? "bg-gray-400"
                                    : "bg-green-500 hover:bg-green-600 active:bg-green-700"
                                }`}
                                disabled={
                                  requestedRides[ride.id] ||
                                  ride.seats <= 0 ||
                                  ride.driverId === currentUser?.uid
                                }
                              >
                                <span className="group-hover:opacity-0 transition-opacity duration-300">
                                  {ride.driverId === currentUser?.uid
                                    ? "Your Ride"
                                    : requestedRides[ride.id]
                                    ? "Request Sent"
                                    : "Book Ride"}
                                </span>
                                <span className="absolute inset-0 flex items-center text-2xl mb-1 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  ✓
                                </span>
                              </button>

                              <button
                                onClick={() => toggleDriverInfo(ride.id)}
                                className="bg-gray-200 px-4 py-2 rounded-full hover:bg-gray-300 flex items-center text-black"
                              >
                                {showDriverInfo ? (
                                  <>
                                    <CarFront className="mr-2 h-6 w-4" /> Ride
                                    Info
                                  </>
                                ) : (
                                  <>
                                    <User className="mr-2 h-4 w-4" /> Driver
                                    Info
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </ul>
                  </>
                )}
              </div>
            )
          )}
        </div>

        <div className="hidden w-full lg:w-1/2 h-[560px] z-10 lg:flex flex-col items-center justify-center">
          <MapContainer
            center={[15.33, 74.05]}
            zoom={10}
            className="w-5/6 h-full rounded-lg border"
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
    </div>
  );
}

"use client";
import { useState, useEffect, useCallback } from "react";
import {
  fetchSuggestions,
  fetchRouteCreateRide,
  handleCreateRide,
} from "@/services/firebaseService";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";
import { debounce } from "lodash";
import Navbar from "@/components/Navbar";
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const customMarkerIcon = new L.Icon({
  iconUrl: markerIconPng.src,
  shadowUrl: markerShadowPng.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function CreateRide() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [seats, setSeats] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [fromPosition, setFromPosition] = useState(null);
  const [toPosition, setToPosition] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [distance, setDistance] = useState(0);

  const handleSelect = (place, setLocation, setPosition, setSuggestions) => {
    setLocation(place.display_name);
    setPosition([parseFloat(place.lat), parseFloat(place.lon)]);
    setSuggestions([]);
  };

  const debouncedFetchTo = useCallback(
    debounce((query) => fetchSuggestions(query, setToSuggestions), 1000),
    [setToSuggestions]
  );

  const debouncedFetchFrom = useCallback(
    debounce((query) => fetchSuggestions(query, setFromSuggestions), 1000),
    [setFromSuggestions]
  );

  useEffect(() => {
    if (fromPosition && toPosition) {
      const getRoute = async () => {
        try {
          await fetchRouteCreateRide(
            fromPosition,
            toPosition,
            setRouteCoords,
            setDistance
          );
        } catch (error) {
          console.error("Error fetching route:", error);
        }
      };
      getRoute();
    }
  }, [fromPosition, toPosition]);

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      <div className="flex flex-col lg:flex-row pb-4 px-4">
        <div className="w-full lg:w-1/2 flex flex-col items-center p-4">
          <div className="mb-6 flex flex-col items-center justify-center h-full w-full lg:w-5/6 bg-slate-800 py-8 rounded-2xl border-dashed border-2">
            <div className="flex mb-5">
              <h2 className="text-4xl lg:text-5xl font-bold text-white ml-1">
                Create A Ride!
              </h2>
            </div>
            <form
              onSubmit={(e) =>
                handleCreateRide(
                  e,
                  from,
                  to,
                  date,
                  time,
                  seats,
                  fromPosition,
                  toPosition,
                  distance,
                  setFrom,
                  setTo,
                  setDate,
                  setTime,
                  setSeats,
                  setFromPosition,
                  setToPosition,
                  setRouteCoords
                )
              }
              className="flex flex-col space-y-4 w-5/6 lg:w-[450px]"
            >
              <div className="relative">
                <input
                  type="text"
                  value={from}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    debouncedFetchFrom(e.target.value);
                  }}
                  placeholder="⚲ Leaving From"
                  className="p-2 border-2 rounded-full text-white w-full bg-gray-800 pl-4"
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

              <div className="relative">
                <input
                  type="text"
                  value={to}
                  onChange={(e) => {
                    setTo(e.target.value);
                    debouncedFetchTo(e.target.value);
                  }}
                  placeholder="⚲ Going To"
                  className="p-2 border-2 rounded-full text-white w-full bg-gray-800 pl-4"
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

              <input
                type="date"
                value={date}
                placeholder="Date"
                onChange={(e) => setDate(e.target.value)}
                className="p-2 border-2 rounded-full bg-gray-800 text-white w-full pl-4"
              />

              <input
                type="time"
                placeholder="Time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="p-2 border-2 rounded-full bg-gray-800 text-white w-full pl-4"
              />

              <input
                type="number"
                placeholder="Available Seats"
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                className="p-2 border-2 rounded-full bg-gray-800 text-white w-full pl-4"
              />

              <button
                type="submit"
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-full mt-4"
              >
                Create Ride
              </button>
            </form>
          </div>
        </div>

        {/* Map Section */}
        <div className="hidden w-full lg:w-1/2 h-[560px] z-10 lg:flex flex-col justify-center p-4">
          <MapContainer
            center={[15.33, 74.05]}
            zoom={10}
            className="w-full h-full rounded-lg border"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {fromPosition && (
              <Marker position={fromPosition} icon={customMarkerIcon}>
                <Popup>Start Location</Popup>
              </Marker>
            )}
            {toPosition && (
              <Marker position={toPosition} icon={customMarkerIcon}>
                <Popup>Destination</Popup>
              </Marker>
            )}
            {routeCoords.length > 0 && (
              <Polyline positions={routeCoords} color="blue" />
            )}
          </MapContainer>
        </div>

        {/* Show Map Button for Mobile */}
        <button
          onClick={() => setShowMap(true)}
          className="fixed bottom-4 right-4 bg-indigo-500 text-white px-4 py-2 rounded-full lg:hidden"
        >
          Show Map
        </button>

        {/* Map Overlay for Mobile */}
        {showMap && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center">
            <div className="z-20 w-3/4 h-3/4 lg:w-1/2 lg:h-[560px] relative">
              <MapContainer
                center={[15.33, 74.05]}
                zoom={10}
                className="w-full h-full rounded-lg border"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {fromPosition && (
                  <Marker position={fromPosition} icon={customMarkerIcon}>
                    <Popup>Start Location</Popup>
                  </Marker>
                )}
                {toPosition && (
                  <Marker position={toPosition} icon={customMarkerIcon}>
                    <Popup>Destination</Popup>
                  </Marker>
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

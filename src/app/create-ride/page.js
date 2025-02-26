"use client";
import { useState, useEffect } from "react";
import { fetchSuggestions, fetchRoute, handleCreateRide } from "@/services/firebaseService";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
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

  const handleSelect = (place, setLocation, setPosition, setSuggestions) => {
    setLocation(place.display_name);
    setPosition([parseFloat(place.lat), parseFloat(place.lon)]);
    setSuggestions([]);
  };

  useEffect(() => {
    if (fromPosition && toPosition) {
      const getRoute = async () => {
        try {
          const route = await fetchRoute(fromPosition, toPosition);
          setRouteCoords(route);
        } catch (error) {
          console.error("Error fetching route:", error);
        }
      };
      getRoute();
    }
  }, [fromPosition, toPosition]);

  return (
    <div className="h-screen flex p-4">
      <div className="w-1/2 flex flex-col items-center p-4">
        <h2 className="text-xl font-bold mb-4">Create a Ride</h2>
        <form onSubmit={(e) => handleCreateRide(
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
    )} className="flex flex-col space-y-4 w-80">
          <div className="relative">
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
                    onClick={() => handleSelect(place, setFrom, setFromPosition, setFromSuggestions)}
                    className="p-2 hover:bg-gray-200 cursor-pointer"
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
                    onClick={() => handleSelect(place, setTo, setToPosition, setToSuggestions)}
                    className="p-2 hover:bg-gray-200 cursor-pointer"
                  >
                    {place.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="p-2 border rounded" />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="p-2 border rounded" />
          <input
            type="number"
            placeholder="Available Seats"
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            className="p-2 border rounded"
          />

          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Create Ride
          </button>
        </form>
      </div>
      <div className="w-1/2 h-full">
        <MapContainer center={[20.5937, 78.9629]} zoom={6} className="w-full h-full rounded-lg border">
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
          {routeCoords.length > 0 && <Polyline positions={routeCoords} color="blue" />}
        </MapContainer>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import {
  fetchSuggestions,
  fetchRoute,
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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
    <div className="min-h-screen flex pb-4 px-4 bg-gray-900">
      <div className="w-1/2 flex flex-col items-center p-4">
        <div className="mb-6 flex flex-col items-center justify-center w-full bg-slate-800 py-8 rounded-2xl border-indigo-500 border-2">
          <div className="flex  mb-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="55px"
              viewBox="0 -960 960 960"
              width="48px"
              fill="#e3e3e3"
            >
              <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
            </svg>
            <h2 className="text-5xl font-bold text-white ml-1">
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
            className="flex flex-col space-y-4 w-[450px]"
          >
            <div className="relative">
              <input
                type="text"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  fetchSuggestions(e.target.value, setFromSuggestions);
                }}
                placeholder="Leaving From"
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
                  fetchSuggestions(e.target.value, setToSuggestions);
                }}
                placeholder="Going To"
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

            <DatePicker
              selected={date}
              onChange={(newDate) => setDate(newDate)}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select Date"
              className="p-2 border-2 rounded-full bg-gray-800 text-white w-full pl-4"
            />

            <DatePicker
              selected={time}
              onChange={(newTime) => setTime(newTime)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeFormat="HH:mm"
              dateFormat="HH:mm"
              placeholderText="Select Time"
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
      <div className="w-1/2 h-[600px] z-10 flex flex-col justify-center p-4">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={6}
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
    </div>
  );
}

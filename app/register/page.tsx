"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = "donor" | "receiver";

export default function AuthPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role>("donor");
  const [orgName, setOrgName] = useState("");
  const [address, setAddress] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationString = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setAddress(locationString);
        setLoadingLocation(false);
      },
      () => {
        alert("Unable to retrieve location.");
        setLoadingLocation(false);
      }
    );
  };

  const handleContinue = () => {
    if (!orgName.trim() || !address.trim()) {
      alert("Please enter organization name and address.");
      return;
    }

    localStorage.setItem("role", role);
    localStorage.setItem("orgName", orgName);
    localStorage.setItem("address", address);

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">

      {/* 🔥 Hero Section */}
      <div className="text-center mb-14">
        <h1 className="text-5xl font-extrabold tracking-tight text-white">
          Re<span className="text-green-500">Serve</span>
        </h1>

        <p className="text-neutral-400 mt-4 max-w-md mx-auto text-lg">
          Connecting surplus food to communities in need.
        </p>
      </div>

      {/* 🔥 Glass Card */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">

        <h2 className="text-white text-xl font-semibold text-center mb-8">
          Organization Access
        </h2>

        <input
          type="text"
          placeholder="Organization Name"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          className="w-full p-3 bg-white/10 text-white placeholder-neutral-400 rounded-2xl mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <div className="space-y-3 mb-4">
          <input
            type="text"
            placeholder="Organization Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-3 bg-white/10 text-white placeholder-neutral-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <button
            onClick={getLocation}
            className="w-full py-2 text-sm bg-white/10 text-neutral-300 rounded-2xl hover:bg-white/20 transition"
          >
            {loadingLocation ? "Detecting Location..." : "📍 Use Current Location"}
          </button>
        </div>

        <select
          className="w-full p-3 bg-white/10 text-white rounded-2xl mb-6 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        >
          <option value="donor" className="text-black">Donor</option>
          <option value="receiver" className="text-black">Receiver</option>
        </select>

        <button
          onClick={handleContinue}
          className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-semibold hover:scale-[1.02] active:scale-[0.98] transition transform"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
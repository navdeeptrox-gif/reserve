"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FoodMap from "@/components/FoodMap";

type Role = "donor" | "receiver";

type FoodPost = {
  id: number;
  foodName: string;
  quantity: string;
  address: string;
  distance?: number;
  status: "available" | "accepted";
  createdAt: number;
};

export default function DashboardPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role | null>(null);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [orgAddress, setOrgAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<FoodPost[]>([]);

  const [newFood, setNewFood] = useState("");
  const [newQuantity, setNewQuantity] = useState("");

  /* ------------------ DISTANCE ------------------ */
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  /* ------------------ GENERATE RECEIVER POSTS ------------------ */
  const generateNearbyPosts = (baseLat: number, baseLng: number) => {
    const randomOffset = () => (Math.random() - 0.5) * 0.02;

    const foods = [
      "Cooked Rice & Curry",
      "Chapati & Sabzi",
      "Wedding Buffet Surplus",
    ];

    return foods.map((food, index) => {
      const lat = baseLat + randomOffset();
      const lng = baseLng + randomOffset();

      return {
        id: Date.now() + index,
        foodName: food,
        quantity: `${Math.floor(Math.random() * 80) + 20} meals`,
        address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        distance: calculateDistance(baseLat, baseLng, lat, lng),
        status: "available" as const,
        createdAt: Date.now(),
      };
    });
  };

  /* ------------------ INIT ------------------ */
  useEffect(() => {
    const savedRole = localStorage.getItem("role") as Role | null;
    const savedOrg = localStorage.getItem("orgName");
    const savedAddress = localStorage.getItem("address");

    if (!savedRole || !savedOrg || !savedAddress) {
      router.replace("/register");
      return;
    }

    setRole(savedRole);
    setOrgName(savedOrg);
    setOrgAddress(savedAddress);

    if (savedRole === "receiver") {
      const [latStr, lngStr] = savedAddress.split(",");
      const baseLat = parseFloat(latStr);
      const baseLng = parseFloat(lngStr);

      if (!isNaN(baseLat) && !isNaN(baseLng)) {
        setPosts(generateNearbyPosts(baseLat, baseLng));
      }
    }

    setLoading(false);
  }, [router]);

  const logout = () => {
    localStorage.clear();
    router.replace("/register");
  };

  /* ------------------ RECEIVER ACTION ------------------ */
  const acceptFood = (id: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id ? { ...post, status: "accepted" } : post
      )
    );
  };

  /* ------------------ DONOR POST ------------------ */
  const addPost = () => {
    if (!newFood || !newQuantity || !orgAddress) return;

    const newPost: FoodPost = {
      id: Date.now(),
      foodName: newFood,
      quantity: newQuantity,
      address: orgAddress,
      status: "available",
      createdAt: Date.now(),
    };

    setPosts((prev) => [newPost, ...prev]);
    setNewFood("");
    setNewQuantity("");
  };

  const getTimeAgo = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hrs ago`;
  };

  if (loading || !role || !orgName) return null;

  return (
    <div className="min-h-screen bg-[#0E0E11] text-white">

      {/* HEADER */}
      <div className="border-b border-white/10 backdrop-blur-md bg-black/40 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              Re<span className="text-green-400">Serve</span>
            </h1>
            <p className="text-xs text-neutral-400">{orgName}</p>
          </div>

          <div className="flex items-center gap-5">
            <span className="text-xs uppercase tracking-wider text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
              {role}
            </span>

            <button
              onClick={logout}
              className="text-sm text-neutral-400 hover:text-white transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">

        {/* ---------------- RECEIVER ---------------- */}
        {role === "receiver" && (
          <section>
            <h2 className="text-3xl font-bold mb-10">
              Donations Near You
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-[#15151A] rounded-3xl p-6 border border-white/5 hover:border-green-400/40 transition"
                >
                  <div className="flex justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {post.foodName}
                      </h3>
                      <p className="text-sm text-neutral-400">
                        {post.quantity}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {getTimeAgo(post.createdAt)}
                      </p>
                    </div>

                    <span className="text-xs bg-green-400/10 text-green-400 px-3 py-1 rounded-full">
                      {post.distance?.toFixed(1)} km
                    </span>
                  </div>

                  <div className="rounded-2xl overflow-hidden mb-5">
                    <FoodMap address={post.address} />
                  </div>

                  {post.status === "available" ? (
                    <button
                      onClick={() => acceptFood(post.id)}
                      className="w-full py-3 bg-green-500 hover:bg-green-400 text-black rounded-2xl font-semibold transition hover:scale-[1.02]"
                    >
                      Accept Donation
                    </button>
                  ) : (
                    <div className="w-full py-3 bg-green-600 rounded-2xl text-center font-semibold">
                      Accepted ✓
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ---------------- DONOR ---------------- */}
        {role === "donor" && (
          <section className="space-y-12">

            <h2 className="text-3xl font-bold">
              Operations Dashboard
            </h2>

            {/* Post Card */}
            <div className="bg-[#15151A] rounded-3xl p-8 border border-white/5 space-y-5">
              <input
                type="text"
                placeholder="Food Name"
                value={newFood}
                onChange={(e) => setNewFood(e.target.value)}
                className="w-full bg-black/40 p-3 rounded-2xl text-white placeholder-neutral-500 focus:ring-2 focus:ring-green-400"
              />

              <input
                type="text"
                placeholder="Quantity"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                className="w-full bg-black/40 p-3 rounded-2xl text-white placeholder-neutral-500 focus:ring-2 focus:ring-green-400"
              />

              <button
                onClick={addPost}
                className="w-full py-3 bg-green-500 hover:bg-green-400 text-black rounded-2xl font-semibold transition hover:scale-[1.02]"
              >
                Publish Donation
              </button>
            </div>

            {/* Live Posts */}
            <div>
              <h3 className="text-xl font-semibold mb-6">
                Active Donations
              </h3>

              <div className="grid md:grid-cols-2 gap-8">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-[#15151A] rounded-3xl p-6 border border-white/5"
                  >
                    <div className="flex justify-between">
                      <div>
                        <h4 className="text-lg font-semibold">
                          {post.foodName}
                        </h4>
                        <p className="text-sm text-neutral-400">
                          {post.quantity}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          Posted {getTimeAgo(post.createdAt)}
                        </p>
                      </div>

                      <span
                        className={`text-xs px-3 py-1 rounded-full ${
                          post.status === "available"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </section>
        )}
      </div>
    </div>
  );
}
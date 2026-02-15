import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { CartContext } from "./CartProvider";
import { formatDate } from "../utils/dateUtils";

import { Package } from "lucide-react";

function OrderDetails() {
  const { user: contextUser } = useContext(CartContext);
  const [user, setUser] = useState(contextUser || null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    if (!contextUser) {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) setUser(storedUser);
    }
  }, [contextUser]);

  useEffect(() => {
    if (!user?.token) return;

    setLoading(true);
    const config = {
      headers: { Authorization: `Bearer ${user.token}` }
    };

    axios
      .get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/orders`, config)
      .then((res) => {
        // Handle both simple array and paginated object responses
        if (res.data.orders && Array.isArray(res.data.orders)) {
          setOrders(res.data.orders);
        } else if (Array.isArray(res.data)) {
          setOrders(res.data);
        } else {
          setOrders([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Orders Load Error:", err);
        setError("❌ Failed to load orders");
        setLoading(false);
      });
  }, [user]);

  if (!user)
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center text-xl">
        ⚠️ Please login to view your orders
      </div>
    );

  if (loading)
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center text-xl">
        Loading your orders...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-black text-red-500 flex justify-center items-center text-xl">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-black py-20 px-4">
      <h1 className="text-4xl font-extrabold text-center text-[#8dc53e] mb-10 flex items-center justify-center gap-3">
        My Orders <Package className="w-8 h-8 text-[#00b2fe]" />
      </h1>

      {orders.length === 0 ? (
        <p className="text-center text-gray-400 text-lg">No orders found.</p>
      ) : (
        <div className="max-w-5xl mx-auto grid gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-[#1a1a1a] p-6 rounded-2xl shadow-lg border border-gray-800 hover:shadow-[#00b2fe60] transition-all"
            >
              <div className="flex justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Order #{order.id}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Placed on {formatDate(order.date)}
                  </p>
                  <p
                    className={`text-sm font-medium mt-1 ${order.status === "Delivered"
                      ? "text-green-400"
                      : order.status === "Processing"
                        ? "text-yellow-400"
                        : order.status === "Shipped"
                          ? "text-blue-400"
                          : order.status === "Cancelled"
                            ? "text-red-500"
                            : "text-gray-300"
                      }`}
                  >
                    Status: {order.status}
                  </p>

                </div>
              </div>

              <div className="mt-4 border-t border-gray-700 pt-4 grid gap-4">
                {order.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4 bg-[#111] p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          item.image?.match(/^(http|data:)/)
                            ? item.image
                            : `/${item.image?.replace(/^\/+/, "") || ""}`
                        }
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />

                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-gray-400 text-sm">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="text-[#8dc53e] font-semibold">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderDetails;

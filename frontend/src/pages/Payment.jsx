import { useLocation, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { CartContext } from "./CartProvider";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

function Payment() {
  const { cart, clearCart, user } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalAmount = 0, address, city, state: region, pincode, name: customerName, phone } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState("Online Payment");
  const [loading, setLoading] = useState(false);

  const handleRazorpayPayment = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      };

      // 1. Create Razorpay Order on the backend
      const { data: razorpayOrder } = await axios.post(
        `${API_URL}/orders/razorpay`,
        { amount: totalAmount },
        config
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Refuel Energy Drink",
        description: "Order Payment",
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            // 2. Verify Payment on the backend
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };

            const { data: verificationResult } = await axios.post(
              `${API_URL}/orders/verify`,
              verifyData,
              config
            );

            if (verificationResult.success) {
              // 3. Create actual order in database
              const orderData = {
                items: cart,
                totalAmount,
                shippingAddress: {
                  address,
                  city,
                  state: region,
                  postalCode: pincode,
                  country: "India",
                },
                paymentMethod: "Online (Razorpay)",
                paymentDetails: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                },
              };

              await axios.post(`${API_URL}/orders`, orderData, config);

              alert(`✅ Payment of ₹${totalAmount.toFixed(2)} successful!`);
              clearCart();
              navigate("/orders");
            } else {
              alert("❌ Payment verification failed!");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("❌ Error verifying payment!");
          }
        },
        prefill: {
          name: customerName || user?.name || "",
          email: user?.email || "",
          contact: phone || user?.number || "",
        },
        theme: {
          color: "#00b2fe",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", function (response) {
        alert("❌ Payment Failed: " + response.error.description);
      });
      rzp1.open();
    } catch (error) {
      console.error("Razorpay error full object:", error);
      console.error("Razorpay error details:", error.response?.data);
      const errorMsg = error.response?.data?.message || "Failed to initiate payment!";
      const details = error.response?.data?.details ? `\n\nDetails: ${error.response.data.details}` : "";
      alert(`❌ ${errorMsg}${details}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCashOnDelivery = async () => {
    setLoading(true);
    const newOrder = {
      items: cart,
      totalAmount,
      shippingAddress: {
        address,
        city,
        state: region,
        postalCode: pincode,
        country: "India"
      },
      paymentMethod: "Cash on Delivery",
      paymentDetails: { status: "Pending" },
    };

    const config = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };

    try {
      await axios.post(`${API_URL}/orders`, newOrder, config);
      alert(`✅ Order placed! Payment of ₹${totalAmount.toFixed(2)} due on delivery.`);
      clearCart();
      navigate("/orders");
    } catch (error) {
      console.error("❌ Error saving order:", error);
      alert(`❌ ${error.response?.data?.message || "Failed to save order!"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!paymentMethod) {
      alert("⚠️ Please select a payment method!");
      return;
    }

    if (paymentMethod === "Online Payment") {
      handleRazorpayPayment();
    } else if (paymentMethod === "Cash on Delivery") {
      handleCashOnDelivery();
    } else {
      alert("⚠️ Selected payment method is currently unavailable.");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-20 px-4">
      <div className="bg-[#111] p-8 rounded-2xl shadow-xl max-w-md w-full text-white border border-[#00b2fe]">
        <h2 className="text-3xl font-bold text-center mb-6 text-[#00b2fe]">
          Checkout 💳
        </h2>

        <p className="text-center text-lg mb-6">
          Total Amount:{" "}
          <span className="text-green-400 font-semibold">
            ₹{totalAmount.toFixed(2)}
          </span>
        </p>

        <div className="space-y-4 mb-8">
          {[
            { id: "Online Payment", label: "Online Payment (Razorpay)", icon: "🌐" },
            { id: "Cash on Delivery", label: "Cash on Delivery", icon: "💵" },
          ].map((method) => (
            <label
              key={method.id}
              className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-200 ${paymentMethod === method.id
                ? "border-[#00b2fe] bg-[#1a1a1a] shadow-[0_0_15px_rgba(0,178,254,0.2)]"
                : "border-gray-700 hover:border-gray-500"
                }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={paymentMethod === method.id}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-5 h-5 accent-[#00b2fe]"
              />
              <span className="text-xl">{method.icon}</span>
              <span className="font-medium">{method.label}</span>
            </label>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-4 bg-[#00b2fe] hover:bg-[#0090d1] text-white font-bold rounded-xl transition-all duration-200 transform active:scale-95 flex items-center justify-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              {paymentMethod === "Online Payment" ? "Pay Now" : "Confirm Order"} &nbsp; ₹{totalAmount.toFixed(2)}
            </>
          )}
        </button>

        <p className="mt-6 text-center text-xs text-gray-500">
          Secure payment powered by Razorpay
        </p>
      </div>
    </div>
  );
}

export default Payment;

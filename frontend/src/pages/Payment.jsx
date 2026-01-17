import { useLocation, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { CartContext } from "./CartProvider";
import axios from "axios";

function Payment() {
  const { cart, clearCart, user } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();
  const totalAmount = location.state?.totalAmount || 0;

  const [paymentMethod, setPaymentMethod] = useState("");
  const [onlineOption, setOnlineOption] = useState("card");
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    upiId: "",
    bank: "",
    emiOption: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!paymentMethod) {
      alert("⚠️ Please select a payment method!");
      return;
    }

    // Create order object
    const newOrder = {
      items: cart,
      totalAmount,
      paymentMethod,
      paymentDetails: formData,
    };

    // Auth config
    const config = {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    };

    try {
      await axios.post("http://localhost:5000/orders", newOrder, config);
      alert(`✅ Payment of ₹${totalAmount.toFixed(2)} successful!`);

      clearCart();
      navigate("/orders");
    } catch (error) {
      console.error("❌ Error saving order:", error);
      const msg = error.response?.data?.message || "Failed to save order details!";
      alert(`❌ ${msg}`);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-20">
      <div className="bg-[#111] p-8 rounded-2xl shadow-xl max-w-md w-full text-white border border-[#00b2fe]">
        <h2 className="text-3xl font-bold text-center mb-6 text-[#00b2fe]">
          Choose Payment Method 💳
        </h2>

        <p className="text-center text-lg mb-6">
          Total Amount:{" "}
          <span className="text-green-400 font-semibold">
            ₹{totalAmount.toFixed(2)}
          </span>
        </p>

        <div className="space-y-3 mb-6">
          {["Cash on Delivery", "Online Payment", "Internet Banking", "EMI"].map(
            (method) => (
              <label
                key={method}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${paymentMethod === method
                    ? "border-[#00b2fe] bg-[#1a1a1a]"
                    : "border-gray-600 hover:border-[#00b2fe]"
                  }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method}
                  checked={paymentMethod === method}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>{method}</span>
              </label>
            )
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {paymentMethod === "Online Payment" && (
            <>
              <div className="flex gap-3 justify-center mb-3">
                <button
                  type="button"
                  onClick={() => setOnlineOption("card")}
                  className={`px-4 py-2 rounded-lg ${onlineOption === "card"
                      ? "bg-[#00b2fe] text-white"
                      : "bg-transparent border border-gray-600 text-gray-300"
                    }`}
                >
                  💳 Card
                </button>
                <button
                  type="button"
                  onClick={() => setOnlineOption("upi")}
                  className={`px-4 py-2 rounded-lg ${onlineOption === "upi"
                      ? "bg-[#00b2fe] text-white"
                      : "bg-transparent border border-gray-600 text-gray-300"
                    }`}
                >
                  📱 UPI
                </button>
              </div>

              {onlineOption === "card" && (
                <>
                  <div>
                    <label className="block mb-1 text-gray-300">Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      maxLength={16}
                      required
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-transparent border border-gray-600 rounded-lg focus:border-[#00b2fe]"
                    />
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block mb-1 text-gray-300">Expiry</label>
                      <input
                        type="text"
                        name="expiry"
                        placeholder="MM/YY"
                        required
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-transparent border border-gray-600 rounded-lg focus:border-[#00b2fe]"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block mb-1 text-gray-300">CVV</label>
                      <input
                        type="password"
                        name="cvv"
                        maxLength={3}
                        required
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-transparent border border-gray-600 rounded-lg focus:border-[#00b2fe]"
                      />
                    </div>
                  </div>
                </>
              )}

              {onlineOption === "upi" && (
                <div>
                  <label className="block mb-1 text-gray-300">Enter UPI ID</label>
                  <input
                    type="text"
                    name="upiId"
                    placeholder="example@upi"
                    required
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-transparent border border-gray-600 rounded-lg focus:border-[#00b2fe]"
                  />
                </div>
              )}
            </>
          )}

          {paymentMethod === "Cash on Delivery" && (
            <div className="text-center text-gray-400">
              <p>💵 Pay when you receive your order.</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#00b2fe] hover:bg-[#0090d1] text-white font-bold rounded-lg transition"
          >
            Confirm & Pay ₹{totalAmount.toFixed(2)}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Payment;

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Address() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const totalAmount = location.state?.totalAmount || 0;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    
    if (
      !form.name ||
      !form.phone ||
      !form.address ||
      !form.city ||
      !form.state ||
      !form.pincode
    ) {
      alert("Please fill all fields!");
      return;
    }

    
    navigate("/payment", { state: { ...form, totalAmount } });
  };

  return (
    <div className="min-h-screen bg-[#bed1ab] flex justify-center items-center p-6">
      <div className="bg-[#e3eaef] shadow-xl rounded-xl p-8 w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold text-center text-[#8dc53e] mb-6 ">
          Shipping Address
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 ">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="border rounded px-4 py-2 focus:outline-[#8dc53e]"
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            className="border rounded px-4 py-2 focus:outline-[#8dc53e]"
          />

          <textarea
            name="address"
            placeholder="Full Address"
            value={form.address}
            onChange={handleChange}
            className="border rounded px-4 py-2 focus:outline-[#8dc53e]"
            rows="3"
          />

          <div className="flex gap-4">
            <input
              type="text"
              name="city"
              placeholder="City"
              value={form.city}
              onChange={handleChange}
              className="border rounded px-4 py-2 w-1/2 focus:outline-[#8dc53e]"
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={form.state}
              onChange={handleChange}
              className="border rounded px-4 py-2 w-1/2 focus:outline-[#8dc53e]"
            />
          </div>

          <input
            type="text"
            name="pincode"
            placeholder="Pincode"
            value={form.pincode}
            onChange={handleChange}
            className="border rounded px-4 py-2 focus:outline-[#8dc53e]"
          />

          <button
            type="submit"
            className="bg-[#8dc53e] text-white py-2 rounded hover:bg-[#76b431] transition"
          >
            Proceed to Payment ₹{totalAmount.toFixed(2)}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Address;

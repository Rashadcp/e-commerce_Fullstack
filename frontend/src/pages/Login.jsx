import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CartContext } from "./CartProvider";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from 'react-toastify';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const { initializeUserCart, loginAdmin } = useContext(CartContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const { data } = await axios.post("http://localhost:5000/users/login", { email, password });

      if (data.isAdmin) {
        loginAdmin(); // Note: we might want to store token for admin too
        localStorage.setItem("adminToken", data.token);
        toast.success("Welcome Admin!", {
          position: "top-right",
          autoClose: 2000,
        });
        setTimeout(() => {
          navigate("/admin");
        }, 1000);
      } else {
        initializeUserCart(data);
        toast.success("Login successful!", {
          position: "top-right",
          autoClose: 2000,
        });
        setTimeout(() => {
          navigate("/products");
        }, 1000);
      }
    } catch (error) {
      console.error("Login error:", error);
      const message = error.response?.data?.message || "Login failed. Please try again.";
      toast.error(message, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-green-200">
      <div
        className="p-8 rounded-lg shadow-lg w-full max-w-md bg-cover bg-center"
        style={{ backgroundImage: 'url("/register.png")' }}
      >
        <h2 className="text-2xl font-bold text-center text-[#8dc53e] mb-6">
          Login
        </h2>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-[#8dc53e] bg-[#b4bca8]"
          />

          {/* Password with toggle */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border border-gray-300 rounded px-4 py-2 w-full focus:outline-none focus:border-[#8dc53e] bg-[#b4bca8]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-700 hover:text-black"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>


          {errorMessage && (
            <p className="text-red-600 text-sm text-center">{errorMessage}</p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className="bg-[#8dc53e] text-white py-2 rounded hover:bg-[#76b431] transition"

          >
            Login
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-white">
          Don't have an account?{" "}
          <a href="/register" className="text-[#8dc53e] hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;

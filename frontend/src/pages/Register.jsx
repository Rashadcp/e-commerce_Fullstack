import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { toast } from 'react-toastify';

function Register() {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Password validation  
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const passwordPattern = /[!@#\$%\^&\*]/;
    if (!passwordPattern.test(password)) {
      toast.error("Password must include at least one special character (!, @, #, $, %, ^, &, *)", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      // Create user
      await axios.post("http://localhost:5000/users", {
        name,
        number,
        email,
        password,
      });

      toast.success("Registration successful! Please login.", {
        position: "top-right",
        autoClose: 2000,
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Registration failed:", error);
      const message = error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(message, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div
        className="p-8 rounded-lg shadow-lg w-full max-w-md bg-cover bg-center"
        style={{ backgroundImage: 'url("/register.png")' }}
      >
        <h2 className="text-2xl font-bold text-center text-[#8dc53e] mb-6">Register</h2>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-white rounded px-4 py-2 focus:outline-none focus:border-[#8dc53e] bg-[#b4bca8]"
            required
          />
          <input
            type="number"
            placeholder="Phone Number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-[#8dc53e] bg-[#b0b9a4]"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-[#8dc53e] bg-[#bbc1b3]"
            required
          />

          {/* Password  */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password (min 6 chars, must include @!#)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 pr-10 focus:outline-none focus:border-[#8dc53e] bg-[#bfc5b7]"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            type="submit"
            className="bg-[#8dc53e] text-white py-2 rounded hover:bg-[#76b431] transition"
          >
            Register
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-white">
          Already have an account?{" "}
          <a href="/login" className="text-[#8dc53e] hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;

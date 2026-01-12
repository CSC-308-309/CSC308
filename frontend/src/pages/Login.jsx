import { X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../utils/auth";
import { useState } from "react";
import logoIcon from '../assets/logo.svg';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    navigate(-1); // go back
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // call api
      const response = await api.login({email, password});

      navigate("/profile");
    } catch (err)
    {
      setError(err.response?.data?.message || "Login failed. Please try again.")
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-[#7E5179]">
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-6 left-6 text-white hover:text-black transition"
        aria-label="Close"
      >
        <X size={35} />
      </button>

      
      {/* Logo */}
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
        <img src={logoIcon} alt="Mic" className="w-16 h-16" />
        <h1 className="text-[57px] font-semibold font-nunito text-white">
          Melodious
        </h1>
      </div>

        {/* Login Card */}
      <div className="min-h-screen flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-[#7E5179] p-2 rounded w-[320px]"
        >
          <h2 className="text-2xl font-semibold mb-4 text-white">Log in</h2>

          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-2 mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full bg-purple-600 text-white py-2 rounded">
            Log in
          </button>

          <p className="text-sm mt-4 text-center text-white">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-orange-600 underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

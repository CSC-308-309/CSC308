import { X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../utils/auth";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleClose = () => {
    navigate(-1); // go back
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email });
    navigate("/profile");
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-6 left-6 text-gray-500 hover:text-black transition"
        aria-label="Close"
      >
        <X size={28} />
      </button>

      {/* Login Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded w-[320px]"
      >
        <h2 className="text-2xl font-semibold mb-4">Log in</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="w-full bg-purple-600 text-white py-2 rounded">
          Log in
        </button>

        <p className="text-sm mt-4 text-center">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-purple-600 underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}

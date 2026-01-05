import { X } from "lucide-react";
import { login } from "../utils/auth";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Pretend we created an account
    login({ email });
    navigate("/profile");
  };

  const handleClose = () => {
    navigate(-1); // go back
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
    {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-6 left-6 text-gray-500 hover:text-black transition"
        aria-label="Close"
      >
        <X size={28} />
      </button>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded w-[320px]"
      >
        <h2 className="text-2xl font-semibold mb-4">Sign up</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="w-full bg-purple-600 text-white py-2 rounded">
          Create account
        </button>

        <p className="text-sm mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-600 underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}

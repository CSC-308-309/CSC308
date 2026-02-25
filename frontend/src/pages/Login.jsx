import { X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import logoIcon from "../assets/logo.svg";
import { api } from "../client";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => navigate(-1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await api.login({ email, password });

      localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-[#7E5179]">
      {/* <button
        onClick={handleClose}
        className="absolute top-6 left-6 text-white hover:text-black transition"
        aria-label="Close"
      >
        <X size={35} />
      </button> */}

      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
        <img src={logoIcon} alt="Mic" className="w-16 h-16" />
        <h1 className="text-[57px] font-semibold font-nunito text-white">
          Melodious
        </h1>
      </div>

      <div className="min-h-screen flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-[#7E5179] p-2 rounded w-[320px]"
        >
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Log in to your account
          </h2>

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

          <button
            className="w-full bg-purple-600 text-white py-2 rounded"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log in"}
          </button>

          {error && <p className="text-red-500 mt-2 text-center">{error}</p>}

          <p className="text-sm mt-4 text-center text-white">
            Don't have an account?{" "}
            <Link to="/signup" className="text-orange-600 underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

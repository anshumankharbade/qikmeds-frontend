import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(form);

      if (result.success) {
        toast.success("Logged in successfully");
        navigate("/medicines");
      } else {
        setError(result.message || "Login failed");
        toast.error(result.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-3">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              required
              className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Email address"
              disabled={loading}
            />
          </div>
          <div>
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              type="password"
              required
              className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Password"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded font-semibold ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white transition`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          New here?{" "}
          <a
            href="/register"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Create an account
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;

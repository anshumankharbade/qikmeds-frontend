import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await register(form);

      if (result.success) {
        toast.success("Account created successfully!");
        navigate("/medicines");
      } else {
        setError(result.message || "Registration failed");
        toast.error(result.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed");
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Create Account
        </h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-3">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="Full name"
              disabled={loading}
            />
          </div>
          <div>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              required
              className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
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
              minLength="6"
              className="w-full p-3 border rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              placeholder="Password (min. 6 characters)"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded font-semibold ${
              loading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            } text-white transition`}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;

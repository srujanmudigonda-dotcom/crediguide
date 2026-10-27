import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    if (!identifier.trim() || !password) {
      alert(
        "Please enter your email or mobile number and password."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await login({
        identifier: identifier.trim(),
        password,
      });

      if (!response?.success) {
        alert(response?.message || "Login failed.");
        return;
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Login Error:", error);

      const message =
        error.response?.data?.message ||
        "Unable to login. Please check your details and password.";

      alert(message);

      // Account exists but its registration OTP was never
      // verified: send the user to the OTP verification screen.
      if (error.response?.data?.requiresRegistrationVerification) {
        navigate("/verify-otp", {
          state: {
            email:
              error.response?.data?.email ||
              (identifier.includes("@")
                ? identifier.trim().toLowerCase()
                : ""),
          },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600">
            CrediGuide
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your credit health with confidence
          </p>
        </div>

        <form
          onSubmit={handleLoginSubmit}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email or Phone Number
            </label>

            <input
              type="text"
              value={identifier}
              onChange={(event) =>
                setIdentifier(event.target.value)
              }
              placeholder="Enter your email or phone number"
              autoComplete="username"
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;

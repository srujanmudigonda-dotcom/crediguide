
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login, verifyLoginOTP } = useAuth();

  const [step, setStep] = useState("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      alert("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await login({
        email: email.trim().toLowerCase(),
        password,
      });

      if (!response?.success) {
        alert(response?.message || "Login failed.");
        return;
      }

      // Backend successfully generated login OTP.
      // Move directly to OTP screen.
      setStep("otp");

      alert(
        "Login OTP generated. Check the backend terminal for the OTP."
      );
    } catch (error) {
      console.error("Login Error:", error);

      const message =
        error.response?.data?.message ||
        "Unable to login. Please check your email and password.";

      alert(message);

      if (error.response?.data?.requiresRegistrationVerification) {
        navigate("/verify-otp", {
          state: {
            email: email.trim().toLowerCase(),
          },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (event) => {
    event.preventDefault();

    if (!otp.trim()) {
      alert("Please enter the login OTP.");
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      alert("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await verifyLoginOTP(
        email.trim().toLowerCase(),
        otp.trim()
      );

      if (!response?.success) {
        alert(
          response?.message ||
            "OTP verification failed."
        );
        return;
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Login OTP Verification Error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to verify OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setStep("credentials");
    setOtp("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        {step === "credentials" ? (
          <>
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
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Enter your email"
                  autoComplete="email"
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
                {loading ? "Checking..." : "Continue"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{" "}

              <Link
                to="/register"
                className="font-semibold text-blue-600 hover:underline"
              >
                Register
              </Link>
            </p>
          </>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-blue-600">
                Verify Login
              </h1>

              <p className="mt-2 text-gray-500">
                Enter the 6-digit OTP generated for
                <br />

                <span className="font-medium text-gray-700">
                  {email}
                </span>
              </p>
            </div>

            <form
              onSubmit={handleOTPSubmit}
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Login OTP
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => {
                    const value =
                      event.target.value.replace(/\D/g, "");

                    setOtp(value);
                  }}
                  placeholder="Enter 6-digit OTP"
                  autoComplete="one-time-code"
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-xl tracking-[0.5em] outline-none focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Verifying..."
                  : "Verify OTP & Login"}
              </button>

              <button
                type="button"
                onClick={handleBackToLogin}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Back to Login
              </button>
            </form>

            <div className="mt-6 rounded-lg bg-blue-50 p-4 text-center">
              <p className="text-sm text-blue-700">
                For development testing, the OTP is displayed
                in the backend terminal.
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default Login;

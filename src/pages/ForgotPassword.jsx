import { useState } from "react";
import { notify } from "../utils/notify";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ForgotPassword() {
  const navigate = useNavigate();
  const { forgotPassword, resetPassword } = useAuth();

  const [step, setStep] = useState("request");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Step 1 - Request the reset OTP
  |--------------------------------------------------------------------------
  */

  const handleRequestOTP = async (event) => {
    event.preventDefault();

    if (!identifier.trim()) {
      notify("Please enter your email or mobile number.");
      return;
    }

    try {
      setLoading(true);

      const response = await forgotPassword(
        identifier.trim()
      );

      if (!response?.success) {
        notify(
          response?.message ||
            "Unable to send the OTP. Please try again."
        );
        return;
      }

      notify(
        "An OTP has been sent to your registered mobile number."
      );

      setStep("reset");
    } catch (error) {
      console.error("Forgot Password Error:", error);

      notify(
        error.response?.data?.message ||
          "Unable to send the OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Step 2 - Verify OTP and set the new password
  |--------------------------------------------------------------------------
  */

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(otp.trim())) {
      notify("Please enter the 6-digit OTP.");
      return;
    }

    if (newPassword.length < 6) {
      notify("Password must contain at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      notify("New password and confirm password do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await resetPassword({
        identifier: identifier.trim(),
        otp: otp.trim(),
        newPassword,
      });

      if (!response?.success) {
        notify(
          response?.message ||
            "Unable to reset the password. Please try again."
        );
        return;
      }

      notify(
        "Password reset successful. Please login with your new password."
      );

      navigate("/login");
    } catch (error) {
      console.error("Reset Password Error:", error);

      notify(
        error.response?.data?.message ||
          "Unable to reset the password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600">
            Forgot Password
          </h1>

          <p className="mt-2 text-gray-500">
            {step === "request"
              ? "Enter your email or mobile number. We will send an OTP to your registered mobile number."
              : "Enter the OTP sent to your mobile number and choose a new password."}
          </p>
        </div>

        {step === "request" ? (
          <form
            onSubmit={handleRequestOTP}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleResetPassword}
            className="space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                OTP
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

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(event.target.value)
                }
                placeholder="Enter a new password"
                autoComplete="new-password"
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Re-enter the new password"
                autoComplete="new-password"
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => setStep("request")}
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Back
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          Remembered it?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;

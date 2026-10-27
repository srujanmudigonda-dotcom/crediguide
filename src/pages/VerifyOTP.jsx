import { useState } from "react";
import { notify } from "../utils/notify";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();

  const { verifyOTP, resendOTP } = useAuth();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Verify Registration OTP
  |--------------------------------------------------------------------------
  */

  const handleVerify = async (event) => {
    event.preventDefault();

    if (!email) {
      notify(
        "Email information is missing. Please register again."
      );

      navigate("/register");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      notify("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await verifyOTP(
        email,
        otp
      );

      if (!response?.success) {
        notify(
          response?.message ||
            "OTP verification failed."
        );

        return;
      }

      notify(
        "Mobile number verified successfully. You are now logged in."
      );

      navigate("/dashboard");
    } catch (error) {
      console.error(
        "OTP Verification Error:",
        error
      );

      notify(
        error.response?.data?.message ||
          "Unable to verify OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Resend Registration OTP
  |--------------------------------------------------------------------------
  */

  const handleResendOTP = async () => {
    if (!email) {
      notify(
        "Email information is missing. Please register again."
      );

      navigate("/register");
      return;
    }

    try {
      setResending(true);

      const response =
        await resendOTP(email);

      if (response?.success) {
        notify(
          "A new OTP has been sent to your mobile number."
        );
      } else {
        notify(
          response?.message ||
            "Failed to resend OTP."
        );
      }
    } catch (error) {
      console.error(
        "Resend OTP Error:",
        error
      );

      notify(
        error.response?.data?.message ||
          "Unable to resend OTP. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600">
            CrediGuide
          </h1>

          <h2 className="mt-6 text-2xl font-bold text-gray-800">
            Verify Your Email
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Enter the OTP generated for your email address.
          </p>

          {email && (
            <p className="mt-2 text-sm font-medium text-blue-600">
              {email}
            </p>
          )}
        </div>

        <form
          onSubmit={handleVerify}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Enter OTP
            </label>

            <input
              type="text"
              value={otp}
              onChange={(event) => {
                const value =
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6);

                setOtp(value);
              }}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-xl tracking-[0.5em] outline-none focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={
              loading || otp.length !== 6
            }
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Verifying..."
              : "Verify OTP"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResendOTP}
          disabled={resending || loading}
          className="mt-5 w-full text-sm font-medium text-blue-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          {resending
            ? "Sending..."
            : "Resend OTP"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/login")}
          disabled={loading}
          className="mt-4 w-full text-sm font-medium text-gray-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back to Login
        </button>

      </div>
    </div>
  );
}

export default VerifyOTP;
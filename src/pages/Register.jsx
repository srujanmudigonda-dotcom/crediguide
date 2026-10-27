
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    currentCibilScore: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const {
      fullName,
      email,
      mobileNumber,
      currentCibilScore,
      password,
      confirmPassword,
    } = formData;

    if (
      !fullName.trim() ||
      !email.trim() ||
      !mobileNumber.trim() ||
      !currentCibilScore ||
      !password ||
      !confirmPassword
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const cleanedMobileNumber =
      mobileNumber.replace(/\D/g, "");

    if (
      !/^[6-9]\d{9}$/.test(
        cleanedMobileNumber
      )
    ) {
      alert(
        "Please enter a valid 10-digit Indian mobile number."
      );
      return;
    }

    if (password.length < 6) {
      alert(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const score = Number(
      currentCibilScore
    );

    if (
      !Number.isInteger(score) ||
      score < 300 ||
      score > 900
    ) {
      alert(
        "Please enter a valid CIBIL score between 300 and 900."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        mobileNumber: cleanedMobileNumber,
        password,
        currentCibilScore: score,
      });

      if (!response.success) {
        alert(
          response.message ||
            "Registration failed."
        );
        return;
      }

      alert(
        `Account created successfully.\n\nDevelopment OTP: ${
          response.otp ||
          response.developmentOTP ||
          "Check the backend console."
        }`
      );

      navigate("/verify-otp", {
        state: {
          email:
            email.trim().toLowerCase(),
          password,
        },
      });
    } catch (error) {
      console.error(
        "Registration Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600">
            Create Account
          </h1>

          <p className="mt-2 text-gray-500">
            Create your CrediGuide account
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>

            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label
              htmlFor="mobileNumber"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Mobile Number
            </label>

            <input
              id="mobileNumber"
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="Enter your 10-digit mobile number"
              autoComplete="tel"
              inputMode="numeric"
              maxLength="10"
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 disabled:bg-gray-100"
            />

            <p className="mt-2 text-xs leading-5 text-gray-500">
              This number will be used for OTPs and CrediGuide
              notifications.
            </p>
          </div>

          {/* Current CIBIL Score */}
          <div>
            <label
              htmlFor="currentCibilScore"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Current CIBIL Score
            </label>

            <input
              id="currentCibilScore"
              type="number"
              name="currentCibilScore"
              value={
                formData.currentCibilScore
              }
              onChange={handleChange}
              placeholder="Enter your current CIBIL score"
              min="300"
              max="900"
              step="1"
              inputMode="numeric"
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 disabled:bg-gray-100"
            />

            <p className="mt-2 text-xs leading-5 text-gray-500">
              Enter the CIBIL score from your latest
              credit report. CrediGuide will use this
              as your starting score for simulated
              score tracking.
            </p>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              autoComplete="new-password"
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 disabled:bg-gray-100"
            />

            <p className="mt-2 text-xs text-gray-500">
              Password must contain at least 6 characters.
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={
                formData.confirmPassword
              }
              onChange={handleChange}
              placeholder="Confirm your password"
              autoComplete="new-password"
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;

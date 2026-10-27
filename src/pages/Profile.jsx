import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Pencil,
  Save,
  X,
} from "lucide-react";

import authService from "../services/authService";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await authService.getProfile();

        if (response?.success && response?.user) {
          setProfile(response.user);

          setFormData({
            fullName: response.user.fullName || "",
            mobileNumber: response.user.mobileNumber || "",
          });

          localStorage.setItem(
            "creditGuideUser",
            JSON.stringify(response.user)
          );
        } else {
          setError("Unable to load profile information.");
        }
      } catch (error) {
        console.error("Profile loading error:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load profile information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setError("");
    setSuccess("");

    setFormData({
      fullName: profile?.fullName || "",
      mobileNumber: profile?.mobileNumber || "",
    });

    setEditing(true);
  };

  const handleCancel = () => {
    setError("");
    setSuccess("");

    setFormData({
      fullName: profile?.fullName || "",
      mobileNumber: profile?.mobileNumber || "",
    });

    setEditing(false);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    try {
      setSaving(true);

      const response = await authService.updateProfile({
        fullName: formData.fullName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
      });

      if (response?.success && response?.user) {
        setProfile(response.user);

        setFormData({
          fullName: response.user.fullName || "",
          mobileNumber: response.user.mobileNumber || "",
        });

        localStorage.setItem(
          "creditGuideUser",
          JSON.stringify(response.user)
        );

        setEditing(false);
        setSuccess(
          response.message ||
            "Profile updated successfully."
        );

        window.dispatchEvent(
          new Event("profileUpdated")
        );
      } else {
        setError(
          response?.message ||
            "Unable to update profile."
        );
      }
    } catch (error) {
      console.error("Profile update error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">

            {/* Page Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                Profile
              </h2>

              <p className="mt-2 text-gray-500">
                Manage your personal information and account settings.
              </p>
            </div>

            {/* Loading */}
            {loading && (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <Loader2
                  size={32}
                  className="mx-auto animate-spin text-blue-600"
                />

                <p className="mt-4 text-sm text-gray-500">
                  Loading profile...
                </p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
                <div className="flex items-center gap-3 text-red-700">
                  <AlertCircle size={22} />

                  <p className="text-sm font-medium">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Success */}
            {!loading && success && (
              <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
                <div className="flex items-center gap-3 text-green-700">
                  <ShieldCheck size={22} />

                  <p className="text-sm font-medium">
                    {success}
                  </p>
                </div>
              </div>
            )}

            {/* Profile */}
            {!loading && profile && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">

                {/* Profile Header */}
                <div className="flex flex-col gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex flex-col items-center gap-4 sm:flex-row">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                      <User
                        size={38}
                        className="text-blue-600"
                      />
                    </div>

                    <div className="text-center sm:text-left">
                      <h3 className="text-xl font-bold text-gray-800">
                        {profile.fullName}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        CrediGuide Member
                      </p>
                    </div>
                  </div>

                  {!editing && (
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      <Pencil size={17} />
                      Edit Profile
                    </button>
                  )}
                </div>

                {/* Edit Form */}
                {editing ? (
                  <form
                    onSubmit={handleSave}
                    className="mt-6"
                  >
                    <h3 className="text-lg font-semibold text-gray-700">
                      Edit Personal Information
                    </h3>

                    <div className="mt-5 space-y-5">

                      {/* Full Name */}
                      <div>
                        <label
                          htmlFor="fullName"
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          Full Name
                        </label>

                        <div className="relative">
                          <User
                            size={19}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          />

                          <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            disabled={saving}
                            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                            placeholder="Enter your full name"
                          />
                        </div>
                      </div>

                      {/* Mobile Number */}
                      <div>
                        <label
                          htmlFor="mobileNumber"
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          Mobile Number
                        </label>

                        <div className="relative">
                          <Phone
                            size={19}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          />

                          <input
                            id="mobileNumber"
                            name="mobileNumber"
                            type="tel"
                            value={formData.mobileNumber}
                            onChange={handleInputChange}
                            disabled={saving}
                            maxLength={10}
                            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                            placeholder="Enter your mobile number"
                          />
                        </div>
                      </div>

                      {/* Email - Read Only */}
                      <div>
                        <label
                          htmlFor="email"
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          Email
                        </label>

                        <div className="relative">
                          <Mail
                            size={19}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          />

                          <input
                            id="email"
                            type="email"
                            value={profile.email || ""}
                            disabled
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-500"
                          />
                        </div>

                        <p className="mt-2 text-xs text-gray-400">
                          Email address cannot be changed from the profile page.
                        </p>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? (
                          <>
                            <Loader2
                              size={17}
                              className="animate-spin"
                            />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={17} />
                            Save Changes
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                        className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <X size={17} />
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {/* Account Information */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-700">
                        Account Information
                      </h3>

                      <div className="mt-5 space-y-4">

                        {/* Full Name */}
                        <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <User
                              size={19}
                              className="text-blue-600"
                            />
                          </div>

                          <div>
                            <p className="text-xs text-gray-400">
                              Full Name
                            </p>

                            <p className="mt-1 font-medium text-gray-700">
                              {profile.fullName}
                            </p>
                          </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                            <Mail
                              size={19}
                              className="text-purple-600"
                            />
                          </div>

                          <div>
                            <p className="text-xs text-gray-400">
                              Email
                            </p>

                            <p className="mt-1 font-medium text-gray-700">
                              {profile.email}
                            </p>
                          </div>
                        </div>

                        {/* Mobile Number */}
                        <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                            <Phone
                              size={19}
                              className="text-green-600"
                            />
                          </div>

                          <div>
                            <p className="text-xs text-gray-400">
                              Mobile Number
                            </p>

                            <p className="mt-1 font-medium text-gray-700">
                              {profile.mobileNumber || "Not provided"}
                            </p>
                          </div>
                        </div>

                        {/* Email Verification */}
                        <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                            <ShieldCheck
                              size={19}
                              className="text-green-600"
                            />
                          </div>

                          <div>
                            <p className="text-xs text-gray-400">
                              Email Verification
                            </p>

                            <p className="mt-1 font-medium text-green-600">
                              {profile.isEmailVerified
                                ? "Verified"
                                : "Not Verified"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Privacy Information */}
                <div className="mt-6 rounded-xl bg-green-50 p-5">
                  <div className="flex gap-3">
                    <ShieldCheck
                      size={22}
                      className="shrink-0 text-green-600"
                    />

                    <div>
                      <h4 className="font-semibold text-green-700">
                        Credit Information Privacy
                      </h4>

                      <p className="mt-1 text-sm leading-6 text-green-600">
                        Credit information should only be accessed
                        with your consent through an authorized
                        credit-information provider.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Profile;
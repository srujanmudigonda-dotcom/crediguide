import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
  User,
  Mail,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";

import authService from "../services/authService";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await authService.getProfile();

        if (response?.success && response?.user) {
          setProfile(response.user);
        } else {
          setError("Unable to load profile information.");
        }
      } catch (error) {
        console.error("Profile loading error:", error);

        setError(
          error.message ||
            "Failed to load profile information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

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
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
                <div className="flex items-center gap-3 text-red-700">
                  <AlertCircle size={22} />

                  <p className="text-sm font-medium">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Profile */}
            {!loading && !error && profile && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">

                {/* Profile Card */}
                <div className="flex flex-col items-center gap-4 border-b border-gray-100 pb-6 sm:flex-row">

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

                {/* Privacy */}
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
                        Credit information should only be accessed with your
                        consent through an authorized credit-information
                        provider.
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
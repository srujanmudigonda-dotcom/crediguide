import { useEffect, useState } from "react";
import { Bell, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const updateNavbarName = () => {
      const storedUser = JSON.parse(
        localStorage.getItem("creditGuideUser") || "null"
      );

      const currentUser = storedUser || user;

      setUserName(
        currentUser?.fullName ||
          currentUser?.name ||
          "User"
      );
    };

    // Load name when Navbar opens
    updateNavbarName();

    // Update immediately after Profile changes
    window.addEventListener(
      "profileUpdated",
      updateNavbarName
    );

    return () => {
      window.removeEventListener(
        "profileUpdated",
        updateNavbarName
      );
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
      <Link to="/dashboard">
        <h1 className="text-2xl font-bold text-blue-600">
          CrediGuide
        </h1>

        <p className="text-xs text-gray-500">
          Your credit health companion
        </p>
      </Link>

      <div className="flex items-center gap-4">

        <button
          type="button"
          onClick={() => navigate("/notifications")}
          className="relative rounded-full p-2 text-gray-600 transition hover:bg-gray-100"
          aria-label="Notifications"
        >
          <Bell size={21} />

          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        <Link
          to="/profile"
          className="hidden items-center gap-2 sm:flex"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
            <User
              size={18}
              className="text-blue-600"
            />
          </div>

          <span className="max-w-[160px] truncate text-sm font-medium text-gray-700">
            {userName}
          </span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
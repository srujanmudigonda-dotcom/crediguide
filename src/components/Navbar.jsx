import { useEffect, useState } from "react";
import { Bell, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getNotifications } from "../services/notificationService";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadUnread = async () => {
      try {
        const response = await getNotifications();

        if (isMounted && response.success) {
          setUnreadCount(
            (response.notifications || []).filter((n) => !n.read).length
          );
        }
      } catch {
        // The bell count is a nice-to-have; never break the navbar for it.
      }
    };

    loadUnread();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
      {/* Logo */}
      <Link to="/dashboard">
        <h1 className="text-2xl font-bold text-blue-600">CrediGuide</h1>

        <p className="text-xs text-gray-500">
          Your credit health companion
        </p>
      </Link>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <button
          type="button"
          onClick={() => navigate("/notifications")}
          className="relative rounded-full p-2 text-gray-600 transition hover:bg-gray-100"
          aria-label="Notifications"
        >
          <Bell size={21} />

          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User */}
        <Link
          to="/profile"
          className="hidden items-center gap-2 sm:flex"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
            <User size={18} className="text-blue-600" />
          </div>

          <span className="text-sm font-medium text-gray-700">
            {user?.fullName || "User"}
          </span>
        </Link>

        {/* Logout */}
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

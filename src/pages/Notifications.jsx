
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import notificationService from "../services/notificationService";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadNotifications = async () => {
    try {
      setLoading(true);

      await notificationService.createPaymentReminders();

      const data =
        await notificationService.getNotifications();

      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("Notification Error:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markNotificationAsRead(
        notificationId
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Mark Notification Read Error:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to update notification."
      );
    }
  };

  const getNotificationStyle = (type) => {
    if (type === "Overdue") {
      return "border-red-200 bg-red-50";
    }

    if (type === "Due Today") {
      return "border-orange-200 bg-orange-50";
    }

    if (type === "Due Soon") {
      return "border-yellow-200 bg-yellow-50";
    }

    if (type === "Payment") {
      return "border-green-200 bg-green-50";
    }

    if (type === "Score") {
      return "border-blue-200 bg-blue-50";
    }

    return "border-gray-200 bg-white";
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                Notifications
              </h2>

              <p className="mt-2 text-gray-500">
                View payment reminders and important
                CrediGuide updates.
              </p>
            </div>

            {message && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {message}
              </div>
            )}

            {loading ? (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                <p className="text-sm text-gray-500">
                  Loading notifications...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800">
                  No notifications
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  You do not have any notifications right now.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`rounded-2xl border p-5 shadow-sm ${
                      notification.isRead
                        ? "border-gray-200 bg-white"
                        : getNotificationStyle(
                            notification.type
                          )
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {notification.title}
                          </h3>

                          {!notification.isRead && (
                            <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-medium text-white">
                              New
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm leading-6 text-gray-600">
                          {notification.message}
                        </p>

                        <p className="mt-3 text-xs text-gray-400">
                          {new Date(
                            notification.createdAt
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>

                      {!notification.isRead && (
                        <button
                          type="button"
                          onClick={() =>
                            handleMarkAsRead(
                              notification._id
                            )
                          }
                          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Notifications;

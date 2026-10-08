import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
  Bell,
  CreditCard,
  CalendarDays,
  CheckCircle,
  AlertTriangle,
  Check,
  CheckCheck,
  Loader2,
} from "lucide-react";

import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../services/notificationService";
import { generatePaymentReminders } from "../services/reminderService";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");

  const getNotificationIcon = (type) => {
    switch (type) {
      case "Payment":
        return {
          icon: CreditCard,
          iconStyle: "bg-blue-100 text-blue-600",
        };

      case "EMI":
        return {
          icon: CalendarDays,
          iconStyle: "bg-purple-100 text-purple-600",
        };

      case "Credit Score":
        return {
          icon: CheckCircle,
          iconStyle: "bg-green-100 text-green-600",
        };

      default:
        return {
          icon: AlertTriangle,
          iconStyle: "bg-orange-100 text-orange-600",
        };
    }
  };

  const formatNotificationDate = (date) => {
    if (!date) {
      return "";
    }

    const notificationDate = new Date(date);

    if (Number.isNaN(notificationDate.getTime())) {
      return "";
    }

    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const startOfNotificationDay = new Date(
      notificationDate.getFullYear(),
      notificationDate.getMonth(),
      notificationDate.getDate()
    );

    const differenceInDays = Math.floor(
      (startOfToday - startOfNotificationDay) /
        (1000 * 60 * 60 * 24)
    );

    if (differenceInDays === 0) {
      return "Today";
    }

    if (differenceInDays === 1) {
      return "Yesterday";
    }

    if (differenceInDays > 1 && differenceInDays < 7) {
      return `${differenceInDays} days ago`;
    }

    return notificationDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const fetchNotifications = async () => {
    try {
      setError("");

      const response = await getNotifications();

      if (response?.success) {
        setNotifications(response.notifications || []);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);

      setError(
        error.message ||
          "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
  const loadNotifications = async () => {
    try {
      await generatePaymentReminders();
    } catch (error) {
      console.error("Failed to create payment reminders:", error);
    }

    fetchNotifications();
  };

  loadNotifications();
}, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      setUpdatingId(notificationId);
      setError("");

      await markNotificationAsRead(notificationId);

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );

      setError(
        error.message ||
          "Failed to update notification."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      setError("");

      await markAllNotificationsAsRead();

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error
      );

      setError(
        error.message ||
          "Failed to update notifications."
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">

            {/* Page Header */}
            <div className="mb-8">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Bell size={21} />
                  </div>

                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">
                      Notifications
                    </h2>

                    <p className="mt-1 text-gray-500">
                      Stay updated about your payments and credit health.
                    </p>
                  </div>
                </div>

                {/* Mark All Button */}
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    disabled={markingAll}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {markingAll ? (
                      <>
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCheck size={16} />
                        Mark All as Read
                      </>
                    )}
                  </button>
                )}

              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <Loader2
                  size={32}
                  className="mx-auto animate-spin text-blue-600"
                />

                <p className="mt-4 text-sm text-gray-500">
                  Loading notifications...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              /* Empty State */
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Bell size={25} />
                </div>

                <h3 className="mt-4 text-lg font-semibold text-gray-800">
                  No notifications
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  You don't have any notifications right now.
                </p>
              </div>
            ) : (
              /* Notifications */
              <div className="space-y-4">
                {notifications.map((notification) => {
                  const notificationStyle =
                    getNotificationIcon(notification.type);

                  const Icon = notificationStyle.icon;

                  return (
                    <div
                      key={notification._id}
                      className={`rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md ${
                        !notification.read
                          ? "border-l-4 border-blue-500"
                          : "opacity-80"
                      }`}
                    >
                      <div className="flex gap-4">

                        {/* Icon */}
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${notificationStyle.iconStyle}`}
                        >
                          <Icon size={20} />
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">

                          <div className="flex flex-col justify-between gap-2 sm:flex-row">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-800">
                                {notification.title}
                              </h3>

                              {!notification.read && (
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                  New
                                </span>
                              )}
                            </div>

                            <span className="shrink-0 text-xs text-gray-400">
                              {formatNotificationDate(
                                notification.createdAt
                              )}
                            </span>
                          </div>

                          <p className="mt-2 text-sm leading-6 text-gray-500">
                            {notification.message}
                          </p>

                          {/* Mark as Read */}
                          {!notification.read && (
                            <button
                              type="button"
                              onClick={() =>
                                handleMarkAsRead(
                                  notification._id
                                )
                              }
                              disabled={
                                updatingId ===
                                notification._id
                              }
                              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {updatingId ===
                              notification._id ? (
                                <>
                                  <Loader2
                                    size={15}
                                    className="animate-spin"
                                  />
                                  Updating...
                                </>
                              ) : (
                                <>
                                  <Check size={15} />
                                  Mark as Read
                                </>
                              )}
                            </button>
                          )}

                          {/* Already Read */}
                          {notification.read && (
                            <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-green-600">
                              <CheckCircle size={15} />
                              Read
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Notification Settings */}
            <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

              <h3 className="text-lg font-semibold text-gray-700">
                Notification Preferences
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Payment reminders and credit updates can be managed here.
              </p>

              <div className="mt-5 rounded-xl bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-700">
                  Payment reminders
                </p>

                <p className="mt-1 text-sm text-blue-600">
                  You will receive reminders before upcoming payment due
                  dates.
                </p>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default Notifications;
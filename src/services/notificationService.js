import { supabase } from "../lib/supabaseClient";

/*
|--------------------------------------------------------------------------
| Notifications — Supabase
|--------------------------------------------------------------------------
*/

const mapNotification = (row) => ({
  _id: row.id,
  id: row.id,
  type: row.type,
  title: row.title,
  message: row.message,
  read: row.read,
  scheduledFor: row.scheduled_for,
  createdAt: row.created_at,
});

export const getNotifications = async () => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    notifications: (data || []).map(mapNotification),
  };
};

export const markNotificationAsRead = async (notificationId) => {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
};

export const markAllNotificationsAsRead = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
};


import api from "./api";

const getNotifications = async () => {
  const response = await api.get("/notifications");

  return response.data;
};

const markNotificationAsRead = async (notificationId) => {
  const response = await api.patch(
    `/notifications/${notificationId}/read`
  );

  return response.data;
};

const createPaymentReminders = async () => {
  const response = await api.post(
    "/notifications/create-reminders"
  );

  return response.data;
};

const notificationService = {
  getNotifications,
  markNotificationAsRead,
  createPaymentReminders,
};

export default notificationService;

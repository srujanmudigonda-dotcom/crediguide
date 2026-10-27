import api from "./api";

export const getPayments = async () => {
  const response = await api.get("/payments");
  return response.data;
};

export const getUpcomingPayments = async () => {
  const response = await api.get("/payments/upcoming");
  return response.data;
};

export const markPaymentAsPaid = async (paymentId) => {
  const response = await api.patch(
    `/payments/${paymentId}/paid`
  );

  return response.data;
};
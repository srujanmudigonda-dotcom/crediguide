

import api from "./api";

const getPaymentPreventionAlerts = async () => {
  const response = await api.get("/loans/payment-prevention");
  return response.data;
};

const paymentPreventionService = {
  getPaymentPreventionAlerts,
};

export default paymentPreventionService;

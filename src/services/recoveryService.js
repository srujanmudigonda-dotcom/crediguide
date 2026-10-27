
import api from "./api";

const getRecoveryPlan = async () => {
  const response = await api.get("/loans/recovery-plan");
  return response.data;
};

const recoveryService = {
  getRecoveryPlan,
};

export default recoveryService;

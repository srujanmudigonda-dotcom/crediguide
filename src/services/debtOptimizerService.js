
import api from "./api";

const getDebtRepaymentPlan = async () => {
  const response = await api.get("/loans/debt-optimizer");
  return response.data;
};

const debtOptimizerService = {
  getDebtRepaymentPlan,
};

export default debtOptimizerService;

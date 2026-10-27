
import api from "./api";

const getRepaymentAdvice = async () => {
  const response = await api.get("/loans/advisor");
  return response.data;
};

const advisorService = {
  getRepaymentAdvice,
};

export default advisorService;

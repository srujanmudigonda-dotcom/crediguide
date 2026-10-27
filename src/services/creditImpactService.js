import api from "./api";

const simulateCreditImpact = async (simulationData) => {
  const response = await api.post(
    "/credit-impact/simulate",
    simulationData
  );

  return response.data;
};

const creditImpactService = {
  simulateCreditImpact,
};

export default creditImpactService;
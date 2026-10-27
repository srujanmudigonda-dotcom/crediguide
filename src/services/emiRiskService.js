import api from "./api";

const getEmiRiskPrediction = async (predictionData) => {
  const response = await api.post(
    "/emi-risk/predict",
    predictionData
  );

  return response.data;
};

const emiRiskService = {
  getEmiRiskPrediction,
};

export default emiRiskService;
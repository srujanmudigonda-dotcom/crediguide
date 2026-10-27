import api from "./api";

// Credit Score
export const getCreditScore = async () => {
  const response = await api.get("/credit-score");
  return response.data;
};

// Credit Health
export const getCreditHealth = async () => {
  const response = await api.get("/credit-health");
  return response.data;
};

// Score History
export const getScoreHistory = async () => {
  const response = await api.get("/credit-score/history");
  return response.data;
};

// Improvement Plan
export const getImprovementPlan = async () => {
  const response = await api.get(
    "/credit-score/improvement-plan"
  );

  return response.data;
};
import api from "./api";

const getCreditReportExplanation = async () => {
  const response = await api.get(
    "/credit-report-explainer/explain"
  );

  return response.data;
};

const creditReportExplainerService = {
  getCreditReportExplanation,
};

export default creditReportExplainerService;
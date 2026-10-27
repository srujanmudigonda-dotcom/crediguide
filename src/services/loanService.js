import api from "./api";

export const getLoans = async () => {
  const response = await api.get("/loans");
  return response.data;
};

export const createLoan = async (loanData) => {
  const response = await api.post("/loans", loanData);
  return response.data;
};

export const updateLoan = async (loanId, loanData) => {
  const response = await api.put(`/loans/${loanId}`, loanData);
  return response.data;
};

export const deleteLoan = async (loanId) => {
  const response = await api.delete(`/loans/${loanId}`);
  return response.data;
};

export const recordLoanPayment = async (loanId, paymentData) => {
  const response = await api.post(
    `/loans/${loanId}/payments`,
    paymentData
  );

  return response.data;
};
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUpcomingPayments } from "../services/paymentService";
import { getLoans } from "../services/loanService";

function EMICard() {
  const navigate = useNavigate();
  const [emi, setEmi] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Prefer the nearest EMI payment; fall back to the nearest
        // active loan's EMI so the card reflects real data either way.
        const paymentsResponse = await getUpcomingPayments();
        const emiPayment = (paymentsResponse.payments || []).find(
          (p) => p.type === "EMI"
        );

        if (emiPayment) {
          setEmi({
            title: emiPayment.title,
            amount: emiPayment.amount,
            dueDate: emiPayment.dueDate,
          });
          return;
        }

        const loansResponse = await getLoans();
        const activeLoan = (loansResponse.loans || []).find(
          (loan) => loan.status !== "Paid" && Number(loan.emiAmount) > 0
        );

        if (activeLoan) {
          setEmi({
            title: activeLoan.loanName,
            amount: activeLoan.emiAmount,
            dueDate: activeLoan.dueDate,
          });
        }
      } catch (error) {
        console.error("EMI Card Error:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const formatDate = (date) => {
    if (!date) return "—";
    const [y, m, d] = String(date).split("-").map(Number);
    const parsed = y && m && d ? new Date(y, m - 1, d) : new Date(date);

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-700">EMI Due</h3>

        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-600">
          EMI
        </span>
      </div>

      {loading ? (
        <div className="mt-6 flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
        </div>
      ) : emi ? (
        <div className="mt-6">
          <p className="text-sm text-gray-500">{emi.title}</p>

          <p className="mt-2 text-3xl font-bold text-gray-800">
            ₹{Number(emi.amount).toLocaleString("en-IN")}
          </p>

          <div className="mt-4 rounded-lg bg-orange-50 p-3">
            <p className="text-sm font-medium text-orange-600">Due Date</p>

            <p className="mt-1 text-sm text-orange-500">
              {formatDate(emi.dueDate)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/loans")}
            className="mt-5 w-full rounded-lg bg-purple-600 py-3 font-semibold text-white transition hover:bg-purple-700"
          >
            View EMI
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-sm leading-6 text-gray-500">
            No EMI due. Add a loan or an EMI payment to track it here.
          </p>

          <button
            type="button"
            onClick={() => navigate("/loans")}
            className="mt-5 w-full rounded-lg bg-purple-600 py-3 font-semibold text-white transition hover:bg-purple-700"
          >
            Go to Loans & Dues
          </button>
        </div>
      )}
    </div>
  );
}

export default EMICard;

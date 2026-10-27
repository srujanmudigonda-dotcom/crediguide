import { useEffect, useState } from "react";
import api from "../services/api";

function EMICard() {
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUpcomingEMI = async () => {
      try {
        const response = await api.get("/loans");

        const loans = response.data?.loans || [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingLoans = loans
          .filter((item) => {
            if (!item.dueDate || item.status === "Paid") {
              return false;
            }

            const dueDate = new Date(item.dueDate);
            dueDate.setHours(0, 0, 0, 0);

            return dueDate >= today;
          })
          .sort(
            (a, b) =>
              new Date(a.dueDate) - new Date(b.dueDate)
          );

        setLoan(upcomingLoans[0] || null);
      } catch (error) {
        console.error("EMI Card Error:", error);
        setLoan(null);
      } finally {
        setLoading(false);
      }
    };

    loadUpcomingEMI();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getDaysUntilDue = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);

    return Math.ceil(
      (dueDate - today) / (1000 * 60 * 60 * 24)
    );
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex min-h-[260px] items-center justify-center">
          <p className="text-sm text-gray-500">
            Loading EMI information...
          </p>
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-700">
            EMI Due
          </h3>

          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-600">
            EMI
          </span>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
          <p className="text-sm font-medium text-gray-700">
            No upcoming EMI
          </p>

          <p className="mt-2 text-sm text-gray-500">
            You currently have no unpaid loan with an upcoming
            due date.
          </p>
        </div>
      </div>
    );
  }

  const daysUntilDue = getDaysUntilDue(loan.dueDate);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-700">
          EMI Due
        </h3>

        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-600">
          EMI
        </span>
      </div>

      <div className="mt-6">
        <p className="text-sm text-gray-500">
          Loan
        </p>

        <p className="mt-2 text-lg font-semibold text-gray-800">
          {loan.loanName}
        </p>

        <p className="mt-5 text-sm text-gray-500">
          EMI Amount
        </p>

        <p className="mt-2 text-3xl font-bold text-gray-800">
          ₹{(loan.emiAmount || loan.minimumDue || 0).toLocaleString(
            "en-IN"
          )}
        </p>

        <div className="mt-4 rounded-lg bg-orange-50 p-3">
          <p className="text-sm font-medium text-orange-600">
            Due Date
          </p>

          <p className="mt-1 text-sm text-orange-500">
            {formatDate(loan.dueDate)}
          </p>

          <p className="mt-2 text-xs font-medium text-orange-600">
            {daysUntilDue === 0
              ? "Due today"
              : daysUntilDue === 1
              ? "Due tomorrow"
              : `Due in ${daysUntilDue} days`}
          </p>
        </div>

        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="text-xs text-gray-500">
            Outstanding Amount
          </p>

          <p className="mt-1 text-sm font-semibold text-gray-700">
            ₹{(loan.outstandingAmount || 0).toLocaleString(
              "en-IN"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default EMICard;
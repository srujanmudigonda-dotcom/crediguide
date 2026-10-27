import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

function PaymentCard() {
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUpcomingPayment = async () => {
      try {
        const response = await api.get("/loans");

        const loans = Array.isArray(response.data?.loans)
          ? response.data.loans
          : Array.isArray(response.data)
          ? response.data
          : [];

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
        console.error("Upcoming Payment Error:", error);
        setLoan(null);
      } finally {
        setLoading(false);
      }
    };

    loadUpcomingPayment();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
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
            Checking upcoming payments...
          </p>
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
          <h3 className="text-lg font-semibold text-gray-700">
            Upcoming Payment
          </h3>

          <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
            No upcoming payment is currently due.
          </p>

          <Link
            to="/payments"
            className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            View Payments
          </Link>
        </div>
      </div>
    );
  }

  const amount = loan.emiAmount || loan.minimumDue || 0;
  const daysUntilDue = getDaysUntilDue(loan.dueDate);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-700">
          Upcoming Payment
        </h3>

        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">
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
          Amount Due
        </p>

        <p className="mt-2 text-3xl font-bold text-gray-800">
          ₹{amount.toLocaleString("en-IN")}
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

        <Link
          to="/payments"
          className="mt-5 block w-full rounded-lg bg-blue-600 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
        >
          View Payments
        </Link>
      </div>
    </div>
  );
}

export default PaymentCard;
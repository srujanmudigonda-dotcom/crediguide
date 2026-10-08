import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUpcomingPayments } from "../services/paymentService";

function PaymentCard() {
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getUpcomingPayments();
        const payments = response.payments || [];
        const cardPayment =
          payments.find((p) => p.type === "Credit Card") || payments[0];

        setPayment(cardPayment || null);
      } catch (error) {
        console.error("Payment Card Error:", error);
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
        <h3 className="text-lg font-semibold text-gray-700">
          Upcoming Payment
        </h3>

        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600">
          {payment ? payment.type : "Credit Card"}
        </span>
      </div>

      {loading ? (
        <div className="mt-6 flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        </div>
      ) : payment ? (
        <div className="mt-6">
          <p className="text-sm text-gray-500">{payment.title}</p>

          <p className="mt-2 text-3xl font-bold text-gray-800">
            ₹{Number(payment.amount).toLocaleString("en-IN")}
          </p>

          <div className="mt-4 rounded-lg bg-red-50 p-3">
            <p className="text-sm font-medium text-red-600">Due Date</p>

            <p className="mt-1 text-sm text-red-500">
              {formatDate(payment.dueDate)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/payments")}
            className="mt-5 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            View Payment
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <p className="text-sm leading-6 text-gray-500">
            No upcoming payments. Add a bill or EMI on the Payments page to
            track it here.
          </p>

          <button
            type="button"
            onClick={() => navigate("/payments")}
            className="mt-5 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Go to Payments
          </button>
        </div>
      )}
    </div>
  );
}

export default PaymentCard;

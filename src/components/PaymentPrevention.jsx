
import { useEffect, useState } from "react";
import paymentPreventionService from "../services/paymentPreventionService";

function PaymentPrevention() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await paymentPreventionService.getPaymentPreventionAlerts();

      if (response.success) {
        setAlerts(response.alerts || []);
      } else {
        setError(
          response.message ||
            "Unable to load payment prevention alerts."
        );
      }
    } catch (err) {
      console.error("Payment Prevention Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load payment prevention alerts."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-xl font-bold text-gray-800">
          Payment Prevention
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Stay ahead of upcoming and overdue loan payments.
        </p>
      </div>

      {loading && (
        <p className="text-sm text-gray-500">
          Checking your upcoming payments...
        </p>
      )}

      {!loading && error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && alerts.length === 0 && (
        <div className="rounded-lg bg-green-50 p-4">
          <p className="text-sm font-medium text-green-700">
            No payment alerts right now.
          </p>

          <p className="mt-1 text-sm text-green-600">
            Keep making your payments on or before their due dates.
          </p>
        </div>
      )}

      {!loading && !error && alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={`${alert.loanId}-${alert.type}`}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-semibold text-gray-800">
                  {alert.loanName}
                </h4>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                  {alert.type}
                </span>
              </div>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                {alert.message}
              </p>

              {alert.amount > 0 && (
                <p className="mt-2 text-sm font-medium text-gray-700">
                  Payment amount: ₹
                  {alert.amount.toLocaleString("en-IN")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PaymentPrevention;

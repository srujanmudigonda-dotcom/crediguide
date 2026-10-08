import { useEffect, useState } from "react";
import { getCreditHealth } from "../services/creditService";

function CreditHealth() {
  const [creditData, setCreditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCreditHealth = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCreditHealth();

        if (response.success) {
          setCreditData(response);
        } else {
          setError(
            response.message || "Unable to load credit health."
          );
        }
      } catch (err) {
        console.error("Credit Health Error:", err);

        setError(
          err.response?.data?.message ||
            "Credit health is unavailable."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCreditHealth();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex min-h-[380px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

            <p className="mt-4 text-sm font-medium text-gray-500">
              Loading credit health...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !creditData) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex min-h-[380px] items-center justify-center">
          <div className="rounded-lg bg-yellow-50 p-5 text-center">
            <h3 className="text-lg font-semibold text-yellow-700">
              Credit Health
            </h3>

            <p className="mt-2 text-sm text-yellow-600">
              {error || "Credit health data is unavailable."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const health = creditData.health || {};

  const paymentHistory =
    Number(health.paymentHistory) || 0;

  const creditUtilization =
    Number(health.creditUtilization) || 0;

  const creditAge =
    Number(health.creditAge) || 0;

  const creditAccounts =
    Number(health.creditAccounts) || 0;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-700">
        Credit Health
      </h3>

      <div className="mt-6 space-y-5">

        {/* Payment History */}
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-gray-600">
              Payment History
            </span>

            <span className="font-semibold text-gray-800">
              {paymentHistory}%
            </span>
          </div>

          <div className="h-2 rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-green-500"
              style={{ width: `${paymentHistory}%` }}
            />
          </div>
        </div>

        {/* Credit Utilization */}
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-gray-600">
              Credit Utilization
            </span>

            <span className="font-semibold text-gray-800">
              {creditUtilization}%
            </span>
          </div>

          <div className="h-2 rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-500"
              style={{ width: `${creditUtilization}%` }}
            />
          </div>
        </div>

        {/* Credit Age */}
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-gray-600">
              Credit Age
            </span>

            <span className="font-semibold text-gray-800">
              {creditAge}%
            </span>
          </div>

          <div className="h-2 rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-purple-500"
              style={{ width: `${creditAge}%` }}
            />
          </div>
        </div>

        {/* Credit Accounts */}
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-gray-600">
              Credit Accounts
            </span>

            <span className="font-semibold text-gray-800">
              {creditAccounts}%
            </span>
          </div>

          <div className="h-2 rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-orange-500"
              style={{ width: `${creditAccounts}%` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

export default CreditHealth;
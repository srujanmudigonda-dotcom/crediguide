import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

function PaymentPrevention() {
  const [availableFunds, setAvailableFunds] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");

  const [alerts, setAlerts] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [recommendations, setRecommendations] =
    useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/payment-prevention/alerts",
        {
          params: {
            availableFunds: availableFunds || 0,
            monthlyIncome: monthlyIncome || 0,
          },
        }
      );

      if (response.data.success) {
        setAlerts(response.data.alerts || []);
        setAnalysis(
          response.data.financialAnalysis || null
        );
        setRecommendations(
          response.data.recommendations || []
        );
      }
    } catch (err) {
      console.error(
        "Payment Prevention Error:",
        err
      );

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

  const getSeverityClasses = (severity) => {
    if (severity === "High") {
      return "border-red-200 bg-red-50 text-red-700";
    }

    if (severity === "Medium") {
      return "border-yellow-200 bg-yellow-50 text-yellow-700";
    }

    return "border-green-200 bg-green-50 text-green-700";
  };

  const getRiskClasses = (risk) => {
    if (risk === "High") {
      return "bg-red-100 text-red-700";
    }

    if (risk === "Medium") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-green-100 text-green-700";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Intelligent Payment Prevention
              </h1>

              <p className="mt-1 text-sm text-gray-600">
                Identify upcoming payment risks before they
                become missed or late payments.
              </p>
            </div>

            {/* Financial Information */}
            <section className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800">
                Financial Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Enter your current financial situation to
                improve payment-risk analysis.
              </p>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Available Funds
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={availableFunds}
                    onChange={(e) =>
                      setAvailableFunds(e.target.value)
                    }
                    placeholder="Example: 25000"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Monthly Income
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={monthlyIncome}
                    onChange={(e) =>
                      setMonthlyIncome(e.target.value)
                    }
                    placeholder="Example: 50000"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <button
                onClick={loadAlerts}
                disabled={loading}
                className="mt-5 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Analyzing..."
                  : "Analyze Payment Risk"}
              </button>
            </section>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* Financial Analysis */}
            {analysis && (
              <section className="rounded-xl bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Payment Risk Analysis
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Based on your upcoming payment obligations
                      and available financial capacity.
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${getRiskClasses(
                      analysis.financialRisk
                    )}`}
                  >
                    {analysis.financialRisk} Risk
                  </span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">
                      Available Funds
                    </p>

                    <p className="mt-1 text-xl font-semibold text-gray-800">
                      ₹
                      {Number(
                        analysis.availableFunds || 0
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">
                      Monthly Income
                    </p>

                    <p className="mt-1 text-xl font-semibold text-gray-800">
                      ₹
                      {Number(
                        analysis.monthlyIncome || 0
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">
                      Upcoming Payments
                    </p>

                    <p className="mt-1 text-xl font-semibold text-gray-800">
                      ₹
                      {Number(
                        analysis.upcomingPaymentTotal || 0
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">
                      Estimated Shortfall
                    </p>

                    <p
                      className={`mt-1 text-xl font-semibold ${
                        Number(
                          analysis.paymentShortfall || 0
                        ) > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      ₹
                      {Number(
                        analysis.paymentShortfall || 0
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Alerts */}
            <section className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800">
                Payment Alerts
              </h2>

              <div className="mt-4 space-y-3">
                {alerts.length > 0 ? (
                  alerts.map((alert, index) => (
                    <div
                      key={`${alert.type}-${alert.loanId || "general"}-${index}`}
                      className={`rounded-lg border p-4 ${getSeverityClasses(
                        alert.severity
                      )}`}
                    >
                      <div className="flex flex-col justify-between gap-3 md:flex-row">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold">
                              {alert.type}
                            </span>

                            {alert.severity && (
                              <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-medium">
                                {alert.severity} Priority
                              </span>
                            )}
                          </div>

                          <p className="mt-2 text-sm">
                            {alert.message}
                          </p>
                        </div>

                        {Number(alert.amount || 0) > 0 && (
                          <div className="shrink-0">
                            <p className="text-sm font-semibold">
                              ₹
                              {Number(
                                alert.amount
                              ).toLocaleString("en-IN")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg bg-green-50 p-5">
                    <p className="font-medium text-green-700">
                      No payment alerts right now.
                    </p>

                    <p className="mt-1 text-sm text-green-600">
                      Your current loan records do not show
                      an immediate payment-prevention concern.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Recommendations */}
            <section className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800">
                Recommended Actions
              </h2>

              <div className="mt-4 space-y-3">
                {recommendations.length > 0 ? (
                  recommendations.map(
                    (recommendation, index) => (
                      <div
                        key={index}
                        className="rounded-lg bg-blue-50 p-4 text-sm text-gray-700"
                      >
                        {recommendation}
                      </div>
                    )
                  )
                ) : (
                  <p className="text-sm text-gray-500">
                    No additional recommendations at this time.
                  </p>
                )}
              </div>
            </section>

            {/* Disclaimer */}
            <div className="rounded-xl border border-gray-200 bg-gray-100 p-4">
              <p className="text-xs leading-5 text-gray-600">
                These payment-prevention alerts are educational
                estimates based on your CrediGuide loan records
                and the financial information you provide. They
                do not guarantee future credit-score changes.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default PaymentPrevention;
import { useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import emiRiskService from "../services/emiRiskService";

function EmiRiskPrediction() {
  const [availableFunds, setAvailableFunds] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePredict = async (event) => {
    event.preventDefault();

    setError("");
    setPrediction(null);

    if (!availableFunds || Number(availableFunds) < 0) {
      setError("Please enter valid available funds.");
      return;
    }

    if (!monthlyIncome || Number(monthlyIncome) < 0) {
      setError("Please enter valid monthly income.");
      return;
    }

    try {
      setLoading(true);

      const response =
        await emiRiskService.getEmiRiskPrediction({
          availableFunds: Number(availableFunds),
          monthlyIncome: Number(monthlyIncome),
        });

      if (response.success) {
        setPrediction(response.prediction);
      } else {
        setError(
          response.message ||
            "Unable to generate EMI risk prediction."
        );
      }
    } catch (err) {
      console.error("EMI Risk Prediction Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to generate EMI risk prediction."
      );
    } finally {
      setLoading(false);
    }
  };

  const getRiskClasses = (riskLevel) => {
    if (riskLevel === "High") {
      return "border-red-200 bg-red-50 text-red-700";
    }

    if (riskLevel === "Medium") {
      return "border-yellow-200 bg-yellow-50 text-yellow-700";
    }

    return "border-green-200 bg-green-50 text-green-700";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-800">
                EMI Default Risk Prediction
              </h1>

              <p className="mt-2 text-sm text-gray-600">
                Estimate your upcoming EMI payment risk using
                your available funds and recorded loan
                obligations.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-xl bg-white p-6 shadow-sm lg:col-span-1">
                <h2 className="text-lg font-semibold text-gray-800">
                  Financial Details
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Enter your current available funds and monthly
                  income.
                </p>

                <form
                  onSubmit={handlePredict}
                  className="mt-6 space-y-5"
                >
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Available Funds
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={availableFunds}
                      onChange={(event) =>
                        setAvailableFunds(
                          event.target.value
                        )
                      }
                      placeholder="Example: 50000"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
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
                      onChange={(event) =>
                        setMonthlyIncome(
                          event.target.value
                        )
                      }
                      placeholder="Example: 75000"
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Analyzing..."
                      : "Predict EMI Risk"}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2">
                {!prediction && !loading && (
                  <div className="flex min-h-[400px] items-center justify-center rounded-xl bg-white p-8 text-center shadow-sm">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        EMI Risk Analysis
                      </h2>

                      <p className="mt-2 max-w-md text-sm text-gray-500">
                        Enter your financial details and select
                        Predict EMI Risk to analyze your upcoming
                        payment obligations.
                      </p>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="flex min-h-[400px] items-center justify-center rounded-xl bg-white p-8 shadow-sm">
                    <p className="text-sm text-gray-600">
                      Analyzing your loan obligations...
                    </p>
                  </div>
                )}

                {prediction && !loading && (
                  <div className="space-y-6">
                    <div
                      className={`rounded-xl border p-6 ${getRiskClasses(
                        prediction.riskLevel
                      )}`}
                    >
                      <p className="text-sm font-medium">
                        EMI Default Risk
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <h2 className="text-3xl font-bold">
                          {prediction.riskLevel}
                        </h2>

                        <span className="rounded-full bg-white px-3 py-1 text-sm font-medium">
                          {prediction.riskDirection}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                          Available Funds
                        </p>

                        <p className="mt-2 text-2xl font-bold text-gray-800">
                          ₹
                          {Number(
                            prediction.availableFunds
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                          Monthly Income
                        </p>

                        <p className="mt-2 text-2xl font-bold text-gray-800">
                          ₹
                          {Number(
                            prediction.monthlyIncome
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                          Upcoming EMI Payments
                        </p>

                        <p className="mt-2 text-2xl font-bold text-gray-800">
                          ₹
                          {Number(
                            prediction.totalUpcomingPayments
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                          Payment Coverage
                        </p>

                        <p className="mt-2 text-2xl font-bold text-gray-800">
                          {prediction.coverageRatio}%
                        </p>
                      </div>
                    </div>

                    {prediction.shortfall > 0 && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                        <h3 className="font-semibold text-red-800">
                          Potential Shortfall
                        </h3>

                        <p className="mt-2 text-sm text-red-700">
                          You may have a shortfall of ₹
                          {Number(
                            prediction.shortfall
                          ).toLocaleString("en-IN")}{" "}
                          against your upcoming recorded
                          payments.
                        </p>
                      </div>
                    )}

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Priority Payments
                      </h3>

                      {prediction.priorityPayments.length ===
                      0 ? (
                        <p className="mt-4 text-sm text-gray-500">
                          No upcoming payments were identified.
                        </p>
                      ) : (
                        <div className="mt-4 space-y-3">
                          {prediction.priorityPayments.map(
                            (payment) => (
                              <div
                                key={payment.loanId}
                                className="rounded-lg border border-gray-200 p-4"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div>
                                    <p className="font-medium text-gray-800">
                                      {payment.loanName}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                      {payment.loanType}
                                    </p>
                                  </div>

                                  <p className="font-semibold text-gray-800">
                                    ₹
                                    {Number(
                                      payment.amount
                                    ).toLocaleString(
                                      "en-IN"
                                    )}
                                  </p>
                                </div>

                                <div className="mt-3 text-xs text-gray-500">
                                  Due in{" "}
                                  {payment.daysUntilDue} day
                                  {payment.daysUntilDue ===
                                  1
                                    ? ""
                                    : "s"}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Recommendations
                      </h3>

                      <ul className="mt-4 space-y-3">
                        {prediction.recommendations.map(
                          (recommendation, index) => (
                            <li
                              key={index}
                              className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700"
                            >
                              {recommendation}
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                      <p className="text-xs leading-5 text-gray-500">
                        {prediction.disclaimer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default EmiRiskPrediction;
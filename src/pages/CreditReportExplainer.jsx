import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import creditReportExplainerService from "../services/creditReportExplainerService";

function CreditReportExplainer() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await creditReportExplainerService.getCreditReportExplanation();

      if (response.success) {
        setReport(response.report);
      } else {
        setError(
          response.message ||
            "Unable to load credit report explanation."
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to load credit report explanation."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="flex">
          <Sidebar />

          <main className="flex-1 p-6">
            <div className="mx-auto max-w-6xl">
              <p className="text-gray-600">
                Analyzing your credit report...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="flex">
          <Sidebar />

          <main className="flex-1 p-6">
            <div className="mx-auto max-w-6xl">
              <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                <h2 className="text-lg font-semibold text-red-700">
                  Unable to load report
                </h2>

                <p className="mt-2 text-sm text-red-600">
                  {error}
                </p>

                <button
                  onClick={loadReport}
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const scoreChangePositive = report.scoreChange >= 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                AI Credit Report Explainer
              </h1>

              <p className="mt-1 text-sm text-gray-600">
                Understand your simulated credit profile,
                payment behavior and areas that may need
                attention.
              </p>
            </div>

            {/* Score Summary */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Current Simulated Score
                </p>

                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {report.currentScore}
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {report.scoreBand}
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Score Change
                </p>

                <p
                  className={`mt-2 text-3xl font-bold ${
                    scoreChangePositive
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {scoreChangePositive ? "+" : ""}
                  {report.scoreChange}
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  From starting score
                </p>
              </div>

              <div className="rounded-xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">
                  Credit Utilization
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-800">
                  {report.creditUtilization}%
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {report.utilizationStatus}
                </p>
              </div>
            </div>

            {/* Loan Overview */}
            <section className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800">
                Credit Overview
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div>
                  <p className="text-sm text-gray-500">
                    Total Loans
                  </p>
                  <p className="mt-1 text-xl font-semibold">
                    {report.totalLoans}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Active Loans
                  </p>
                  <p className="mt-1 text-xl font-semibold">
                    {report.activeLoans}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Paid Loans
                  </p>
                  <p className="mt-1 text-xl font-semibold">
                    {report.paidLoans}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Overdue Loans
                  </p>
                  <p className="mt-1 text-xl font-semibold">
                    {report.overdueLoans}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Missed Loans
                  </p>
                  <p className="mt-1 text-xl font-semibold">
                    {report.missedLoans}
                  </p>
                </div>
              </div>
            </section>

            {/* Payment Behavior */}
            <section className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800">
                Payment Behavior
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                {report.paymentBehavior}
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-sm text-gray-600">
                    On-Time Payments
                  </p>

                  <p className="mt-1 text-2xl font-bold text-green-700">
                    {report.totalOnTimePayments}
                  </p>
                </div>

                <div className="rounded-lg bg-yellow-50 p-4">
                  <p className="text-sm text-gray-600">
                    Late Payments
                  </p>

                  <p className="mt-1 text-2xl font-bold text-yellow-700">
                    {report.totalLatePayments}
                  </p>
                </div>

                <div className="rounded-lg bg-red-50 p-4">
                  <p className="text-sm text-gray-600">
                    Missed Payments
                  </p>

                  <p className="mt-1 text-2xl font-bold text-red-700">
                    {report.totalMissedPayments}
                  </p>
                </div>
              </div>
            </section>

            {/* Financial Summary */}
            <section className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800">
                Financial Summary
              </h2>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-500">
                    Total Amount
                  </p>

                  <p className="mt-1 text-xl font-semibold">
                    ₹{Number(report.totalAmount).toLocaleString("en-IN")}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Amount Paid
                  </p>

                  <p className="mt-1 text-xl font-semibold text-green-600">
                    ₹{Number(report.totalPaid).toLocaleString("en-IN")}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Outstanding
                  </p>

                  <p className="mt-1 text-xl font-semibold text-red-600">
                    ₹
                    {Number(
                      report.totalOutstanding
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </section>

            {/* Strengths and Concerns */}
            <div className="grid gap-6 md:grid-cols-2">
              <section className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-green-700">
                  Strengths
                </h2>

                <div className="mt-4 space-y-3">
                  {report.strengths.length > 0 ? (
                    report.strengths.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-lg bg-green-50 p-3 text-sm text-gray-700"
                      >
                        {item}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No major strengths identified yet.
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-red-700">
                  Areas of Concern
                </h2>

                <div className="mt-4 space-y-3">
                  {report.concerns.length > 0 ? (
                    report.concerns.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-lg bg-red-50 p-3 text-sm text-gray-700"
                      >
                        {item}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No major concerns identified.
                    </p>
                  )}
                </div>
              </section>
            </div>

            {/* Recommendations */}
            <section className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800">
                AI Recommendations
              </h2>

              <div className="mt-4 space-y-3">
                {report.recommendations.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="rounded-lg bg-blue-50 p-4 text-sm text-gray-700"
                    >
                      {item}
                    </div>
                  )
                )}
              </div>
            </section>

            {/* Disclaimer */}
            <div className="rounded-xl border border-gray-200 bg-gray-100 p-4">
              <p className="text-xs leading-5 text-gray-600">
                {report.disclaimer}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CreditReportExplainer;
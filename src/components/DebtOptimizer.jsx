
import { useEffect, useState } from "react";
import debtOptimizerService from "../services/debtOptimizerService";

function DebtOptimizer() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDebtPlan = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await debtOptimizerService.getDebtRepaymentPlan();

        if (data.success) {
          setPlan(data);
        } else {
          setError(
            data.message ||
              "Unable to generate your debt repayment plan."
          );
        }
      } catch (err) {
        console.error("Debt Optimizer Error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load your debt repayment plan."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDebtPlan();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800">
          AI Debt Repayment Optimizer
        </h3>

        <p className="mt-4 text-gray-500">
          Analyzing your loans and repayment priorities...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800">
          AI Debt Repayment Optimizer
        </h3>

        <p className="mt-4 text-red-600">{error}</p>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-800">
          AI Debt Repayment Optimizer
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          A personalized repayment order based on your loan
          balances, interest rates and payment behavior.
        </p>
      </div>

      {/* Summary */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm text-gray-500">
            Total Outstanding
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-800">
            ₹
            {(plan.totalOutstanding || 0).toLocaleString(
              "en-IN"
            )}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm text-gray-500">
            Monthly EMI
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-800">
            ₹
            {(plan.totalMonthlyEMI || 0).toLocaleString(
              "en-IN"
            )}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm text-gray-500">
            Active Loans
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-800">
            {plan.activeLoanCount || 0}
          </p>
        </div>
      </div>

      {/* Strategy */}
      <div className="mt-6 rounded-xl bg-blue-50 p-4">
        <p className="text-sm font-medium text-blue-700">
          Recommended Strategy
        </p>

        <p className="mt-1 text-lg font-semibold text-blue-900">
          {plan.strategy}
        </p>
      </div>

      {/* Repayment Order */}
      <div className="mt-8">
        <h4 className="text-lg font-semibold text-gray-800">
          Recommended Repayment Order
        </h4>

        <div className="mt-4 space-y-4">
          {plan.repaymentOrder?.map((loan) => (
            <div
              key={loan.loanId}
              className="rounded-xl border border-gray-200 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                    {loan.rank}
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-800">
                      {loan.loanName}
                    </h5>

                    <p className="mt-1 text-sm text-gray-500">
                      {loan.loanType}
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  Priority {loan.priorityScore}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-gray-500">
                    Outstanding
                  </p>

                  <p className="mt-1 font-semibold text-gray-800">
                    ₹
                    {(
                      loan.outstandingAmount || 0
                    ).toLocaleString("en-IN")}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    EMI
                  </p>

                  <p className="mt-1 font-semibold text-gray-800">
                    ₹
                    {(loan.emiAmount || 0).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Interest Rate
                  </p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {loan.interestRate || 0}%
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Due Date
                  </p>

                  <p className="mt-1 font-semibold text-gray-800">
                    {loan.dueDate
                      ? new Date(
                          loan.dueDate
                        ).toLocaleDateString("en-IN")
                      : "Not set"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-8">
        <h4 className="text-lg font-semibold text-gray-800">
          Recommendations
        </h4>

        <div className="mt-4 space-y-3">
          {plan.recommendations?.map(
            (recommendation, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <p className="text-sm leading-6 text-gray-700">
                  {recommendation}
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Disclaimer */}
      {plan.disclaimer && (
        <div className="mt-6 rounded-xl bg-blue-50 p-4">
          <p className="text-xs leading-5 text-blue-800">
            {plan.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}

export default DebtOptimizer;

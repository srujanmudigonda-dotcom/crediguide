import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import creditImpactService from "../services/creditImpactService";

function CreditImpactSimulator() {
  const [loans, setLoans] = useState([]);
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [amount, setAmount] = useState("");
  const [scenario, setScenario] = useState("on_time");

  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loansLoading, setLoansLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLoans = async () => {
      try {
        setLoansLoading(true);

        const response = await api.get("/loans");

        setLoans(response.data.loans || []);
      } catch (error) {
        console.error("Credit Impact Loan Error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load your loans."
        );
      } finally {
        setLoansLoading(false);
      }
    };

    loadLoans();
  }, []);

  const handleSimulation = async () => {
    try {
      setLoading(true);
      setError("");
      setSimulation(null);

      const data =
        await creditImpactService.simulateCreditImpact({
          scenario,
          loanId: selectedLoanId || undefined,
          amount: amount || undefined,
        });

      setSimulation(data.simulation);
    } catch (error) {
      console.error(
        "Credit Impact Simulation Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to generate the credit impact simulation."
      );
    } finally {
      setLoading(false);
    }
  };

  const getRiskClass = (direction) => {
    if (direction === "Positive") {
      return "border-green-200 bg-green-50 text-green-700";
    }

    if (direction === "Negative") {
      return "border-orange-200 bg-orange-50 text-orange-700";
    }

    if (direction === "Strongly Negative") {
      return "border-red-200 bg-red-50 text-red-700";
    }

    return "border-yellow-200 bg-yellow-50 text-yellow-700";
  };

  const getScenarioDescription = (value) => {
    switch (value) {
      case "on_time":
        return "Make the required payment on or before the due date.";

      case "minimum_due":
        return "Pay only the minimum amount required for the payment.";

      case "late_payment":
        return "Make the payment after the scheduled due date.";

      case "missed_payment":
        return "Do not make the required payment by the due date.";

      case "reduce_utilization":
        return "Reduce the outstanding balance on your credit card.";

      default:
        return "";
    }
  };

  const creditCards = loans.filter(
    (loan) => loan.loanType === "Credit Card"
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                Credit Impact Simulator
              </h2>

              <p className="mt-2 text-gray-500">
                Explore how different repayment behaviors may
                influence your overall credit risk.
              </p>
            </div>

            <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
              <h3 className="text-lg font-semibold text-blue-900">
                Educational Credit Simulation
              </h3>

              <p className="mt-2 text-sm leading-6 text-blue-800">
                Compare repayment scenarios and understand
                their possible direction of credit impact.
                This tool does not predict an exact CIBIL score
                change.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800">
                  Choose a Scenario
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Select the repayment behavior you want to
                  simulate.
                </p>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Scenario
                    </label>

                    <select
                      value={scenario}
                      onChange={(event) =>
                        setScenario(event.target.value)
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="on_time">
                        Pay on Time
                      </option>

                      <option value="minimum_due">
                        Pay Only Minimum Due
                      </option>

                      <option value="late_payment">
                        Pay Late
                      </option>

                      <option value="missed_payment">
                        Miss a Payment
                      </option>

                      <option value="reduce_utilization">
                        Reduce Credit-Card Utilization
                      </option>
                    </select>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-sm leading-6 text-gray-600">
                      {getScenarioDescription(scenario)}
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Loan or Credit Card
                    </label>

                    <select
                      value={selectedLoanId}
                      onChange={(event) =>
                        setSelectedLoanId(event.target.value)
                      }
                      disabled={loansLoading}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                    >
                      <option value="">
                        Overall Credit Profile
                      </option>

                      {loans.map((loan) => (
                        <option
                          key={loan._id}
                          value={loan._id}
                        >
                          {loan.loanName} — {loan.loanType}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(scenario === "minimum_due" ||
                    scenario === "reduce_utilization") && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Amount
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={amount}
                        onChange={(event) =>
                          setAmount(event.target.value)
                        }
                        placeholder="Enter amount"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSimulation}
                    disabled={loading}
                    className="w-full rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Analyzing Scenario..."
                      : "Simulate Credit Impact"}
                  </button>
                </div>
              </section>

              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800">
                  Current Credit Context
                </h3>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">
                      Loans & Accounts
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-800">
                      {loans.length}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">
                      Credit Cards
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-800">
                      {creditCards.length}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-gray-200 p-4">
                  <p className="text-sm leading-6 text-gray-600">
                    Your simulation uses your recorded CrediGuide
                    loan information where relevant. Actual
                    credit decisions depend on lender reporting,
                    credit-bureau information and other factors.
                  </p>
                </div>
              </section>
            </div>

            {simulation && (
              <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Simulation Result
                    </p>

                    <h3 className="mt-1 text-2xl font-bold text-gray-800">
                      {simulation.title}
                    </h3>
                  </div>

                  <div
                    className={`rounded-full border px-4 py-2 text-sm font-semibold ${getRiskClass(
                      simulation.riskDirection
                    )}`}
                  >
                    {simulation.riskDirection}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">
                      Current Simulated Score
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-800">
                      {simulation.currentScore || "—"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">
                      Risk Level
                    </p>

                    <p className="mt-1 text-lg font-bold text-gray-800">
                      {simulation.riskLevel}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">
                      Credit Utilization
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-800">
                      {simulation.utilization}%
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-800">
                    Why this matters
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {simulation.explanation}
                  </p>
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-800">
                    Recommended Actions
                  </h4>

                  <div className="mt-3 space-y-3">
                    {simulation.recommendations?.map(
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

                <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                  <p className="text-sm leading-6 text-yellow-800">
                    {simulation.disclaimer}
                  </p>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default CreditImpactSimulator;
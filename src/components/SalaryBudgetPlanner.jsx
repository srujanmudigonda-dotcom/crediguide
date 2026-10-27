import { useState } from "react";

function SalaryBudgetPlanner() {
  const [salary, setSalary] = useState("");
  const [budget, setBudget] = useState(null);

  const calculateBudget = () => {
    const monthlySalary = Number(salary);

    if (!monthlySalary || monthlySalary <= 0) {
      setBudget(null);
      return;
    }

    setBudget({
      essentials: monthlySalary * 0.5,
      savings: monthlySalary * 0.15,
      emergencyFund: monthlySalary * 0.1,
      investments: monthlySalary * 0.1,
      wants: monthlySalary * 0.1,
      buffer: monthlySalary * 0.05,
    });
  };

  const formatAmount = (amount) =>
    `₹${Math.round(amount).toLocaleString("en-IN")}`;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-gray-700">
          Salary & Budget Planner
        </h3>

        <p className="mt-1 text-sm text-gray-400">
          Get a simple monthly plan for expenses, savings and
          emergency funds.
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="number"
          min="1"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          placeholder="Enter monthly salary"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />

        <button
          type="button"
          onClick={calculateBudget}
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Calculate Budget
        </button>
      </div>

      {budget && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Essential Expenses
            </p>
            <p className="mt-1 text-lg font-bold text-gray-800">
              {formatAmount(budget.essentials)}
            </p>
            <p className="text-xs text-gray-400">50%</p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Savings
            </p>
            <p className="mt-1 text-lg font-bold text-gray-800">
              {formatAmount(budget.savings)}
            </p>
            <p className="text-xs text-gray-400">15%</p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Emergency Fund
            </p>
            <p className="mt-1 text-lg font-bold text-gray-800">
              {formatAmount(budget.emergencyFund)}
            </p>
            <p className="text-xs text-gray-400">10%</p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Investments
            </p>
            <p className="mt-1 text-lg font-bold text-gray-800">
              {formatAmount(budget.investments)}
            </p>
            <p className="text-xs text-gray-400">10%</p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Wants / Lifestyle
            </p>
            <p className="mt-1 text-lg font-bold text-gray-800">
              {formatAmount(budget.wants)}
            </p>
            <p className="text-xs text-gray-400">10%</p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Buffer
            </p>
            <p className="mt-1 text-lg font-bold text-gray-800">
              {formatAmount(budget.buffer)}
            </p>
            <p className="text-xs text-gray-400">5%</p>
          </div>
        </div>
      )}

      <p className="mt-5 text-xs leading-5 text-gray-400">
        These percentages are general educational suggestions.
        Your ideal budget may vary based on your income, loans,
        family responsibilities and financial goals.
      </p>
    </div>
  );
}

export default SalaryBudgetPlanner;
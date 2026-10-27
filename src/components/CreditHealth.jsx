
import { useEffect, useState } from "react";
import api from "../services/api";

function CreditHealth() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadCreditHealth = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/loans");

        if (!mounted) return;

        const loans = Array.isArray(response.data)
          ? response.data
          : response.data?.loans || [];

        const activeLoans = loans.filter(
          (loan) => loan.status !== "Paid"
        );

        /*
         * Payment History
         */
        const totalPayments = loans.reduce(
          (total, loan) =>
            total +
            Number(loan.onTimePayments || 0) +
            Number(loan.latePayments || 0) +
            Number(loan.missedPayments || 0),
          0
        );

        const onTimePayments = loans.reduce(
          (total, loan) =>
            total + Number(loan.onTimePayments || 0),
          0
        );

        const latePayments = loans.reduce(
          (total, loan) =>
            total + Number(loan.latePayments || 0),
          0
        );

        const missedPayments = loans.reduce(
          (total, loan) =>
            total + Number(loan.missedPayments || 0),
          0
        );

        let paymentHistory = 80;

        if (totalPayments > 0) {
          paymentHistory = Math.round(
            (onTimePayments / totalPayments) * 100
          );

          paymentHistory -= latePayments * 5;
          paymentHistory -= missedPayments * 15;
        }

        paymentHistory = Math.max(
          0,
          Math.min(100, paymentHistory)
        );

        /*
         * Credit Utilization
         */
        const creditCards = activeLoans.filter(
          (loan) =>
            loan.loanType === "Credit Card" &&
            Number(loan.creditLimit || 0) > 0
        );

        let creditUtilization = 90;

        if (creditCards.length > 0) {
          const utilizationTotal = creditCards.reduce(
            (total, loan) =>
              total + Number(loan.creditUtilization || 0),
            0
          );

          const averageUtilization =
            utilizationTotal / creditCards.length;

          if (averageUtilization <= 10) {
            creditUtilization = 100;
          } else if (averageUtilization <= 30) {
            creditUtilization = 85;
          } else if (averageUtilization <= 50) {
            creditUtilization = 65;
          } else if (averageUtilization <= 75) {
            creditUtilization = 45;
          } else {
            creditUtilization = 25;
          }
        }

        /*
         * Credit Age
         */
        let creditAge = 70;

        if (loans.length > 0) {
          const oldestLoan = loans.reduce((oldest, loan) => {
            if (!loan.startDate) return oldest;

            if (!oldest?.startDate) return loan;

            return new Date(loan.startDate) <
              new Date(oldest.startDate)
              ? loan
              : oldest;
          }, null);

          if (oldestLoan?.startDate) {
            const monthsActive =
              (new Date() -
                new Date(oldestLoan.startDate)) /
              (1000 * 60 * 60 * 24 * 30);

            if (monthsActive >= 60) {
              creditAge = 100;
            } else if (monthsActive >= 36) {
              creditAge = 90;
            } else if (monthsActive >= 24) {
              creditAge = 80;
            } else if (monthsActive >= 12) {
              creditAge = 70;
            } else {
              creditAge = 60;
            }
          }
        }

        /*
         * Credit Accounts
         */
        let creditAccounts = 50;

        if (activeLoans.length === 0) {
          creditAccounts = 70;
        } else if (activeLoans.length === 1) {
          creditAccounts = 70;
        } else if (activeLoans.length <= 3) {
          creditAccounts = 85;
        } else if (activeLoans.length <= 5) {
          creditAccounts = 75;
        } else {
          creditAccounts = 60;
        }

        /*
         * Overall Health
         */
        const overallHealth = Math.round(
          paymentHistory * 0.5 +
            creditUtilization * 0.25 +
            creditAge * 0.1 +
            creditAccounts * 0.15
        );

        if (mounted) {
          setHealthData({
            overallHealth,
            paymentHistory,
            creditUtilization,
            creditAge,
            creditAccounts,
            totalLoans: loans.length,
          });
        }
      } catch (error) {
        console.error("Credit Health Error:", error);

        if (mounted) {
          setError(
            error.response?.data?.message ||
              "Unable to calculate simulated credit health."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCreditHealth();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex min-h-[380px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

            <p className="mt-4 text-sm font-medium text-gray-500">
              Calculating simulated credit health...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !healthData) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex min-h-[380px] flex-col items-center justify-center text-center">
          <h3 className="text-xl font-semibold text-gray-800">
            Credit Health
          </h3>

          <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
            {error ||
              "Simulated credit health could not be calculated."}
          </p>
        </div>
      </div>
    );
  }

  const {
    overallHealth,
    paymentHistory,
    creditUtilization,
    creditAge,
    creditAccounts,
  } = healthData;

  const getHealthLabel = (value) => {
    if (value >= 80) return "Excellent";
    if (value >= 70) return "Good";
    if (value >= 60) return "Fair";
    return "Needs Improvement";
  };

  const getHealthTextClass = (value) => {
    if (value >= 80) return "text-green-600";
    if (value >= 70) return "text-green-600";
    if (value >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getBarClass = (value) => {
    if (value >= 80) return "bg-green-500";
    if (value >= 70) return "bg-green-400";
    if (value >= 60) return "bg-yellow-400";
    return "bg-red-400";
  };

  const healthItems = [
    {
      name: "Payment History",
      value: paymentHistory,
    },
    {
      name: "Credit Utilization",
      value: creditUtilization,
    },
    {
      name: "Credit Age",
      value: creditAge,
    },
    {
      name: "Credit Accounts",
      value: creditAccounts,
    },
  ];

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">
            Simulated Credit Health
          </h3>

          <p className="mt-1 text-sm text-gray-400">
            Based on your loans and payment behavior
          </p>
        </div>

        <span
          className={`text-sm font-semibold ${getHealthTextClass(
            overallHealth
          )}`}
        >
          {getHealthLabel(overallHealth)}
        </span>
      </div>

      {/* Overall Health */}
      <div className="mt-6 rounded-xl bg-slate-50 p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Overall Credit Health
            </p>

            <p className="mt-1 text-4xl font-bold text-gray-800">
              {overallHealth}
            </p>
          </div>

          <p
            className={`text-sm font-semibold ${getHealthTextClass(
              overallHealth
            )}`}
          >
            {getHealthLabel(overallHealth)}
          </p>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full rounded-full transition-all ${getBarClass(
              overallHealth
            )}`}
            style={{ width: `${overallHealth}%` }}
          />
        </div>

        <div className="mt-2 flex justify-between text-xs text-gray-400">
          <span>0</span>
          <span>100</span>
        </div>
      </div>

      {/* Health Factors */}
      <div className="mt-6 space-y-5">
        {healthItems.map((item) => (
          <div key={item.name}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {item.name}
              </span>

              <span className="text-sm font-semibold text-gray-600">
                {item.value}
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all ${getBarClass(
                  item.value
                )}`}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Simulation Notice */}
      <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
        <p className="text-xs leading-5 text-blue-700">
          This is an educational CrediGuide simulation based on
          your loan and payment behavior. It is not your actual
          TransUnion CIBIL score or official credit health report.
        </p>
      </div>
    </div>
  );
}

export default CreditHealth;

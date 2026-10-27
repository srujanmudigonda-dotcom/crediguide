import { useEffect, useState } from "react";
import api from "../services/api";

function ImprovementPlanCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const [scoreResponse, loansResponse] = await Promise.all([
          api.get("/cibil-simulator"),
          api.get("/loans"),
        ]);

        const scoreData = scoreResponse.data;
        const loansData = loansResponse.data;

        const currentScore = scoreData?.currentScore || 0;
        const loans = loansData?.loans || [];

        let onTimePayments = 0;
        let latePayments = 0;
        let missedPayments = 0;
        let totalOutstanding = 0;

        loans.forEach((loan) => {
          onTimePayments += loan.onTimePayments || 0;
          latePayments += loan.latePayments || 0;
          missedPayments += loan.missedPayments || 0;
          totalOutstanding += loan.outstandingAmount || 0;
        });

        const recommendations = [];

        if (missedPayments > 0) {
          recommendations.push({
            title: "Avoid missed payments",
            priority: "High",
            description:
              "You have missed payment activity. Make every future EMI payment on or before the due date to prevent further decreases in your simulated score.",
          });
        }

        if (latePayments > 0) {
          recommendations.push({
            title: "Reduce late payments",
            priority: "High",
            description:
              "Your payment history contains late payments. Try to pay before the due date and set reminders several days in advance.",
          });
        }

        const creditCards = loans.filter(
          (loan) =>
            loan.loanType === "Credit Card" &&
            loan.creditUtilization >= 30
        );

        if (creditCards.length > 0) {
          recommendations.push({
            title: "Reduce credit utilization",
            priority: "Medium",
            description:
              "Your credit card utilization is relatively high. Reducing outstanding balances can help maintain healthier simulated credit behavior.",
          });
        }

        if (totalOutstanding > 0) {
          recommendations.push({
            title: "Reduce outstanding balances",
            priority: "Medium",
            description: `You currently have approximately ₹${totalOutstanding.toLocaleString(
              "en-IN"
            )} in outstanding loan balances. Continue covering all required EMIs and consider reducing outstanding debt when financially possible.`,
          });
        }

        recommendations.push({
          title: "Maintain on-time payments",
          priority: "Medium",
          description:
            "Continue making all EMI and minimum-due payments on or before their due dates. Consistent positive payment behavior is important in this educational simulation.",
        });

        if (currentScore < 700) {
          recommendations.push({
            title: "Build consistent credit behavior",
            priority: "Medium",
            description:
              "Your simulated score is below 700. Focus on consistent on-time payments, avoiding missed payments, and gradually reducing outstanding balances.",
          });
        } else if (currentScore < 750) {
          recommendations.push({
            title: "Strengthen your credit behavior",
            priority: "Medium",
            description:
              "Your simulated score is in a moderate range. Continue making payments on time and avoid unnecessary increases in outstanding debt.",
          });
        } else {
          recommendations.push({
            title: "Maintain healthy credit behavior",
            priority: "Low",
            description:
              "Your simulated score is in a stronger range. Continue making payments on time and maintain responsible borrowing behavior.",
          });
        }

        setData({
          currentScore,
          onTimePayments,
          latePayments,
          missedPayments,
          recommendations,
        });
      } catch (error) {
        console.error("Improvement Plan Error:", error);

        setData({
          currentScore: 0,
          onTimePayments: 0,
          latePayments: 0,
          missedPayments: 0,
          recommendations: [
            {
              title: "Maintain on-time payments",
              priority: "Medium",
              description:
                "Continue making your loan payments on or before their due dates to maintain positive simulated credit behavior.",
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex min-h-[260px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

            <p className="mt-4 text-sm font-medium text-gray-500">
              Preparing your improvement plan...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-gray-700">
          Credit Improvement Plan
        </h3>

        <p className="mt-1 text-sm text-gray-400">
          Personalized recommendations based on your simulated score,
          loans and payment behavior.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium text-gray-500">
            Simulated Score
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-800">
            {data.currentScore}
          </p>
        </div>

        <div className="rounded-xl border border-green-100 bg-green-50 p-4">
          <p className="text-xs font-medium text-green-700">
            On-Time Payments
          </p>

          <p className="mt-2 text-2xl font-bold text-green-700">
            {data.onTimePayments}
          </p>
        </div>

        <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-4">
          <p className="text-xs font-medium text-yellow-700">
            Late Payments
          </p>

          <p className="mt-2 text-2xl font-bold text-yellow-700">
            {data.latePayments}
          </p>
        </div>

        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-xs font-medium text-red-700">
            Missed Payments
          </p>

          <p className="mt-2 text-2xl font-bold text-red-700">
            {data.missedPayments}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {data.recommendations.map((item, index) => (
          <div
            key={`${item.title}-${index}`}
            className="rounded-xl border border-gray-200 p-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <h4 className="font-semibold text-gray-800">
                {item.title}
              </h4>

              <span
                className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                  item.priority === "High"
                    ? "bg-red-50 text-red-600"
                    : item.priority === "Medium"
                    ? "bg-yellow-50 text-yellow-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {item.priority}
              </span>
            </div>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
        <p className="text-xs leading-5 text-blue-700">
          CrediGuide provides an educational simulation based on your
          entered starting score, loans and recorded payment behavior.
          This is not your actual TransUnion CIBIL score and does not use
          the proprietary CIBIL scoring formula.
        </p>
      </div>
    </div>
  );
}

export default ImprovementPlanCard;
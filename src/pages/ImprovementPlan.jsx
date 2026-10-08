import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { getImprovementPlan } from "../services/creditService";

const genericActions = [
  {
    title: "Pay bills before the due date",
    description:
      "Make credit card and EMI payments on or before their due dates to maintain a consistent payment history.",
  },
  {
    title: "Manage credit utilization",
    description:
      "Keep your outstanding credit card balances at a manageable level compared with your available credit.",
  },
  {
    title: "Avoid unnecessary credit applications",
    description:
      "Apply for new credit only when needed and avoid making multiple applications within a short period.",
  },
  {
    title: "Monitor your credit report",
    description:
      "Regularly review your credit information and check for unfamiliar or incorrect account information.",
  },
];

const priorityStyles = {
  High: "bg-red-100 text-red-600",
  Medium: "bg-orange-100 text-orange-600",
  Low: "bg-green-100 text-green-600",
};

function ImprovementPlan() {
  const [plan, setPlan] = useState([]);
  const [timeline, setTimeline] = useState("");
  const [personalized, setPersonalized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getImprovementPlan();

        if (response.success && response.plan?.length > 0) {
          setPlan(response.plan);
          setTimeline(response.estimatedTimeline || "");
          setPersonalized(true);
        } else {
          setPlan(genericActions);
        }
      } catch (error) {
        console.error("Improvement Plan Error:", error);
        setPlan(genericActions);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                Improvement Plan
              </h2>

              <p className="mt-2 text-gray-500">
                {personalized
                  ? "A plan generated from your current credit health factors."
                  : "Follow these actions to support healthier credit behavior."}
              </p>
            </div>

            {/* Summary */}
            <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">
                  Your Action Plan
                </h3>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    personalized
                      ? "bg-green-100 text-green-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {personalized ? "Personalized" : "General Guidance"}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                {personalized
                  ? "These actions are selected from your latest credit score factors, with the highest-impact items first."
                  : "General credit-health guidance. Once credit data is available for your account, this plan is generated from your own credit factors."}
              </p>
            </div>

            {/* Actions */}
            {loading ? (
              <div className="flex items-center justify-center rounded-2xl bg-white p-12 shadow-sm">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
              </div>
            ) : (
              <div className="space-y-4">
                {plan.map((action, index) => (
                  <div
                    key={action.title}
                    className="flex gap-4 rounded-2xl bg-white p-6 shadow-sm"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-gray-800">
                          {action.title}
                        </h4>

                        {action.priority && (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityStyles[action.priority] || "bg-gray-100 text-gray-600"}`}
                          >
                            {action.priority} priority
                          </span>
                        )}
                      </div>

                      <p className="mt-1.5 text-sm leading-6 text-gray-500">
                        {action.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Timeline note */}
            <div className="mt-6 rounded-2xl bg-blue-50 p-6">
              <p className="text-sm font-semibold text-blue-700">
                Estimated improvement period
              </p>

              <p className="mt-1 text-sm leading-6 text-blue-600">
                {timeline ||
                  "Positive credit behavior can take time to appear in credit information. The actual timing varies by individual and reporting cycles."}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ImprovementPlan;

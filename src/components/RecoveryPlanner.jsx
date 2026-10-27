
import { useEffect, useState } from "react";
import recoveryService from "../services/recoveryService";

function RecoveryPlanner() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecoveryPlan = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await recoveryService.getRecoveryPlan();

        if (data.success) {
          setPlan(data);
        } else {
          setError(
            data.message || "Unable to load your recovery plan."
          );
        }
      } catch (err) {
        console.error("Recovery Planner Error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load your credit recovery plan."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRecoveryPlan();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800">
          Credit Health Recovery Planner
        </h3>

        <p className="mt-4 text-gray-500">
          Analyzing your loan and payment behavior...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800">
          Credit Health Recovery Planner
        </h3>

        <p className="mt-4 text-red-600">{error}</p>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  const getPriorityClass = (priority) => {
    if (priority === "High") {
      return "bg-red-50 text-red-700 border-red-200";
    }

    if (priority === "Medium") {
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }

    return "bg-green-50 text-green-700 border-green-200";
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-xl font-bold text-gray-800">
          Credit Health Recovery Planner
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Personalized actions to improve your simulated credit health.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm text-gray-500">
            Simulated Score
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-800">
            {plan.currentScore || 0}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm text-gray-500">
            Health Status
          </p>

          <p className="mt-2 text-xl font-bold text-gray-800">
            {plan.healthStatus}
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm text-gray-500">
            Recovery Progress
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-800">
            {plan.progress}%
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">
            Recovery Progress
          </span>

          <span className="text-sm font-semibold text-gray-800">
            {plan.progress}%
          </span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${Math.min(
                100,
                Math.max(0, plan.progress || 0)
              )}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">
            On-Time Payments
          </p>

          <p className="mt-1 text-2xl font-bold text-green-600">
            {plan.totalOnTimePayments || 0}
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">
            Late Payments
          </p>

          <p className="mt-1 text-2xl font-bold text-yellow-600">
            {plan.totalLatePayments || 0}
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">
            Missed Payments
          </p>

          <p className="mt-1 text-2xl font-bold text-red-600">
            {plan.totalMissedPayments || 0}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h4 className="text-lg font-semibold text-gray-800">
          Recommended Actions
        </h4>

        <div className="mt-4 space-y-4">
          {plan.actions?.map((action, index) => (
            <div
              key={`${action.title}-${index}`}
              className="rounded-xl border border-gray-200 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h5 className="font-semibold text-gray-800">
                  {action.title}
                </h5>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPriorityClass(
                    action.priority
                  )}`}
                >
                  {action.priority} Priority
                </span>
              </div>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                {action.description}
              </p>
            </div>
          ))}
        </div>
      </div>

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

export default RecoveryPlanner;

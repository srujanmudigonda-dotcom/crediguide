import { useNavigate } from "react-router-dom";

function ImprovementPlanCard() {
  const navigate = useNavigate();
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-700">
          Improvement Plan
        </h3>

        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-600">
          Personalized
        </span>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Follow these actions consistently to support better credit health.
      </p>

      <div className="mt-5 space-y-4">

        <div className="flex gap-3">
          <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm text-green-600">
            ✓
          </div>

          <div>
            <p className="font-medium text-gray-700">
              Pay bills before the due date
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Maintain a consistent on-time payment history.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm text-blue-600">
            ✓
          </div>

          <div>
            <p className="font-medium text-gray-700">
              Manage credit utilization
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Keep balances at a manageable level relative to available credit.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm text-purple-600">
            ✓
          </div>

          <div>
            <p className="font-medium text-gray-700">
              Avoid unnecessary credit applications
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Apply for new credit only when it is needed.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm text-orange-600">
            ✓
          </div>

          <div>
            <p className="font-medium text-gray-700">
              Monitor your credit report
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Review your credit information regularly for changes or errors.
            </p>
          </div>
        </div>

      </div>

      <div className="mt-6 rounded-lg bg-blue-50 p-4">
        <p className="text-sm font-semibold text-blue-700">
          Estimated improvement period
        </p>

        <p className="mt-1 text-sm text-blue-600">
          Positive credit behavior can take time to appear in credit
          information. The actual timing varies by individual and reporting
          cycles.
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigate("/improvement-plan")}
        className="mt-5 w-full rounded-lg bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700">
        View Full Improvement Plan
      </button>
    </div>
  );
}

export default ImprovementPlanCard;
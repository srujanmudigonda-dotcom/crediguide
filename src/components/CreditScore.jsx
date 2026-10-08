import { useEffect, useState } from "react";
import { getCreditScore } from "../services/creditService";

function CreditScore() {
  const [creditData, setCreditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCreditScore = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCreditScore();

        if (response.success) {
          setCreditData(response);
        } else {
          setError(response.message || "Unable to load credit score.");
        }
      } catch (err) {
        console.error("Credit Score Error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load credit score."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCreditScore();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex min-h-[380px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="mt-4 text-sm font-medium text-gray-500">
              Loading credit score...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !creditData) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex min-h-[380px] items-center justify-center">
          <div className="rounded-lg bg-red-50 p-5 text-center">
            <h3 className="text-lg font-semibold text-red-700">
              Credit Score
            </h3>

            <p className="mt-2 text-sm text-red-600">
              {error || "Credit score data is unavailable."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const score = Number(creditData.score);
  const minScore = Number(creditData.range?.min) || 300;
  const maxScore = Number(creditData.range?.max) || 900;

  const percentage = Math.max(
    0,
    Math.min(
      100,
      ((score - minScore) / (maxScore - minScore)) * 100
    )
  );

  const status = creditData.status || "Unknown";

  const statusClass =
    status === "Excellent"
      ? "bg-green-100 text-green-600"
      : status === "Good"
      ? "bg-green-100 text-green-600"
      : status === "Fair"
      ? "bg-yellow-100 text-yellow-600"
      : "bg-red-100 text-red-600";

  const statusTextClass =
    status === "Excellent"
      ? "text-green-600"
      : status === "Good"
      ? "text-green-600"
      : status === "Fair"
      ? "text-yellow-600"
      : "text-red-600";

  const formattedDate = creditData.lastUpdated
    ? new Date(creditData.lastUpdated).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Recently";

  /*
    SVG semicircle:
    radius = 100
    semicircle length = PI * 100
  */
  const radius = 100;
  const circumference = Math.PI * radius;

  const progressOffset =
    circumference - (percentage / 100) * circumference;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">
            Credit Score
          </h3>

          <p className="mt-1 text-sm text-gray-400">
            Your latest credit score
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
        >
          {status}
        </span>
      </div>

      {/* Speedometer */}
      <div className="relative mx-auto mt-6 h-[220px] w-full max-w-[360px]">

        <svg
          viewBox="0 0 240 140"
          className="h-full w-full overflow-visible"
        >
          {/* Background arc */}
          <path
            d="M 20 120 A 100 100 0 0 1 220 120"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* Score progress arc */}
          <path
            d="M 20 120 A 100 100 0 0 1 220 120"
            fill="none"
            stroke="#2563eb"
            strokeWidth="18"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
          />

          {/* Minimum label */}
          <text
            x="18"
            y="137"
            fontSize="10"
            fill="#9ca3af"
            textAnchor="start"
          >
            {minScore}
          </text>

          {/* Maximum label */}
          <text
            x="222"
            y="137"
            fontSize="10"
            fill="#9ca3af"
            textAnchor="end"
          >
            {maxScore}
          </text>
        </svg>

        {/* Center score */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center">
          <p className="text-5xl font-bold text-gray-800">
            {score}
          </p>

          <p
            className={`mt-1 text-sm font-semibold ${statusTextClass}`}
          >
            {status}
          </p>
        </div>
      </div>

      {/* Score Range */}
      <div className="mt-1 flex justify-between px-8 text-xs text-gray-400">
        <span>{minScore}</span>
        <span>{maxScore}</span>
      </div>

      {/* Status */}
      <div className="mt-5 rounded-lg bg-blue-50 p-3 text-center">
        <p className="text-sm font-medium text-blue-700">
          Credit score range: {minScore} - {maxScore}
        </p>

        <p className="mt-1 text-xs text-blue-500">
          Updated {formattedDate}
        </p>
      </div>

      {/* Source */}
      {creditData.source && (
        <p className="mt-3 text-center text-xs text-gray-400">
          Source: {creditData.source}
        </p>
      )}

    </div>
  );
}

export default CreditScore;
import { useEffect, useState } from "react";
import api from "../services/api";

function CreditScore() {
  const [simulator, setSimulator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadScore = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * Load the same simulated CIBIL score data used
         * by the score-history system.
         */
        const response = await api.get("/cibil-simulator");

        if (!mounted) return;

        const data = response?.data;

        if (data?.success && data?.simulator) {
          setSimulator(data.simulator);
        } else if (data?.simulator) {
          setSimulator(data.simulator);
        } else {
          setSimulator(null);
          setError(
            data?.message ||
              "Your simulated credit score is not available yet."
          );
        }
      } catch (error) {
        if (!mounted) return;

        console.error(
          "Simulated Credit Score Error:",
          error
        );

        setSimulator(null);

        setError(
          error.response?.data?.message ||
            "Unable to load your simulated credit score."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadScore();

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
              Loading simulated credit score...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!simulator) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex min-h-[380px] items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <span className="text-3xl font-bold text-blue-600">
                S
              </span>
            </div>

            <h3 className="mt-5 text-xl font-semibold text-gray-800">
              Simulated Credit Score
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Your simulated credit score will appear here after
              your starting score and payment behavior are recorded.
            </p>

            {error && (
              <p className="mt-3 text-xs text-gray-400">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  /*
   * IMPORTANT:
   * Use currentScore directly from the simulator.
   * Do NOT default to 300 when a valid score exists.
   */
  const score = Number(simulator.currentScore);

  const startingScore = Number(
    simulator.startingScore
  );

  const safeScore =
    Number.isFinite(score) && score >= 300
      ? Math.min(score, 900)
      : 300;

  const safeStartingScore =
    Number.isFinite(startingScore) &&
    startingScore >= 300
      ? Math.min(startingScore, 900)
      : safeScore;

  const minScore = 300;
  const maxScore = 900;

  const percentage =
    ((safeScore - minScore) /
      (maxScore - minScore)) *
    100;

  const getScoreStatus = (value) => {
    if (value >= 800) return "Excellent";
    if (value >= 750) return "Very Good";
    if (value >= 700) return "Good";
    if (value >= 650) return "Fair";
    return "Needs Improvement";
  };

  const status = getScoreStatus(safeScore);

  const statusClass =
    status === "Excellent"
      ? "bg-green-100 text-green-700"
      : status === "Very Good"
      ? "bg-emerald-100 text-emerald-700"
      : status === "Good"
      ? "bg-blue-100 text-blue-700"
      : status === "Fair"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

  const statusTextClass =
    status === "Excellent"
      ? "text-green-600"
      : status === "Very Good"
      ? "text-emerald-600"
      : status === "Good"
      ? "text-blue-600"
      : status === "Fair"
      ? "text-yellow-600"
      : "text-red-600";

  const scoreChange =
    safeScore - safeStartingScore;

  const scoreChangeText =
    scoreChange > 0
      ? `+${scoreChange}`
      : scoreChange;

  const scoreChangeClass =
    scoreChange > 0
      ? "text-green-600"
      : scoreChange < 0
      ? "text-red-600"
      : "text-gray-500";

  const history = simulator.scoreHistory || [];

  const latestHistory =
    history.length > 0
      ? history[history.length - 1]
      : null;

  const formattedDate =
    latestHistory?.date
      ? new Date(
          latestHistory.date
        ).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : simulator.updatedAt
      ? new Date(
          simulator.updatedAt
        ).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "Recently";

  /*
   * Semicircle gauge
   */
  const radius = 100;
  const circumference =
    Math.PI * radius;

  const progressOffset =
    circumference -
    (percentage / 100) *
      circumference;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">
            Simulated Credit Score
          </h3>

          <p className="mt-1 text-sm text-gray-400">
            Based on your starting score and payment behavior
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
        >
          {status}
        </span>
      </div>

      <div className="relative mx-auto mt-6 h-[220px] w-full max-w-[360px]">
        <svg
          viewBox="0 0 240 140"
          className="h-full w-full overflow-visible"
        >
          <path
            d="M 20 120 A 100 100 0 0 1 220 120"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="18"
            strokeLinecap="round"
          />

          <path
            d="M 20 120 A 100 100 0 0 1 220 120"
            fill="none"
            stroke="#2563eb"
            strokeWidth="18"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
          />

          <text
            x="18"
            y="137"
            fontSize="10"
            fill="#9ca3af"
            textAnchor="start"
          >
            300
          </text>

          <text
            x="222"
            y="137"
            fontSize="10"
            fill="#9ca3af"
            textAnchor="end"
          >
            900
          </text>
        </svg>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center">
          <p className="text-5xl font-bold text-gray-800">
            {safeScore}
          </p>

          <p
            className={`mt-1 text-sm font-semibold ${statusTextClass}`}
          >
            {status}
          </p>
        </div>
      </div>

      <div className="mt-1 flex justify-between px-8 text-xs text-gray-400">
        <span>300</span>
        <span>900</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-gray-50 p-4 text-center">
          <p className="text-xs font-medium text-gray-400">
            Starting Score
          </p>

          <p className="mt-1 text-xl font-bold text-gray-700">
            {safeStartingScore}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4 text-center">
          <p className="text-xs font-medium text-gray-400">
            Score Change
          </p>

          <p
            className={`mt-1 text-xl font-bold ${scoreChangeClass}`}
          >
            {scoreChangeText}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3">
        <p className="text-xs leading-5 text-blue-700">
          This is an educational score simulation. It is not your
          actual TransUnion CIBIL score and does not use the
          proprietary CIBIL scoring formula.
        </p>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400">
          Last updated {formattedDate}
        </p>
      </div>
    </div>
  );
}

export default CreditScore;
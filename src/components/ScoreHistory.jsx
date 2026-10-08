import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getScoreHistory } from "../services/creditService";

function ScoreHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getScoreHistory();

        if (response.success) {
          setHistory(
            (response.history || []).map((point) => ({
              month: new Date(point.scoreDate).toLocaleDateString("en-IN", {
                month: "short",
              }),
              score: point.score,
            }))
          );
        } else {
          setError(response.message || "Unable to load score history.");
        }
      } catch (err) {
        console.error("Score History Error:", err);
        setError("Unable to load score history.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const currentScore =
    history.length > 0 ? history[history.length - 1].score : null;
  const change =
    history.length > 1
      ? history[history.length - 1].score - history[0].score
      : null;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700">
          Credit Score History
        </h3>

        <p className="mt-1 text-sm text-gray-400">
          Track how your credit score has changed over time.
        </p>
      </div>

      {loading && (
        <div className="flex h-72 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        </div>
      )}

      {!loading && (error || history.length === 0) && (
        <div className="flex h-72 items-center justify-center rounded-lg bg-gray-50 p-5 text-center">
          <p className="text-sm text-gray-500">
            {error || "No score history is available for this account yet."}
          </p>
        </div>
      )}

      {!loading && history.length > 0 && (
        <>
          {/* Chart */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={history}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" tick={{ fontSize: 12 }} />

                <YAxis domain={[650, 800]} tick={{ fontSize: 12 }} />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{
                    r: 5,
                  }}
                  activeDot={{
                    r: 7,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Current Score */}
          <div className="mt-5 flex items-center justify-between rounded-lg bg-blue-50 p-4">
            <div>
              <p className="text-sm text-gray-500">Current Score</p>

              <p className="mt-1 text-2xl font-bold text-gray-800">
                {currentScore}
              </p>
            </div>

            {change !== null && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Change</p>

                <p
                  className={`mt-1 font-semibold ${
                    change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {change >= 0 ? "+" : ""}
                  {change} points
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ScoreHistory;

import { useEffect, useState } from "react";
import { getScoreHistory } from "../services/creditService";

function ScoreHistory() {
  const [scoreHistory, setScoreHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadScoreHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getScoreHistory();

        if (response?.success) {
          setScoreHistory(response.history || []);
        } else {
          setScoreHistory([]);
          setError(
            response?.message ||
              "Unable to load score history."
          );
        }
      } catch (error) {
        console.error("Score History Error:", error);

        setScoreHistory([]);

        setError(
          error.response?.data?.message ||
            "Unable to load score history."
        );
      } finally {
        setLoading(false);
      }
    };

    loadScoreHistory();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex min-h-[260px] items-center justify-center">
          <p className="text-sm text-gray-500">
            Loading score history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-gray-700">
          Score History
        </h3>

        <p className="mt-1 text-sm text-gray-400">
          Track changes in your simulated credit score over time.
        </p>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : scoreHistory.length === 0 ? (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
          <p className="text-sm text-gray-500">
            No score history is available yet.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {[...scoreHistory]
            .reverse()
            .map((item, index) => (
              <div
                key={
                  item._id ||
                  `${item.date}-${item.action}-${index}`
                }
                className="rounded-xl border border-gray-200 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {item.action}
                    </p>

                    {item.loanName && (
                      <p className="mt-1 text-sm text-gray-500">
                        {item.loanName}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-gray-400">
                      {item.date
                        ? new Date(item.date).toLocaleString(
                            "en-IN"
                          )
                        : "Date not available"}
                    </p>

                    {item.notes && (
                      <p className="mt-2 text-xs text-gray-500">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  <div className="text-left sm:text-right">
                    <p
                      className={`text-lg font-bold ${
                        Number(item.change) > 0
                          ? "text-green-600"
                          : Number(item.change) < 0
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}
                    >
                      {Number(item.change) > 0 ? "+" : ""}
                      {item.change}
                    </p>

                    <p className="text-sm text-gray-500">
                      {item.previousScore} → {item.newScore}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      <div className="mt-6 border-t border-gray-100 pt-5">
        <p className="text-xs leading-5 text-gray-400">
          This is an educational CrediGuide simulation based on
          your recorded payment behavior. It is not your actual
          TransUnion CIBIL score or an official credit report.
        </p>
      </div>
    </div>
  );
}

export default ScoreHistory;
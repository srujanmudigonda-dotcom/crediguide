import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ScoreHistoryChart from "../components/ScoreHistory";
import { getScoreHistory } from "../services/creditService";

function ScoreHistory() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getScoreHistory();
        const history = response.history || [];

        if (history.length > 0) {
          const scores = history.map((point) => point.score);
          const firstMonth = new Date(
            history[0].scoreDate
          ).toLocaleDateString("en-IN", { month: "long" });

          setStats({
            current: scores[scores.length - 1],
            highest: Math.max(...scores),
            change: scores[scores.length - 1] - scores[0],
            firstMonth,
          });
        }
      } catch (error) {
        console.error("Score History Stats Error:", error);
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
          <div className="mx-auto max-w-7xl">
            {/* Page Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                Score History
              </h2>

              <p className="mt-2 text-gray-500">
                Track changes in your credit score over time.
              </p>
            </div>

            {/* Score History Chart */}
            <ScoreHistoryChart />

            {/* Information Card */}
            <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-700">
                About Your Score History
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Your credit score can change over time based on factors such
                as payment behavior, credit utilization, account activity,
                and information reported by credit providers.
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-sm text-gray-500">Current Score</p>

                  <p className="mt-1 text-2xl font-bold text-gray-800">
                    {stats ? stats.current : "—"}
                  </p>
                </div>

                <div className="rounded-xl bg-green-50 p-4">
                  <p className="text-sm text-gray-500">Highest Score</p>

                  <p className="mt-1 text-2xl font-bold text-gray-800">
                    {stats ? stats.highest : "—"}
                  </p>
                </div>

                <div className="rounded-xl bg-purple-50 p-4">
                  <p className="text-sm text-gray-500">
                    Change Since {stats ? stats.firstMonth : "Start"}
                  </p>

                  <p
                    className={`mt-1 text-2xl font-bold ${
                      stats && stats.change < 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {stats
                      ? `${stats.change >= 0 ? "+" : ""}${stats.change}`
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ScoreHistory;
